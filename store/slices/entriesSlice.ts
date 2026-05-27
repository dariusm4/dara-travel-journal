import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { AsyncStatus, Entry } from '@/types';

import type { RootState } from '../index';

interface EntriesState {
  /** Which trip the loaded entries belong to. */
  tripId: string | null;
  items: Entry[];
  status: AsyncStatus;
  error: string | null;
}

const initialState: EntriesState = {
  tripId: null,
  items: [],
  status: 'idle',
  error: null,
};

const entriesSlice = createSlice({
  name: 'entries',
  initialState,
  reducers: {
    entriesLoading(state, action: PayloadAction<string>) {
      // Switching trips resets the list so we never show stale entries.
      if (state.tripId !== action.payload) {
        state.items = [];
      }
      state.tripId = action.payload;
      state.status = 'loading';
      state.error = null;
    },
    entriesLoaded(state, action: PayloadAction<Entry[]>) {
      state.items = action.payload;
      state.status = 'success';
      state.error = null;
    },
    entriesError(state, action: PayloadAction<string>) {
      state.status = 'error';
      state.error = action.payload;
    },
    entriesCleared(state) {
      state.tripId = null;
      state.items = [];
      state.status = 'idle';
      state.error = null;
    },
  },
});

export const { entriesLoading, entriesLoaded, entriesError, entriesCleared } = entriesSlice.actions;
export default entriesSlice.reducer;

// Selectors
export const selectEntries = (s: RootState) => s.entries.items;
export const selectEntriesStatus = (s: RootState) => s.entries.status;
