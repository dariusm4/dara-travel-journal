import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { TripCard } from '@/components/journal/TripCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useAppSelector } from '@/store/hooks';
import type { Trip } from '@/types';

export default function TripsScreen() {
  const c = useTheme();
  const router = useRouter();
  const { items, status } = useAppSelector((s) => s.trips);

  const openTrip = useCallback((trip: Trip) => router.push(`/trip/${trip.id}`), [router]);

  const renderItem = useCallback(
    ({ item }: { item: Trip }) => <TripCard trip={item} onPress={openTrip} />,
    [openTrip],
  );

  if (status === 'loading' && items.length === 0) {
    return (
      <Screen edges={[]}>
        <View style={styles.center}>
          <ActivityIndicator color={c.primary} />
        </View>
      </Screen>
    );
  }

  if (items.length === 0) {
    return (
      <Screen edges={[]} padded={false}>
        <EmptyState
          icon="airplane-outline"
          title="No trips yet"
          message="Tap + to start your first travel journal."
        />
      </Screen>
    );
  }

  return (
    <Screen edges={[]} padded={false}>
      <FlatList
        data={items}
        keyExtractor={(t) => t.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        initialNumToRender={8}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: spacing.lg },
});
