import { useEffect } from 'react';

import { cacheKeys, getCached, setCached } from '@/services/cache';
import { listTrips } from '@/services/journal';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { tripsCleared, tripsError, tripsLoaded, tripsLoading } from '@/store/slices/tripsSlice';
import type { Trip } from '@/types';

/**
 * Cache-first sync of the user's trips against the backend (criterion 13):
 * paints the cached list immediately, then refetches and re-caches.
 */
export function useTripsSync() {
  const dispatch = useAppDispatch();
  const uid = useAppSelector((s) => s.auth.user?.uid);

  useEffect(() => {
    if (!uid) {
      dispatch(tripsCleared());
      return;
    }
    let alive = true;
    dispatch(tripsLoading());

    getCached<Trip[]>(cacheKeys.trips(uid)).then((cached) => {
      if (alive && cached) dispatch(tripsLoaded(cached));
    });

    (async () => {
      try {
        const trips = await listTrips();
        if (!alive) return;
        dispatch(tripsLoaded(trips));
        void setCached(cacheKeys.trips(uid), trips);
      } catch {
        if (alive) {
          dispatch(tripsError('Could not load your trips. Check your connection and try again.'));
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, [uid, dispatch]);
}
