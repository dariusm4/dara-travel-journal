import * as SecureStore from 'expo-secure-store';

/**
 * A SecureStore-backed key/value store shaped like AsyncStorage, so it can be
 * handed to Firebase Auth's `getReactNativePersistence`. This keeps the auth
 * session token in the device keychain/keystore instead of AsyncStorage
 * (criterion 14), while still giving Firebase auto-login on relaunch.
 *
 * Two SecureStore constraints are handled here:
 *  - Keys may only contain [A-Za-z0-9._-]; Firebase uses ':' and '[]', so keys
 *    are sanitized.
 *  - Values over ~2KB are unreliable on Android, and the auth blob can exceed
 *    that, so values are split into chunks with a small count manifest.
 */

const CHUNK_SIZE = 1800;

function safeKey(key: string): string {
  return key.replace(/[^A-Za-z0-9._-]/g, (c) => `_${c.charCodeAt(0)}_`);
}

const countKey = (base: string) => `${base}__n`;
const chunkKey = (base: string, i: number) => `${base}__${i}`;

async function removeItem(key: string): Promise<void> {
  const base = safeKey(key);
  const manifest = await SecureStore.getItemAsync(countKey(base));
  if (manifest != null) {
    const count = parseInt(manifest, 10);
    for (let i = 0; i < count; i += 1) {
      await SecureStore.deleteItemAsync(chunkKey(base, i));
    }
    await SecureStore.deleteItemAsync(countKey(base));
  }
  await SecureStore.deleteItemAsync(base);
}

async function setItem(key: string, value: string): Promise<void> {
  const base = safeKey(key);
  // Clear any previous representation (chunked or single) first.
  await removeItem(key);

  if (value.length <= CHUNK_SIZE) {
    await SecureStore.setItemAsync(base, value);
    return;
  }

  const count = Math.ceil(value.length / CHUNK_SIZE);
  for (let i = 0; i < count; i += 1) {
    await SecureStore.setItemAsync(
      chunkKey(base, i),
      value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE),
    );
  }
  await SecureStore.setItemAsync(countKey(base), String(count));
}

async function getItem(key: string): Promise<string | null> {
  const base = safeKey(key);
  const manifest = await SecureStore.getItemAsync(countKey(base));
  if (manifest == null) {
    return SecureStore.getItemAsync(base);
  }
  const count = parseInt(manifest, 10);
  let out = '';
  for (let i = 0; i < count; i += 1) {
    const part = await SecureStore.getItemAsync(chunkKey(base, i));
    if (part == null) return null; // missing chunk -> treat as absent
    out += part;
  }
  return out;
}

export const secureStorage = { getItem, setItem, removeItem };
