import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';

import type { UserProfile } from '@/types';

import { auth } from './firebase';

/** Reduce a Firebase user to our serializable domain shape. */
export function mapUser(user: User | null): UserProfile | null {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email ?? '',
    displayName: user.displayName ?? undefined,
  };
}

/** Subscribe to auth changes (auto-login on relaunch). Returns an unsubscribe. */
export function subscribeToAuth(callback: (user: UserProfile | null) => void) {
  return onAuthStateChanged(auth, (u) => callback(mapUser(u)));
}

/** Map a Firebase auth error code to a human-readable message (criterion 12). */
export function mapAuthError(code: string): string {
  switch (code) {
    case 'auth/invalid-email':
      return 'That email address looks invalid.';
    case 'auth/email-already-in-use':
      return 'An account already exists for that email.';
    case 'auth/weak-password':
      return 'Password is too weak (minimum 6 characters).';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

/** Extract a friendly message from an unknown thrown value. */
export function authErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    return mapAuthError(String((error as { code: unknown }).code));
  }
  return mapAuthError('');
}

export async function signUp(email: string, password: string, displayName?: string) {
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
  if (displayName?.trim()) {
    await updateProfile(cred.user, { displayName: displayName.trim() });
  }
  return mapUser(cred.user);
}

export async function signIn(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  return mapUser(cred.user);
}

export async function signOutUser() {
  await signOut(auth);
}
