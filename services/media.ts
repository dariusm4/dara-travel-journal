import * as ImagePicker from 'expo-image-picker';
import { Alert, Linking, Platform } from 'react-native';

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

/** Longest edge (px) we keep — plenty for the cover/thumbnail sizes we render. */
const MAX_DIMENSION = 1600;

/**
 * On web the picker ignores `quality` and hands back the raw original (a phone
 * photo can be 4000px+ and several MB), which uploads slowly and renders in torn
 * strips. Downscale to MAX_DIMENSION and re-encode as JPEG so covers/thumbnails
 * load instantly and stay crisp. Native already compresses via the picker's
 * `quality`, so this is a no-op there.
 */
async function shrinkForUpload(uri: string): Promise<string> {
  if (Platform.OS !== 'web') return uri;
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new window.Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = uri;
    });
    const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
    if (scale === 1) return uri; // already small enough — keep the original
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return uri;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.85),
    );
    return blob ? URL.createObjectURL(blob) : uri;
  } catch {
    return uri; // never block the pick on a resize failure
  }
}

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
  const uri = result.assets[0]?.uri;
  return uri ? await shrinkForUpload(uri) : null;
}

export async function pickFromLibrary(): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    permissionDenied('Photos');
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
  if (result.canceled) return null;
  const uri = result.assets[0]?.uri;
  return uri ? await shrinkForUpload(uri) : null;
}
