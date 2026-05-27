import type { Trip } from '@/types';

import reducer, { tripsCleared, tripsError, tripsLoaded, tripsLoading } from './tripsSlice';

const trip = (id: string): Trip => ({
  id,
  title: `Trip ${id}`,
  destination: 'Somewhere',
  startDate: '2026-05-01',
  endDate: '2026-05-05',
  createdAt: 1,
});

describe('tripsSlice', () => {
  const initial = reducer(undefined, { type: '@@INIT' });

  it('starts idle and empty', () => {
    expect(initial.status).toBe('idle');
    expect(initial.items).toEqual([]);
  });

  it('tripsLoading enters loading and clears error', () => {
    const next = reducer({ ...initial, error: 'old' }, tripsLoading());
    expect(next.status).toBe('loading');
    expect(next.error).toBeNull();
  });

  it('tripsLoaded stores items and marks success', () => {
    const next = reducer(initial, tripsLoaded([trip('a'), trip('b')]));
    expect(next.items).toHaveLength(2);
    expect(next.status).toBe('success');
  });

  it('tripsError records the message', () => {
    const next = reducer(initial, tripsError('boom'));
    expect(next.status).toBe('error');
    expect(next.error).toBe('boom');
  });

  it('tripsCleared resets to empty/idle', () => {
    const loaded = reducer(initial, tripsLoaded([trip('a')]));
    expect(reducer(loaded, tripsCleared()).items).toEqual([]);
  });
});
