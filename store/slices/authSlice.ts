import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { UserProfile } from '@/types';

export type AuthStatus = 'initializing' | 'authenticated' | 'unauthenticated';

export interface AuthState {
  user: UserProfile | null;
  /** 'initializing' until the first onAuthStateChanged fires (drives the splash/guard). */
  status: AuthStatus;
  authError: string | null;
  submitting: boolean;
}

const initialState: AuthState = {
  user: null,
  status: 'initializing',
  authError: null,
  submitting: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<UserProfile | null>) {
      state.user = action.payload;
      state.status = action.payload ? 'authenticated' : 'unauthenticated';
      state.authError = null;
    },
    setAuthError(state, action: PayloadAction<string | null>) {
      state.authError = action.payload;
    },
    setSubmitting(state, action: PayloadAction<boolean>) {
      state.submitting = action.payload;
    },
  },
});

export const { setUser, setAuthError, setSubmitting } = authSlice.actions;
export default authSlice.reducer;
