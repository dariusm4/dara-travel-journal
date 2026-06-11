import { getApp, getApps, initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';

import { config } from './config';
import { secureStorage } from './secureStoragePersistence';

/**
 * Single Firebase entry point. Auth persistence is backed by SecureStore
 * (see secureStoragePersistence) so the session survives relaunches without
 * keeping the token in AsyncStorage (criterion 14).
 *
 * Firebase Storage isn't used — photos live on the device (see ./storage.ts)
 * to keep the project on Firebase's free Spark plan.
 */
const app = getApps().length ? getApp() : initializeApp(config.firebase);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(secureStorage),
});

// ignoreUndefinedProperties lets us pass partial objects (optional photo,
// weather, etc.) without Firestore rejecting `undefined` fields.
export const db = initializeFirestore(app, { ignoreUndefinedProperties: true });

export { app };
