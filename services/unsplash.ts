import { apiGet } from './api';

interface UnsplashResponse {
  photoUrl: string | null;
}

/** Asks the backend for a landscape Unsplash photo of `query` (criterion C). */
export async function findDestinationPhoto(query: string): Promise<string | null> {
  const data = await apiGet<UnsplashResponse>(`/api/unsplash?q=${encodeURIComponent(query)}`);
  return data.photoUrl;
}
