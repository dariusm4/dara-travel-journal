import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { EntryCard } from '@/components/journal/EntryCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { fontSize, fontWeight, radius, spacing } from '@/constants/theme';
import { useEntriesSync } from '@/hooks/useEntriesSync';
import { useTheme } from '@/hooks/useTheme';
import { deleteTrip } from '@/services/firestore';
import { useAppSelector } from '@/store/hooks';
import { selectTripById } from '@/store/slices/tripsSlice';
import type { Entry } from '@/types';
import { daysBetween, formatDateRange } from '@/utils/date';

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = useTheme();
  const router = useRouter();
  const uid = useAppSelector((s) => s.auth.user?.uid);
  const trip = useAppSelector(selectTripById(id));
  const entries = useAppSelector((s) => s.entries.items);
  const entriesStatus = useAppSelector((s) => s.entries.status);

  useEntriesSync(id);

  const openEntry = useCallback(
    (entry: Entry) => router.push(`/entry/${entry.id}?tripId=${id}`),
    [router, id],
  );

  const confirmDelete = useCallback(() => {
    Alert.alert('Delete trip', 'This permanently removes the trip and all of its entries.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            if (uid) await deleteTrip(uid, id);
            router.back();
          } catch {
            Alert.alert('Could not delete', 'Please check your connection and try again.');
          }
        },
      },
    ]);
  }, [uid, id, router]);

  const renderItem = useCallback(
    ({ item }: { item: Entry }) => <EntryCard entry={item} onPress={openEntry} />,
    [openEntry],
  );

  if (!trip) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator color={c.primary} />
        </View>
      </Screen>
    );
  }

  const header = (
    <View>
      {trip.coverPhotoUrl ? (
        <Image source={{ uri: trip.coverPhotoUrl }} style={styles.cover} contentFit="cover" />
      ) : null}

      <Text style={[styles.title, { color: c.text }]}>{trip.title}</Text>
      <View style={styles.metaRow}>
        <Ionicons name="location-outline" size={16} color={c.textMuted} />
        <Text style={[styles.meta, { color: c.textMuted }]}>{trip.destination}</Text>
      </View>
      <Text style={[styles.dates, { color: c.primary }]}>
        {formatDateRange(trip.startDate, trip.endDate)} ·{' '}
        {daysBetween(trip.startDate, trip.endDate)} days
      </Text>

      {trip.story ? (
        <View style={[styles.story, { backgroundColor: c.surfaceAlt }]}>
          <Text style={[styles.storyLabel, { color: c.primary }]}>Trip story</Text>
          <Text style={[styles.storyText, { color: c.text }]}>{trip.story}</Text>
        </View>
      ) : null}

      <View style={styles.entriesHeader}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>Entries</Text>
        <Button
          title="Add entry"
          variant="secondary"
          onPress={() => router.push(`/entry-form?tripId=${id}`)}
          style={styles.addBtn}
        />
      </View>
    </View>
  );

  return (
    <Screen padded={false}>
      <Stack.Screen
        options={{
          title: trip.title,
          headerRight: () => (
            <View style={styles.headerActions}>
              <Pressable
                hitSlop={8}
                onPress={() => router.push('/currency')}
                style={({ pressed }) => pressed && styles.pressed}
              >
                <Ionicons name="cash-outline" size={22} color={c.primary} />
              </Pressable>
              <Pressable
                hitSlop={8}
                onPress={() => router.push(`/trip-form?id=${id}`)}
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
      <FlatList
        data={entries}
        keyExtractor={(e) => e.id}
        renderItem={renderItem}
        ListHeaderComponent={header}
        contentContainerStyle={styles.list}
        initialNumToRender={10}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          entriesStatus === 'loading' ? (
            <ActivityIndicator color={c.primary} style={styles.loading} />
          ) : (
            <EmptyState
              icon="document-text-outline"
              title="No entries yet"
              message="Add your first moment from this trip."
            />
          )
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: spacing.lg },
  cover: { width: '100%', height: 180, borderRadius: radius.lg, marginBottom: spacing.md },
  title: { fontSize: fontSize.heading, fontWeight: fontWeight.bold },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.xs },
  meta: { fontSize: fontSize.body },
  dates: { fontSize: fontSize.body, fontWeight: fontWeight.semibold, marginTop: spacing.xs },
  story: { borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md },
  storyLabel: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  storyText: { fontSize: fontSize.body, lineHeight: 22 },
  entriesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: { fontSize: fontSize.title, fontWeight: fontWeight.bold },
  addBtn: { minHeight: 40, paddingHorizontal: spacing.md },
  headerActions: { flexDirection: 'row', gap: spacing.md },
  pressed: { opacity: 0.5 },
  loading: { marginTop: spacing.xl },
});
