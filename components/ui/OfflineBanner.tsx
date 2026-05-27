import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fontSize, fontWeight, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useAppSelector } from '@/store/hooks';

/** Thin bar shown at the top while offline (criterion 12/13). */
export function OfflineBanner() {
  const isOnline = useAppSelector((s) => s.ui.isOnline);
  const insets = useSafeAreaInsets();
  const c = useTheme();

  if (isOnline) return null;

  return (
    <View style={[styles.bar, { backgroundColor: c.danger, paddingTop: insets.top + spacing.xs }]}>
      <Text style={[styles.text, { color: c.onPrimary }]}>Offline — showing your saved data</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { paddingBottom: spacing.xs, paddingHorizontal: spacing.md, alignItems: 'center' },
  text: { fontSize: fontSize.caption, fontWeight: fontWeight.semibold },
});
