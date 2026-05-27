import * as Location from 'expo-location';
import { Alert, Linking } from 'react-native';

import type { GeoLocation } from '@/types';

/**
 * Current GPS position + reverse geocoding to a human place name (criterion 6).
 * Uses the OS geocoder (no API key). Permission denial is handled gracefully
 * and returns null instead of throwing.
 */
export async function getCurrentGeo(): Promise<GeoLocation | null> {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (!permission.granted) {
    Alert.alert(
      'Location permission needed',
      'Enable location access for Dara in Settings to tag entries with where you are.',
      [
        { text: 'Not now', style: 'cancel' },
        { text: 'Open settings', onPress: () => void Linking.openSettings() },
      ],
    );
    return null;
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  const geo: GeoLocation = {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
  };

  try {
    const [place] = await Location.reverseGeocodeAsync({
      latitude: geo.lat,
      longitude: geo.lng,
    });
    if (place) {
      geo.placeName =
        [place.city ?? place.subregion, place.region].filter(Boolean).join(', ') ||
        place.name ||
        undefined;
      geo.country = place.country ?? undefined;
    }
  } catch {
    // Reverse geocoding is best-effort; keep the raw coordinates.
  }

  return geo;
}
