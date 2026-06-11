import type { Weather } from '@/types';

import { apiGet } from './api';

/** Current weather for a coordinate, proxied via the backend (criterion C). */
export async function getCurrentWeather(lat: number, lng: number): Promise<Weather> {
  return apiGet<Weather>(`/api/weather?lat=${lat}&lng=${lng}`);
}
