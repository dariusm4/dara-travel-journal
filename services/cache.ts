import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Best-effort JSON cache on top of AsyncStorage. Used for the cache-first
 * offline experience (criterion 13): data loaded online is written here and
 * read back when the network is unavailable. Failures are swallowed because
 * caching must never break the main flow.
 */

export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function setCached<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore: caching is best-effort
  }
}

export const cacheKeys = {
  trips: (uid: string) => `cache:trips:${uid}`,
  entries: (uid: string, tripId: string) => `cache:entries:${uid}:${tripId}`,
};
