import type { Entry } from '@/types';

import reducer, {
  entriesCleared,
  entriesError,
  entriesLoaded,
  entriesLoading,
} from './entriesSlice';

const entry = (id: string, tripId: string): Entry => ({
  id,
  tripId,
  title: `Entry ${id}`,
  note: '',
  entryDate: '2026-05-02',
  createdAt: 1,
});

describe('entriesSlice', () => {
  const initial = reducer(undefined, { type: '@@INIT' });

  it('starts idle with no trip selected', () => {
    expect(initial.status).toBe('idle');
    expect(initial.tripId).toBeNull();
  });

  it('entriesLoading sets the trip and loading status', () => {
    const next = reducer(initial, entriesLoading('trip-1'));
    expect(next.tripId).toBe('trip-1');
    expect(next.status).toBe('loading');
  });

  it('clears stale items when switching to a different trip', () => {
    const loaded = reducer(
      reducer(initial, entriesLoading('trip-1')),
      entriesLoaded([entry('a', 'trip-1')]),
    );
    const switched = reducer(loaded, entriesLoading('trip-2'));
    expect(switched.items).toEqual([]);
    expect(switched.tripId).toBe('trip-2');
  });

  it('keeps items when reloading the same trip', () => {
    const loaded = reducer(
      reducer(initial, entriesLoading('trip-1')),
      entriesLoaded([entry('a', 'trip-1')]),
    );
    const reloading = reducer(loaded, entriesLoading('trip-1'));
    expect(reloading.items).toHaveLength(1);
  });

  it('entriesLoaded and entriesError update status', () => {
    const ok = reducer(initial, entriesLoaded([entry('a', 'trip-1')]));
    expect(ok.status).toBe('success');
    expect(reducer(initial, entriesError('nope')).status).toBe('error');
  });

  it('entriesCleared resets everything', () => {
    const loaded = reducer(
      reducer(initial, entriesLoading('trip-1')),
      entriesLoaded([entry('a', 'trip-1')]),
    );
    const cleared = reducer(loaded, entriesCleared());
    expect(cleared.tripId).toBeNull();
    expect(cleared.items).toEqual([]);
  });
});
