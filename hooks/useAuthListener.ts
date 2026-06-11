import { useEffect } from 'react';

import { loadToken } from '@/services/api';
import { fetchCurrentUser } from '@/services/auth';
import { useAppDispatch } from '@/store/hooks';
import { setUser } from '@/store/slices/authSlice';

/**
 * Validates the stored JWT on app boot. If the token is present and the
 * backend confirms the user (GET /auth/me), we land authenticated; otherwise
 * the navigation guard sends the user to /login.
 */
export function useAuthListener() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let alive = true;
    (async () => {
      const token = await loadToken();
      if (!alive) return;
      if (!token) {
        dispatch(setUser(null));
        return;
      }
      try {
        const user = await fetchCurrentUser();
        if (alive) dispatch(setUser(user));
      } catch {
        if (alive) dispatch(setUser(null));
      }
    })();
    return () => {
      alive = false;
    };
  }, [dispatch]);
}
