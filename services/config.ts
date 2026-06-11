/**
 * Centralized environment configuration. The only thing the app needs to know
 * is where its backend lives — every API key sits on the server (criterion 14).
 */
const env = process.env;

export const config = {
  apiUrl: (env.EXPO_PUBLIC_API_URL ?? '').replace(/\/$/, ''),
} as const;

export const isApiConfigured = config.apiUrl.length > 0;
