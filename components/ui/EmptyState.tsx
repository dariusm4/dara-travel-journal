import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { fontSize, fontWeight, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
}

/** Centered icon + message, shown when a list or screen has no content yet. */
export function EmptyState({ icon = 'sparkles-outline', title, message }: EmptyStateProps) {
  const c = useTheme();
  return (
    <View style={styles.wrap}>
      <Ionicons name={icon} size={48} color={c.textMuted} />
      <Text style={[styles.title, { color: c.text }]}>{title}</Text>
      {message ? <Text style={[styles.message, { color: c.textMuted }]}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  title: {
    fontSize: fontSize.subtitle,
    fontWeight: fontWeight.semibold,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  message: { fontSize: fontSize.body, marginTop: spacing.xs, textAlign: 'center' },
});
