import * as SecureStore from 'expo-secure-store';

import { config } from './config';
import { fetchJson } from './http';

/**
 * Thin authenticated client for the Dara backend. Persists the JWT in
 * SecureStore (criterion 14) and also keeps a synchronous in-memory copy so
 * the `photoSource()` helper can attach Authorization headers when
 * `expo-image` renders backend-served photos.
 */

const TOKEN_KEY = 'dara_jwt';

let currentToken: string | null = null;

export function getToken(): string | null {
  return currentToken;
}

export async function setToken(token: string | null): Promise<void> {
  currentToken = token;
  try {
    if (token) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
  } catch {
    // SecureStore is unavailable on web — keep the token in memory for this
    // session so the rest of the flow still works for smoke testing.
  }
}

/** Read a previously stored JWT into memory. Called once on app boot. */
export async function loadToken(): Promise<string | null> {
  try {
    currentToken = await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    currentToken = null;
  }
  return currentToken;
}

function fullUrl(path: string): string {
  return `${config.apiUrl}${path}`;
}

function withAuth(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { ...(extra ?? {}) };
  if (currentToken) headers.Authorization = `Bearer ${currentToken}`;
  return headers;
}

export function apiGet<T>(path: string, timeoutMs?: number): Promise<T> {
  return fetchJson<T>(fullUrl(path), { method: 'GET', headers: withAuth(), timeoutMs });
}

export function apiPost<T>(path: string, body: unknown, timeoutMs?: number): Promise<T> {
  return fetchJson<T>(fullUrl(path), {
    method: 'POST',
    headers: withAuth({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
    timeoutMs,
  });
}

export function apiPatch<T>(path: string, body: unknown): Promise<T> {
  return fetchJson<T>(fullUrl(path), {
    method: 'PATCH',
    headers: withAuth({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  });
}

export function apiDelete<T>(path: string): Promise<T> {
  return fetchJson<T>(fullUrl(path), { method: 'DELETE', headers: withAuth() });
}

/** Upload a multipart form (used for photo uploads). */
export function apiUpload<T>(path: string, form: FormData): Promise<T> {
  return fetchJson<T>(fullUrl(path), {
    method: 'POST',
    // Do NOT set Content-Type — fetch derives the multipart boundary.
    headers: withAuth(),
    body: form,
    timeoutMs: 30_000,
  });
}

/**
 * Build an Image source for a photo. Handles three shapes:
 *  - http(s):// — remote URL (e.g. Unsplash) → no auth header
 *  - file:// or content:// — local URI (just picked) → no auth header
 *  - /photos/abc.jpg — backend-served photo → prepend apiUrl + add bearer auth
 */
export function photoSource(urlOrPath: string): { uri: string; headers?: Record<string, string> } {
  if (urlOrPath.startsWith('http')) return { uri: urlOrPath };
  if (urlOrPath.startsWith('file:') || urlOrPath.startsWith('content:')) {
    return { uri: urlOrPath };
  }
  const uri = fullUrl(urlOrPath);
  return currentToken ? { uri, headers: { Authorization: `Bearer ${currentToken}` } } : { uri };
}
