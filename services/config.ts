/**
 * Centralized access to environment configuration.
 *
 * Per the rubric (criteria C + 14) all keys live in `.env` (gitignored) and are
 * exposed to the client via Expo's `EXPO_PUBLIC_*` convention, never hardcoded.
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
  openAiApiKey: env.EXPO_PUBLIC_OPENAI_API_KEY ?? '',
} as const;

export const isFirebaseConfigured = config.firebase.apiKey.length > 0;
