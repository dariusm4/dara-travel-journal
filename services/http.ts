/** Thrown for non-2xx responses so callers can show friendly messages (criterion 12). */
export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface FetchOptions extends RequestInit {
  timeoutMs?: number;
}

/** fetch + JSON with a timeout and explicit rate-limit / error handling. */
export async function fetchJson<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const { timeoutMs = 10_000, ...init } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    if (res.status === 429) {
      throw new ApiError('Service is busy (rate limited). Please try again shortly.', 429);
    }
    if (!res.ok) {
      throw new ApiError(`Request failed (${res.status}).`, res.status);
    }
    return (await res.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Request timed out. Check your connection.');
    }
    throw new ApiError('Network error. Check your connection and try again.');
  } finally {
    clearTimeout(timer);
  }
}
