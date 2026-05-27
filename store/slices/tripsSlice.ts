import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { AsyncStatus, Trip } from '@/types';

import type { RootState } from '../index';

interface TripsState {
  items: Trip[];
  status: AsyncStatus;
  error: string | null;
}

const initialState: TripsState = {
  items: [],
  status: 'idle',
  error: null,
};

const tripsSlice = createSlice({
  name: 'trips',
  initialState,
  reducers: {
    tripsLoading(state) {
      state.status = 'loading';
      state.error = null;
    },
    tripsLoaded(state, action: PayloadAction<Trip[]>) {
      state.items = action.payload;
      state.status = 'success';
      state.error = null;
    },
    tripsError(state, action: PayloadAction<string>) {
      state.status = 'error';
      state.error = action.payload;
    },
    tripsCleared(state) {
      state.items = [];
      state.status = 'idle';
      state.error = null;
    },
  },
});

export const { tripsLoading, tripsLoaded, tripsError, tripsCleared } = tripsSlice.actions;
export default tripsSlice.reducer;

// Selectors
export const selectTrips = (s: RootState) => s.trips.items;
export const selectTripById = (id: string) => (s: RootState) =>
  s.trips.items.find((t) => t.id === id) ?? null;
