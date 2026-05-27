import { configureStore } from '@reduxjs/toolkit';

import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';

/**
 * Single Redux Toolkit store (criteria 1 & 11). Feature slices (auth, trips,
 * entries) are registered here as each phase lands. Firebase listeners
 * dispatch into these slices so the UI reads from one predictable source.
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
