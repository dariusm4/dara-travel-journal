import { config } from './config';
import { ApiError, fetchJson } from './http';

interface UnsplashSearchResponse {
  results: { urls: { regular: string; small: string } }[];
}

/**
 * Finds a landscape photo for a destination (Unsplash), used to suggest a trip
 * cover image (criterion C).
 */
export async function findDestinationPhoto(query: string): Promise<string | null> {
  if (!config.unsplashAccessKey) {
    throw new ApiError('Photo search is not configured (missing access key).');
  }
  const url =
    `https://api.unsplash.com/search/photos` +
    `?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape` +
    `&client_id=${config.unsplashAccessKey}`;
  const data = await fetchJson<UnsplashSearchResponse>(url);
  return data.results[0]?.urls.regular ?? null;
}
