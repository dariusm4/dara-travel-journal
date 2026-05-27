import { Ionicons } from '@expo/vector-icons';
import { Link, type Href } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface HeaderButtonProps {
  href: Href;
  icon?: keyof typeof Ionicons.glyphMap;
}

/** A tappable icon for navigation headers (e.g. the "+" to add a trip/entry). */
export function HeaderButton({ href, icon = 'add' }: HeaderButtonProps) {
  const c = useTheme();
  return (
    <Link href={href} asChild>
      <Pressable hitSlop={8} style={({ pressed }) => [styles.btn, pressed && styles.pressed]}>
        <Ionicons name={icon} size={26} color={c.primary} />
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  btn: { paddingHorizontal: spacing.sm },
  pressed: { opacity: 0.5 },
});
