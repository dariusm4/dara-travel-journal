import type { Trip } from '@/types';

import { daysBetween } from './date';

export interface TripStats {
  trips: number;
  places: number;
  days: number;
}

/** Aggregate headline stats for a set of trips (shown on the Profile screen). */
export function computeTripStats(trips: Trip[]): TripStats {
  const places = new Set(
    trips.map((t) => t.destination.trim().toLowerCase()).filter((d) => d.length > 0),
  );
  const days = trips.reduce((sum, t) => sum + daysBetween(t.startDate, t.endDate), 0);
  return { trips: trips.length, places: places.size, days };
}
