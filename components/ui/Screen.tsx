import { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface ScreenProps {
  children: ReactNode;
  /** Apply default screen padding (default true). */
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
  edges?: Edge[];
}

/** Themed, safe-area-aware page container used by every screen. */
export function Screen({ children, padded = true, style, edges = ['top'] }: ScreenProps) {
  const c = useTheme();
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={edges}>
      <View style={[styles.body, padded && styles.padded, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  body: { flex: 1 },
  padded: { padding: spacing.lg },
});
