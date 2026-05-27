/**
 * Centralized access to environment configuration.
 *
 * All secrets live in `.env` (gitignored) and are exposed to the client via
 * Expo's `EXPO_PUBLIC_*` convention, which inlines them at build time. The
 * AI provider key is NOT here — it stays server-side behind a Cloud Function
 * (criterion 14). Only the function's public URL is referenced.
 */

const env = process.env;

export const config = {
  firebase: {
    apiKey: env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
    authDomain: env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
    storageBucket: env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
    messagingSenderId: env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
    appId: env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
  },
  openWeatherApiKey: env.EXPO_PUBLIC_OPENWEATHER_API_KEY ?? '',
  unsplashAccessKey: env.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY ?? '',
  exchangeRateApiKey: env.EXPO_PUBLIC_EXCHANGERATE_API_KEY ?? '',
  /** HTTPS endpoint of the deployed AI proxy Cloud Function. */
  aiFunctionUrl: env.EXPO_PUBLIC_AI_FUNCTION_URL ?? '',
} as const;

/** True when a Firebase config has been provided (used to fail fast in dev). */
export const isFirebaseConfigured = config.firebase.apiKey.length > 0;
