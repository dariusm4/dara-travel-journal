import type { Entry, Trip } from '@/types';

import { apiPost } from './api';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatResponse {
  reply: string;
}

const COMPANION_SYSTEM: ChatMessage = {
  role: 'system',
  content:
    'You are Dara, a warm and concise travel companion. Give practical, specific suggestions ' +
    '(places, tips, logistics). Keep replies short unless asked for detail.',
};

/** Posts the conversation to the backend's OpenAI proxy. */
async function callAi(messages: ChatMessage[]): Promise<string> {
  const data = await apiPost<ChatResponse>('/ai/chat', { messages }, 60_000);
  if (!data.reply) throw new Error('The companion did not return a reply. Try again.');
  return data.reply;
}

export function chatWithCompanion(history: ChatMessage[]): Promise<string> {
  return callAi([COMPANION_SYSTEM, ...history]);
}

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
