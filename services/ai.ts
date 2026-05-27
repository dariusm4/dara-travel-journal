import type { Entry, Trip } from '@/types';

import { config } from './config';
import { auth } from './firebase';
import { ApiError, fetchJson } from './http';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AiResponse {
  reply: string;
}

async function authHeader(): Promise<Record<string, string>> {
  const user = auth.currentUser;
  if (!user) throw new ApiError('You need to be signed in to use the companion.');
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

/** Calls the Cloud Function AI proxy with a list of chat messages. */
async function callAi(messages: ChatMessage[]): Promise<string> {
  if (!config.aiFunctionUrl) {
    throw new ApiError('The AI companion is not configured yet.');
  }
  const data = await fetchJson<AiResponse>(config.aiFunctionUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
    body: JSON.stringify({ messages }),
    timeoutMs: 30_000,
  });
  if (!data.reply) throw new ApiError('The companion did not return a reply. Try again.');
  return data.reply;
}

const COMPANION_SYSTEM: ChatMessage = {
  role: 'system',
  content:
    'You are Dara, a warm and concise travel companion. Give practical, specific suggestions ' +
    '(places, tips, logistics). Keep replies short unless asked for detail.',
};

/** Send the running conversation and get the assistant's next reply. */
export function chatWithCompanion(history: ChatMessage[]): Promise<string> {
  return callAi([COMPANION_SYSTEM, ...history]);
}

/** Turn a trip's entries into a short first-person narrative recap. */
export function generateTripStory(trip: Trip, entries: Entry[]): Promise<string> {
  const lines = entries
    .map((e) => {
      const place = e.location?.placeName ? ` (${e.location.placeName})` : '';
      return `- ${e.entryDate}${place}: ${e.title}. ${e.note}`.trim();
    })
    .join('\n');

  const prompt =
    `Write a warm, vivid first-person travel story (2–3 short paragraphs) recapping this trip. ` +
    `Do not invent events beyond the entries.\n\n` +
    `Trip: ${trip.title} — ${trip.destination} (${trip.startDate} to ${trip.endDate}).\n` +
    `Entries:\n${lines || 'No entries were recorded.'}`;

  return callAi([
    { role: 'system', content: 'You are a travel writer crafting concise, evocative trip recaps.' },
    { role: 'user', content: prompt },
  ]);
}
