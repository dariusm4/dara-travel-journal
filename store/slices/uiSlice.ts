import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/**
 * App-wide UI state that several distant components need: network status
 * (drives the offline banner, criterion 12) and a transient global error.
 * Screen-local state (form fields, open modals) stays in `useState`.
 */
export interface UiState {
  isOnline: boolean;
  globalError: string | null;
}

const initialState: UiState = {
  isOnline: true,
  globalError: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setOnline(state, action: PayloadAction<boolean>) {
      state.isOnline = action.payload;
    },
    setGlobalError(state, action: PayloadAction<string | null>) {
      state.globalError = action.payload;
    },
  },
});

export const { setOnline, setGlobalError } = uiSlice.actions;
export default uiSlice.reducer;
