import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { fontSize, fontWeight, radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { signOutUser } from '@/services/auth';
import { useAppSelector } from '@/store/hooks';

export default function ProfileScreen() {
  const c = useTheme();
  const user = useAppSelector((s) => s.auth.user);

  // The auth listener flips status to 'unauthenticated' and the root guard
  // redirects to /login; no manual navigation needed.
  const onLogout = () => {
    void signOutUser();
  };

  return (
    <Screen edges={[]}>
      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
        <Text style={[styles.label, { color: c.textMuted }]}>Signed in as</Text>
        <Text style={[styles.email, { color: c.text }]}>{user?.email ?? '—'}</Text>
        {user?.displayName ? (
          <Text style={[styles.name, { color: c.textMuted }]}>{user.displayName}</Text>
        ) : null}
      </View>

      <Button title="Log out" variant="danger" onPress={onLogout} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  email: { fontSize: fontSize.subtitle, fontWeight: fontWeight.semibold, marginTop: spacing.xs },
  name: { fontSize: fontSize.body, marginTop: spacing.xs },
});
