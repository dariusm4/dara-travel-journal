import { getApp, getApps, initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

import { config } from './config';
import { secureStorage } from './secureStoragePersistence';

/**
 * Single Firebase entry point (criterion A). Auth persistence is backed by
 * SecureStore (see secureStoragePersistence) so the session survives relaunches
 * without storing the token in AsyncStorage.
 */
const app = getApps().length ? getApp() : initializeApp(config.firebase);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(secureStorage),
});

export const db = getFirestore(app);
export const storage = getStorage(app);

export { app };
