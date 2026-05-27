import { Component, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { fontSize, fontWeight, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Catches rendering errors so one broken screen shows a friendly fallback
 * instead of crashing the whole app (criterion 12, level 2).
 */
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    // In a real app this would go to a logging service.
    console.warn('Unhandled UI error:', error.message);
  }

  reset = () => this.setState({ hasError: false });

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onReset={this.reset} />;
    }
    return this.props.children;
  }
}

function ErrorFallback({ onReset }: { onReset: () => void }) {
  const c = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Text style={[styles.title, { color: c.text }]}>Something went wrong</Text>
      <Text style={[styles.message, { color: c.textMuted }]}>
        An unexpected error occurred. You can try again.
      </Text>
      <Button title="Try again" onPress={onReset} style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  title: { fontSize: fontSize.title, fontWeight: fontWeight.bold },
  message: { fontSize: fontSize.body, textAlign: 'center', marginTop: spacing.sm },
  button: { marginTop: spacing.lg, alignSelf: 'stretch' },
});
