import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, View } from 'react-native';

import { TripCard } from '@/components/journal/TripCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { SwipeToDelete } from '@/components/ui/SwipeToDelete';
import { spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { deleteTrip } from '@/services/firestore';
import { useAppSelector } from '@/store/hooks';
import type { Trip } from '@/types';
import { haptics } from '@/utils/haptics';

export default function TripsScreen() {
  const c = useTheme();
  const router = useRouter();
  const uid = useAppSelector((s) => s.auth.user?.uid);
  const { items, status } = useAppSelector((s) => s.trips);

  const openTrip = useCallback((trip: Trip) => router.push(`/trip/${trip.id}`), [router]);

  const confirmDelete = useCallback(
    (trip: Trip) => {
      Alert.alert('Delete trip', `Delete "${trip.title}" and all of its entries?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            haptics.warning();
            try {
              if (uid) await deleteTrip(uid, trip.id);
            } catch {
              Alert.alert('Could not delete', 'Please check your connection and try again.');
            }
          },
        },
      ]);
    },
    [uid],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Trip; index: number }) => (
      <SwipeToDelete onDelete={() => confirmDelete(item)}>
        <TripCard trip={item} onPress={openTrip} index={index} />
      </SwipeToDelete>
    ),
    [openTrip, confirmDelete],
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

  if (status === 'error' && items.length === 0) {
    return (
      <Screen edges={[]} padded={false}>
        <EmptyState
          icon="cloud-offline-outline"
          title="Couldn't load your trips"
          message="Check your connection — your saved trips appear here once you're back online."
        />
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
