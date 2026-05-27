import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  type DocumentData,
  type FirestoreError,
} from 'firebase/firestore';

import type { Entry, Trip } from '@/types';

import { db } from './firebase';

/**
 * Firestore data access for the per-user journal (criterion A). Data lives at
 *   users/{uid}/trips/{tripId}/entries/{entryId}
 * so security rules can isolate each user's data (see firestore.rules).
 */

const tripsCol = (uid: string) => collection(db, 'users', uid, 'trips');
const tripRef = (uid: string, tripId: string) => doc(db, 'users', uid, 'trips', tripId);
const entriesCol = (uid: string, tripId: string) =>
  collection(db, 'users', uid, 'trips', tripId, 'entries');
const entryRef = (uid: string, tripId: string, entryId: string) =>
  doc(db, 'users', uid, 'trips', tripId, 'entries', entryId);

const toData = (patch: Partial<Trip> | Partial<Entry>) => patch as DocumentData;

// ---- Trips ----------------------------------------------------------------

export function subscribeToTrips(
  uid: string,
  onData: (trips: Trip[]) => void,
  onError: (error: FirestoreError) => void,
) {
  const q = query(tripsCol(uid), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Trip)),
    onError,
  );
}

export async function createTrip(uid: string, data: Omit<Trip, 'id'>): Promise<string> {
  const ref = await addDoc(tripsCol(uid), toData(data));
  return ref.id;
}

export async function updateTrip(uid: string, tripId: string, patch: Partial<Trip>): Promise<void> {
  await updateDoc(tripRef(uid, tripId), toData(patch));
}

/** Deletes a trip and all of its entries (best-effort cascade). */
export async function deleteTrip(uid: string, tripId: string): Promise<void> {
  const entries = await getDocs(entriesCol(uid, tripId));
  await Promise.all(entries.docs.map((d) => deleteDoc(d.ref)));
  await deleteDoc(tripRef(uid, tripId));
}

// ---- Entries --------------------------------------------------------------

export function subscribeToEntries(
  uid: string,
  tripId: string,
  onData: (entries: Entry[]) => void,
  onError: (error: FirestoreError) => void,
) {
  const q = query(entriesCol(uid, tripId), orderBy('entryDate', 'desc'));
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Entry)),
    onError,
  );
}

export async function createEntry(
  uid: string,
  tripId: string,
  data: Omit<Entry, 'id'>,
): Promise<string> {
  const ref = await addDoc(entriesCol(uid, tripId), toData(data));
  return ref.id;
}

export async function updateEntry(
  uid: string,
  tripId: string,
  entryId: string,
  patch: Partial<Entry>,
): Promise<void> {
  await updateDoc(entryRef(uid, tripId, entryId), toData(patch));
}

export async function deleteEntry(uid: string, tripId: string, entryId: string): Promise<void> {
  await deleteDoc(entryRef(uid, tripId, entryId));
}
