import { useCallback } from 'react';

import { authErrorMessage } from '@/services/auth';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setAuthError, setSubmitting } from '@/store/slices/authSlice';

/**
 * Wraps auth flow state (global, in Redux) and a `submit` helper that applies
 * the loading / error / finally pattern (criterion 7) around an async auth call.
 * Field-level validation stays local to each form.
 */
export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, status, submitting, authError } = useAppSelector((s) => s.auth);

  const submit = useCallback(
    async (action: () => Promise<unknown>) => {
      dispatch(setAuthError(null));
      dispatch(setSubmitting(true));
      try {
        await action();
      } catch (error) {
        dispatch(setAuthError(authErrorMessage(error)));
      } finally {
        dispatch(setSubmitting(false));
      }
    },
    [dispatch],
  );

  const clearError = useCallback(() => dispatch(setAuthError(null)), [dispatch]);

  return { user, status, submitting, authError, submit, clearError };
}
