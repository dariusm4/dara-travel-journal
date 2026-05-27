import { useEffect } from 'react';

import { subscribeToAuth } from '@/services/auth';
import { useAppDispatch } from '@/store/hooks';
import { setUser } from '@/store/slices/authSlice';

/**
 * Subscribes to Firebase auth state and mirrors it into Redux. Mount once at
 * the root so every screen can read `auth` from the store and the navigation
 * guard can react to login/logout.
 */
export function useAuthListener() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => dispatch(setUser(user)));
    return unsubscribe;
  }, [dispatch]);
}
