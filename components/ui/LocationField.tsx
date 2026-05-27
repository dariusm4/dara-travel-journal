import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { fontSize, fontWeight, radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { getCurrentGeo } from '@/services/location';
import type { GeoLocation } from '@/types';

interface LocationFieldProps {
  value: GeoLocation | null;
  onChange: (geo: GeoLocation | null) => void;
}

/** Captures the current GPS location (with place name) for an entry. */
export function LocationField({ value, onChange }: LocationFieldProps) {
  const c = useTheme();
  const [loading, setLoading] = useState(false);

  const capture = async () => {
    setLoading(true);
    try {
      const geo = await getCurrentGeo();
      if (geo) onChange(geo);
    } finally {
      setLoading(false);
    }
  };

  const summary =
    value?.placeName ?? (value ? `${value.lat.toFixed(3)}, ${value.lng.toFixed(3)}` : null);

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: c.textMuted }]}>Location</Text>
      <View style={[styles.row, { borderColor: c.border, backgroundColor: c.surface }]}>
        <Ionicons name="location-outline" size={18} color={summary ? c.primary : c.textMuted} />
        <Text style={[styles.summary, { color: summary ? c.text : c.textMuted }]} numberOfLines={1}>
          {summary ?? 'No location set'}
        </Text>
        {loading ? (
          <ActivityIndicator color={c.primary} />
        ) : value ? (
          <Pressable hitSlop={8} onPress={() => onChange(null)}>
            <Ionicons name="close-circle" size={20} color={c.textMuted} />
          </Pressable>
        ) : (
          <Pressable hitSlop={8} onPress={capture}>
            <Text style={[styles.action, { color: c.primary }]}>Use current</Text>
          </Pressable>
        )}
      </View>
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
  row: {
    minHeight: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  summary: { flex: 1, fontSize: fontSize.body },
  action: { fontSize: fontSize.body, fontWeight: fontWeight.semibold },
});
