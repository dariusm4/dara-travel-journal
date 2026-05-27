import type { Weather } from '@/types';

import { config } from './config';
import { ApiError, fetchJson } from './http';

interface OpenWeatherResponse {
  main: { temp: number };
  weather: { main: string; description: string; icon: string }[];
}

/**
 * Current weather for a coordinate (OpenWeatherMap). Used to tag a journal
 * entry with the conditions when it was logged (criterion C).
 */
export async function getCurrentWeather(lat: number, lng: number): Promise<Weather> {
  if (!config.openWeatherApiKey) {
    throw new ApiError('Weather is not configured (missing API key).');
  }
  const url =
    `https://api.openweathermap.org/data/2.5/weather` +
    `?lat=${lat}&lon=${lng}&units=metric&appid=${config.openWeatherApiKey}`;
  const data = await fetchJson<OpenWeatherResponse>(url);
  const condition = data.weather[0];
  return {
    temp: data.main.temp,
    condition: condition?.main ?? 'Unknown',
    icon: condition?.icon,
  };
}
