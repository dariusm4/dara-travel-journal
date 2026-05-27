import type { Persistence } from 'firebase/auth';

/**
 * `getReactNativePersistence` ships in Firebase's React Native build and is
 * available at runtime (Metro resolves the `react-native` export condition of
 * @firebase/auth), but the umbrella `firebase/auth` *web* type bundle omits it.
 * This augmentation restores the type so `services/firebase.ts` compiles.
 */
declare module 'firebase/auth' {
  export interface ReactNativeAsyncStorage {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
  }
  export function getReactNativePersistence(storage: ReactNativeAsyncStorage): Persistence;
}
