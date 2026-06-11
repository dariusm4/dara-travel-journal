import { useCallback } from 'react';

import { cacheKeys, setCached } from '@/services/cache';
import { listEntries, listTrips } from '@/services/journal';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { entriesError, entriesLoaded } from '@/store/slices/entriesSlice';
import { tripsError, tripsLoaded } from '@/store/slices/tripsSlice';

/**
 * Imperative refetch helpers used by the form screens after a successful save:
 * the live-listener model is gone, so screens trigger a refetch themselves.
 */
export function useReloadJournal() {
  const dispatch = useAppDispatch();
  const uid = useAppSelector((s) => s.auth.user?.uid);

  const reloadTrips = useCallback(async () => {
    if (!uid) return;
    try {
      const trips = await listTrips();
      dispatch(tripsLoaded(trips));
      void setCached(cacheKeys.trips(uid), trips);
    } catch {
      dispatch(tripsError('Could not load trips.'));
    }
  }, [uid, dispatch]);

  const reloadEntries = useCallback(
    async (tripId: string) => {
      if (!uid) return;
      try {
        const entries = await listEntries(tripId);
        dispatch(entriesLoaded(entries));
        void setCached(cacheKeys.entries(uid, tripId), entries);
      } catch {
        dispatch(entriesError('Could not load entries.'));
      }
    },
    [uid, dispatch],
  );

  return { reloadTrips, reloadEntries };
}
