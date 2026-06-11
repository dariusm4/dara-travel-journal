import type { UserProfile } from '@/types';

import { apiGet, apiPost, setToken } from './api';
import { ApiError } from './http';

interface AuthResponse {
  token: string;
  user: UserProfile;
}

interface MeResponse {
  user: UserProfile;
}

export async function signUp(
  email: string,
  password: string,
  displayName?: string,
): Promise<UserProfile> {
  const res = await apiPost<AuthResponse>('/auth/register', { email, password, displayName });
  await setToken(res.token);
  return res.user;
}

export async function signIn(email: string, password: string): Promise<UserProfile> {
  const res = await apiPost<AuthResponse>('/auth/login', { email, password });
  await setToken(res.token);
  return res.user;
}

export async function signOutUser(): Promise<void> {
  await setToken(null);
}

/** Returns the current user, or null if the JWT is missing/expired. */
export async function fetchCurrentUser(): Promise<UserProfile | null> {
  try {
    const res = await apiGet<MeResponse>('/auth/me');
    return res.user;
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) {
      await setToken(null);
      return null;
    }
    throw e;
  }
}

/** Map a thrown error to a friendly auth-form message (criterion 12). */
export function authErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'Incorrect email or password.';
    if (error.status === 409) return 'An account already exists for that email.';
    if (error.status === 400) return 'Please check your email and password.';
    if (error.status === 429) return 'Too many attempts. Please wait and try again.';
    if (!error.status) return error.message; // network/timeout
  }
  return 'Something went wrong. Please try again.';
}
