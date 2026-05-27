import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';

export default function CompanionScreen() {
  // The AI travel companion (chat + trip stories) lands in Phase 6.
  return (
    <Screen edges={[]} padded={false}>
      <EmptyState
        icon="sparkles-outline"
        title="Your AI companion"
        message="Chat and trip stories are coming soon."
      />
    </Screen>
  );
}
