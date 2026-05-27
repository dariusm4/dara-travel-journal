const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');

admin.initializeApp();

// The OpenAI key lives only here, as a Functions secret — never in the app
// bundle (criterion 14). Set it with: firebase functions:secrets:set OPENAI_API_KEY
const OPENAI_API_KEY = defineSecret('OPENAI_API_KEY');

const MODEL = 'gpt-4o-mini';

/**
 * AI proxy for Dara's travel companion. Verifies the caller's Firebase ID token,
 * forwards the chat messages to OpenAI, and returns the reply. The app never
 * sees the OpenAI key.
 */
exports.ai = onRequest({ secrets: [OPENAI_API_KEY], cors: true }, async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Require a valid Firebase session so the key can't be abused anonymously.
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: 'Missing auth token' });
    return;
  }
  try {
    await admin.auth().verifyIdToken(token);
  } catch {
    res.status(401).json({ error: 'Invalid auth token' });
    return;
  }

  const messages = req.body && req.body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'messages array is required' });
    return;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY.value()}`,
      },
      body: JSON.stringify({ model: MODEL, messages, max_tokens: 600, temperature: 0.8 }),
    });

    if (!response.ok) {
      const detail = await response.text();
      res
        .status(response.status)
        .json({ error: 'AI request failed', detail: detail.slice(0, 200) });
      return;
    }

    const data = await response.json();
    const reply = data.choices && data.choices[0] && data.choices[0].message.content;
    res.json({ reply: (reply || '').trim() });
  } catch (e) {
    res.status(500).json({ error: 'Internal error' });
  }
});
