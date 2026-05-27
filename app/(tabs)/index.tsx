import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';

export default function TripsScreen() {
  // The trips list lands in Phase 3 (journal UI). Placeholder for now.
  return (
    <Screen edges={[]} padded={false}>
      <EmptyState
        icon="airplane-outline"
        title="No trips yet"
        message="Your travel journal will live here."
      />
    </Screen>
  );
}
