import { useEffect } from 'react';

import { cacheKeys, getCached, setCached } from '@/services/cache';
import { subscribeToEntries } from '@/services/firestore';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { entriesError, entriesLoaded, entriesLoading } from '@/store/slices/entriesSlice';
import type { Entry } from '@/types';

/**
 * Syncs the entries slice with a single trip's entries (cache-first, then
 * live). Mount on the trip detail screen with that trip's id.
 */
export function useEntriesSync(tripId: string | undefined) {
  const dispatch = useAppDispatch();
  const uid = useAppSelector((s) => s.auth.user?.uid);

  useEffect(() => {
    if (!uid || !tripId) return;

    let active = true;
    dispatch(entriesLoading(tripId));

    getCached<Entry[]>(cacheKeys.entries(uid, tripId)).then((cached) => {
      if (active && cached) dispatch(entriesLoaded(cached));
    });

    const unsubscribe = subscribeToEntries(
      uid,
      tripId,
      (entries) => {
        dispatch(entriesLoaded(entries));
        void setCached(cacheKeys.entries(uid, tripId), entries);
      },
      () => dispatch(entriesError('Could not load entries. Check your connection and try again.')),
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, [uid, tripId, dispatch]);
}
