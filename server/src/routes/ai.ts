import { Router } from 'express';
import { z } from 'zod';

import { requireAuth } from '../auth';

const MODEL = 'gpt-4o-mini';
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['system', 'user', 'assistant']),
        content: z.string().min(1).max(5000),
      }),
    )
    .min(1)
    .max(50),
});

interface OpenAiResponse {
  choices?: { message: { content: string } }[];
}

const router: Router = Router();
router.use(requireAuth);

router.post('/chat', async (req, res) => {
  const parse = chatSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: 'Invalid input', detail: parse.error.message });
    return;
  }
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    res.status(503).json({ error: 'AI companion is not configured on this server.' });
    return;
  }
  try {
    const upstream = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: MODEL,
        messages: parse.data.messages,
        max_tokens: 600,
        temperature: 0.8,
      }),
    });
    if (!upstream.ok) {
      const detail = await upstream.text();
      res
        .status(upstream.status)
        .json({ error: 'AI request failed', detail: detail.slice(0, 200) });
      return;
    }
    const data = (await upstream.json()) as OpenAiResponse;
    const reply = data.choices?.[0]?.message.content?.trim() ?? '';
    res.json({ reply });
  } catch {
    res.status(502).json({ error: 'Could not reach the AI provider.' });
  }
});

export default router;
