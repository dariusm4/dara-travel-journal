import { useEffect } from 'react';

import { cacheKeys, getCached, setCached } from '@/services/cache';
import { listEntries } from '@/services/journal';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { entriesError, entriesLoaded, entriesLoading } from '@/store/slices/entriesSlice';
import type { Entry } from '@/types';

/**
 * Cache-first sync of a single trip's entries (criterion 13). Mount this on
 * the trip-detail screen with the trip's id.
 */
export function useEntriesSync(tripId: string | undefined) {
  const dispatch = useAppDispatch();
  const uid = useAppSelector((s) => s.auth.user?.uid);

  useEffect(() => {
    if (!uid || !tripId) return;

    let alive = true;
    dispatch(entriesLoading(tripId));

    getCached<Entry[]>(cacheKeys.entries(uid, tripId)).then((cached) => {
      if (alive && cached) dispatch(entriesLoaded(cached));
    });

    (async () => {
      try {
        const entries = await listEntries(tripId);
        if (!alive) return;
        dispatch(entriesLoaded(entries));
        void setCached(cacheKeys.entries(uid, tripId), entries);
      } catch {
        if (alive) {
          dispatch(entriesError('Could not load entries. Check your connection and try again.'));
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, [uid, tripId, dispatch]);
}
