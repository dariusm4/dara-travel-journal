import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fontSize, fontWeight, radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import type { Entry } from '@/types';
import { formatDate } from '@/utils/date';

interface EntryCardProps {
  entry: Entry;
  onPress: (entry: Entry) => void;
}

function EntryCardComponent({ entry, onPress }: EntryCardProps) {
  const c = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress(entry)}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: c.surface, borderColor: c.border },
        pressed && styles.pressed,
      ]}
    >
      {entry.photoUrl ? (
        <Image
          source={{ uri: entry.photoUrl }}
          style={styles.thumb}
          contentFit="cover"
          transition={150}
        />
      ) : (
        <View style={[styles.thumb, styles.thumbPlaceholder, { backgroundColor: c.surfaceAlt }]}>
          <Ionicons name="document-text-outline" size={22} color={c.textMuted} />
        </View>
      )}

      <View style={styles.body}>
        <Text numberOfLines={1} style={[styles.title, { color: c.text }]}>
          {entry.title}
        </Text>
        {entry.note ? (
          <Text numberOfLines={2} style={[styles.note, { color: c.textMuted }]}>
            {entry.note}
          </Text>
        ) : null}
        <View style={styles.metaRow}>
          {entry.location?.placeName ? (
            <Text numberOfLines={1} style={[styles.meta, { color: c.primary }]}>
              {entry.location.placeName}
            </Text>
          ) : null}
          <Text style={[styles.meta, { color: c.textMuted }]}>{formatDate(entry.entryDate)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export const EntryCard = memo(EntryCardComponent);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  pressed: { opacity: 0.9 },
  thumb: { width: 84, height: 84 },
  thumbPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, padding: spacing.sm, justifyContent: 'center' },
  title: { fontSize: fontSize.body, fontWeight: fontWeight.semibold },
  note: { fontSize: fontSize.caption, marginTop: 2 },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  meta: { fontSize: fontSize.caption, flexShrink: 1 },
});
