import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { fontSize, fontWeight, radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { deleteEntry } from '@/services/firestore';
import { useAppSelector } from '@/store/hooks';
import { formatDate } from '@/utils/date';

export default function EntryDetailScreen() {
  const { id, tripId } = useLocalSearchParams<{ id: string; tripId: string }>();
  const c = useTheme();
  const router = useRouter();
  const uid = useAppSelector((s) => s.auth.user?.uid);
  const entry = useAppSelector((s) => s.entries.items.find((e) => e.id === id));

  const confirmDelete = useCallback(() => {
    Alert.alert('Delete entry', 'This permanently removes this entry.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            if (uid && tripId) await deleteEntry(uid, tripId, id);
            router.back();
          } catch {
            Alert.alert('Could not delete', 'Please check your connection and try again.');
          }
        },
      },
    ]);
  }, [uid, tripId, id, router]);

  if (!entry) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator color={c.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <Stack.Screen
        options={{
          title: entry.title,
          headerRight: () => (
            <View style={styles.headerActions}>
              <Pressable
                hitSlop={8}
                onPress={() => router.push(`/entry-form?id=${id}&tripId=${tripId}`)}
                style={({ pressed }) => pressed && styles.pressed}
              >
                <Ionicons name="create-outline" size={22} color={c.primary} />
              </Pressable>
              <Pressable
                hitSlop={8}
                onPress={confirmDelete}
                style={({ pressed }) => pressed && styles.pressed}
              >
                <Ionicons name="trash-outline" size={22} color={c.danger} />
              </Pressable>
            </View>
          ),
        }}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {entry.photoUrl ? (
          <Image source={{ uri: entry.photoUrl }} style={styles.photo} contentFit="cover" />
        ) : null}

        <Text style={[styles.title, { color: c.text }]}>{entry.title}</Text>

        <View style={styles.chips}>
          <Chip icon="calendar-outline" text={formatDate(entry.entryDate)} />
          {entry.location?.placeName ? (
            <Chip icon="location-outline" text={entry.location.placeName} />
          ) : null}
          {entry.weather ? (
            <Chip
              icon="partly-sunny-outline"
              text={`${Math.round(entry.weather.temp)}° · ${entry.weather.condition}`}
            />
          ) : null}
        </View>

        {entry.note ? <Text style={[styles.note, { color: c.text }]}>{entry.note}</Text> : null}
      </ScrollView>
    </Screen>
  );
}

function Chip({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  const c = useTheme();
  return (
    <View style={[styles.chip, { backgroundColor: c.surfaceAlt }]}>
      <Ionicons name={icon} size={14} color={c.primary} />
      <Text style={[styles.chipText, { color: c.text }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.lg },
  photo: { width: '100%', height: 260, borderRadius: radius.lg, marginBottom: spacing.md },
  title: { fontSize: fontSize.heading, fontWeight: fontWeight.bold },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  chipText: { fontSize: fontSize.caption, fontWeight: fontWeight.medium },
  note: { fontSize: fontSize.body, lineHeight: 24, marginTop: spacing.lg },
  headerActions: { flexDirection: 'row', gap: spacing.md },
  pressed: { opacity: 0.5 },
});
