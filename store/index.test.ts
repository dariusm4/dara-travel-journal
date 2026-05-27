import { store } from './index';

describe('store', () => {
  it('initializes every slice with its default state', () => {
    const state = store.getState();
    expect(state.auth.status).toBe('initializing');
    expect(state.auth.user).toBeNull();
    expect(state.trips.items).toEqual([]);
    expect(state.entries.items).toEqual([]);
    expect(state.ui.isOnline).toBe(true);
  });
});
