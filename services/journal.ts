import type { Entry, Trip } from '@/types';

import { apiDelete, apiGet, apiPatch, apiPost } from './api';

interface TripsResponse {
  trips: Trip[];
}
interface EntriesResponse {
  entries: Entry[];
}
interface CreateResponse {
  id: string;
}

/**
 * Journal data access against the local backend. Replaces what used to be
 * `services/firestore.ts` — the server's per-user filter takes the place of
 * Firestore security rules (criteria A + B).
 */

// ---- Trips ----------------------------------------------------------------

export async function listTrips(): Promise<Trip[]> {
  const data = await apiGet<TripsResponse>('/trips');
  return data.trips;
}

export async function createTrip(
  data: Omit<Trip, 'id' | 'createdAt' | 'coverPhotoUrl' | 'story'> & { story?: string },
): Promise<string> {
  const res = await apiPost<CreateResponse>('/trips', data);
  return res.id;
}

export async function updateTrip(tripId: string, patch: Partial<Trip>): Promise<void> {
  await apiPatch(`/trips/${tripId}`, patch);
}

export async function deleteTrip(tripId: string): Promise<void> {
  await apiDelete(`/trips/${tripId}`);
}

// ---- Entries --------------------------------------------------------------

export async function listEntries(tripId: string): Promise<Entry[]> {
  const data = await apiGet<EntriesResponse>(`/trips/${tripId}/entries`);
  return data.entries;
}

export async function createEntry(
  tripId: string,
  data: Omit<Entry, 'id' | 'tripId' | 'createdAt' | 'photoUrl'>,
): Promise<string> {
  const res = await apiPost<CreateResponse>(`/trips/${tripId}/entries`, data);
  return res.id;
}

export async function updateEntry(
  tripId: string,
  entryId: string,
  patch: Partial<Entry>,
): Promise<void> {
  await apiPatch(`/trips/${tripId}/entries/${entryId}`, patch);
}

export async function deleteEntry(tripId: string, entryId: string): Promise<void> {
  await apiDelete(`/trips/${tripId}/entries/${entryId}`);
}
