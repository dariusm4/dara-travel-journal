import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fontSize, fontWeight, radius, shadow, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import type { Trip } from '@/types';
import { formatDateRange } from '@/utils/date';

interface TripCardProps {
  trip: Trip;
  onPress: (trip: Trip) => void;
}

function TripCardComponent({ trip, onPress }: TripCardProps) {
  const c = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress(trip)}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: c.surface, borderColor: c.border },
        shadow.card,
        pressed && styles.pressed,
      ]}
    >
      {trip.coverPhotoUrl ? (
        <Image
          source={{ uri: trip.coverPhotoUrl }}
          style={styles.cover}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={[styles.cover, styles.coverPlaceholder, { backgroundColor: c.surfaceAlt }]}>
          <Ionicons name="image-outline" size={28} color={c.textMuted} />
        </View>
      )}

      <View style={styles.body}>
        <Text numberOfLines={1} style={[styles.title, { color: c.text }]}>
          {trip.title}
        </Text>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color={c.textMuted} />
          <Text numberOfLines={1} style={[styles.meta, { color: c.textMuted }]}>
            {trip.destination}
          </Text>
        </View>
        <Text style={[styles.dates, { color: c.primary }]}>
          {formatDateRange(trip.startDate, trip.endDate)}
        </Text>
      </View>
    </Pressable>
  );
}

export const TripCard = memo(TripCardComponent);

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  pressed: { opacity: 0.9 },
  cover: { width: '100%', height: 140 },
  coverPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  body: { padding: spacing.md },
  title: { fontSize: fontSize.subtitle, fontWeight: fontWeight.bold },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.xs },
  meta: { fontSize: fontSize.body, flexShrink: 1 },
  dates: { fontSize: fontSize.caption, fontWeight: fontWeight.semibold, marginTop: spacing.sm },
});
