import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Alert, Platform, Pressable, StyleSheet, Text, View, type AlertButton } from 'react-native';

import { fontSize, fontWeight, radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { photoSource } from '@/services/api';
import { captureWithCamera, pickFromLibrary } from '@/services/media';

interface PhotoPickerProps {
  label: string;
  uri: string | null;
  onChange: (uri: string | null) => void;
  height?: number;
}

/** Tappable photo slot: take a photo, pick from library, or remove. */
export function PhotoPicker({ label, uri, onChange, height = 180 }: PhotoPickerProps) {
  const c = useTheme();

  const choose = () => {
    // React Native Web's Alert can't render a multi-button action sheet, so the
    // native menu below never appears on web. Go straight to the file picker
    // (expo-image-picker opens a file dialog on web), with window.confirm as the
    // optional "remove" path.
    if (Platform.OS === 'web') {
      if (uri && window.confirm('Remove this photo? Cancel to choose a different one.')) {
        onChange(null);
        return;
      }
      void pickFromLibrary().then((u) => {
        if (u) onChange(u);
      });
      return;
    }

    const buttons: AlertButton[] = [
      {
        text: 'Take photo',
        onPress: async () => {
          const u = await captureWithCamera();
          if (u) onChange(u);
        },
      },
      {
        text: 'Choose from library',
        onPress: async () => {
          const u = await pickFromLibrary();
          if (u) onChange(u);
        },
      },
    ];
    if (uri) {
      buttons.push({ text: 'Remove photo', style: 'destructive', onPress: () => onChange(null) });
    }
    buttons.push({ text: 'Cancel', style: 'cancel' });
    Alert.alert(label, undefined, buttons);
  };

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: c.textMuted }]}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={choose}
        style={({ pressed }) => [
          styles.box,
          { height, borderColor: c.border, backgroundColor: c.surface },
          pressed && styles.pressed,
        ]}
      >
        {uri ? (
          <Image source={photoSource(uri)} style={styles.image} contentFit="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="camera-outline" size={28} color={c.textMuted} />
            <Text style={[styles.hint, { color: c.textMuted }]}>Tap to add a photo</Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  label: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  box: {
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
  image: { width: '100%', height: '100%' },
  placeholder: { alignItems: 'center', gap: spacing.xs },
  hint: { fontSize: fontSize.body },
});
