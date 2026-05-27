import * as ImagePicker from 'expo-image-picker';
import { Alert, Linking } from 'react-native';

/**
 * Camera + photo library access (criterion 6). Each entry point requests the
 * relevant permission, handles denial gracefully (no crash), and returns the
 * picked local URI or null when cancelled/denied.
 */

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [4, 3],
  quality: 0.7,
};

function permissionDenied(feature: string) {
  Alert.alert(
    `${feature} permission needed`,
    `Enable ${feature.toLowerCase()} access for Dara in Settings to continue.`,
    [
      { text: 'Not now', style: 'cancel' },
      { text: 'Open settings', onPress: () => void Linking.openSettings() },
    ],
  );
}

export async function captureWithCamera(): Promise<string | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    permissionDenied('Camera');
    return null;
  }
  const result = await ImagePicker.launchCameraAsync(PICKER_OPTIONS);
  if (result.canceled) return null;
  return result.assets[0]?.uri ?? null;
}

export async function pickFromLibrary(): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    permissionDenied('Photos');
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
  if (result.canceled) return null;
  return result.assets[0]?.uri ?? null;
}
