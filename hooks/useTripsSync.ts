import { useEffect } from 'react';

import { cacheKeys, getCached, setCached } from '@/services/cache';
import { subscribeToTrips } from '@/services/firestore';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { tripsCleared, tripsError, tripsLoaded, tripsLoading } from '@/store/slices/tripsSlice';
import type { Trip } from '@/types';

/**
 * Keeps the trips slice in sync with Firestore for the signed-in user, with a
 * cache-first fill so previously loaded trips show instantly and remain
 * available offline (criterion 13). Mount once where the app needs trips.
 */
export function useTripsSync() {
  const dispatch = useAppDispatch();
  const uid = useAppSelector((s) => s.auth.user?.uid);

  useEffect(() => {
    if (!uid) {
      dispatch(tripsCleared());
      return;
    }

    let active = true;
    dispatch(tripsLoading());

    // Cache-first: paint cached trips immediately, then live data overwrites.
    getCached<Trip[]>(cacheKeys.trips(uid)).then((cached) => {
      if (active && cached) dispatch(tripsLoaded(cached));
    });

    const unsubscribe = subscribeToTrips(
      uid,
      (trips) => {
        dispatch(tripsLoaded(trips));
        void setCached(cacheKeys.trips(uid), trips);
      },
      () => dispatch(tripsError('Could not load your trips. Check your connection and try again.')),
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, [uid, dispatch]);
}
