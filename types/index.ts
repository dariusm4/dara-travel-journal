/**
 * Domain models shared across the app.
 *
 * Dates are stored as ISO strings (serializable in Redux + Firestore);
 * `createdAt` uses epoch millis for cheap sorting.
 */

export interface GeoLocation {
  lat: number;
  lng: number;
  placeName?: string;
  country?: string;
}

export interface Weather {
  temp: number;
  condition: string;
  icon?: string;
}

export interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  coverPhotoUrl?: string;
  /** AI-generated narrative recap (criterion C / companion feature). */
  story?: string;
  createdAt: number;
}

export interface Entry {
  id: string;
  tripId: string;
  title: string;
  note: string;
  photoUrl?: string;
  location?: GeoLocation;
  weather?: Weather;
  entryDate: string;
  createdAt: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  createdAt?: number;
}

/** Generic async status used by slices and screens (criterion 7). */
export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';
