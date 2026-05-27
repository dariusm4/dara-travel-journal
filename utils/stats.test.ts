import type { Trip } from '@/types';

import { computeTripStats } from './stats';

const trip = (id: string, destination: string, start: string, end: string): Trip => ({
  id,
  title: id,
  destination,
  startDate: start,
  endDate: end,
  createdAt: 1,
});

describe('computeTripStats', () => {
  it('returns zeros for no trips', () => {
    expect(computeTripStats([])).toEqual({ trips: 0, places: 0, days: 0 });
  });

  it('counts trips, distinct places, and total inclusive days', () => {
    const stats = computeTripStats([
      trip('a', 'Lisbon', '2026-05-01', '2026-05-03'), // 3 days
      trip('b', 'lisbon', '2026-06-01', '2026-06-01'), // 1 day, same place (case-insensitive)
      trip('c', 'Tokyo', '2026-07-01', '2026-07-05'), // 5 days
    ]);
    expect(stats).toEqual({ trips: 3, places: 2, days: 9 });
  });

  it('ignores blank destinations when counting places', () => {
    expect(computeTripStats([trip('a', '  ', '2026-05-01', '2026-05-01')]).places).toBe(0);
  });
});
