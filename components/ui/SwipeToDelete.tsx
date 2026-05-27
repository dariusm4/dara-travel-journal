import { Ionicons } from '@expo/vector-icons';
import { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

import { fontSize, fontWeight, radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { haptics } from '@/utils/haptics';

interface SwipeToDeleteProps {
  children: ReactNode;
  onDelete: () => void;
}

/** Wraps a list row so swiping left reveals a Delete action (criterion D). */
export function SwipeToDelete({ children, onDelete }: SwipeToDeleteProps) {
  const c = useTheme();

  const renderRightActions = () => (
    <Pressable
      accessibilityRole="button"
      onPress={onDelete}
      style={[styles.action, { backgroundColor: c.danger }]}
    >
      <Ionicons name="trash-outline" size={22} color={c.onPrimary} />
      <Text style={[styles.label, { color: c.onPrimary }]}>Delete</Text>
    </Pressable>
  );

  return (
    <ReanimatedSwipeable
      renderRightActions={renderRightActions}
      onSwipeableWillOpen={() => haptics.light()}
      overshootRight={false}
      friction={2}
      rightThreshold={40}
    >
      {children}
    </ReanimatedSwipeable>
  );
}

const styles = StyleSheet.create({
  action: {
    width: 96,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    gap: 2,
  },
  label: { fontSize: fontSize.caption, fontWeight: fontWeight.semibold },
});
