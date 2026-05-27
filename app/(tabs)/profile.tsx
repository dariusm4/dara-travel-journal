import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Switch, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { fontSize, fontWeight, radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { signOutUser } from '@/services/auth';
import {
  cancelJournalReminders,
  hasScheduledReminder,
  scheduleJournalReminder,
} from '@/services/notifications';
import { useAppSelector } from '@/store/hooks';
import { haptics } from '@/utils/haptics';

export default function ProfileScreen() {
  const c = useTheme();
  const user = useAppSelector((s) => s.auth.user);
  const [reminders, setReminders] = useState(false);

  useEffect(() => {
    hasScheduledReminder()
      .then(setReminders)
      .catch(() => {});
  }, []);

  const toggleReminders = async (value: boolean) => {
    haptics.light();
    if (value) {
      const ok = await scheduleJournalReminder();
      if (!ok) {
        Alert.alert(
          'Notifications disabled',
          'Enable notifications for Dara in Settings to receive journaling reminders.',
        );
        return;
      }
      setReminders(true);
    } else {
      await cancelJournalReminders();
      setReminders(false);
    }
  };

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

      <View
        style={[
          styles.card,
          styles.settingRow,
          { backgroundColor: c.surface, borderColor: c.border },
        ]}
      >
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: c.text }]}>Journaling reminders</Text>
          <Text style={[styles.settingHint, { color: c.textMuted }]}>
            A gentle nudge every few days.
          </Text>
        </View>
        <Switch
          value={reminders}
          onValueChange={toggleReminders}
          trackColor={{ true: c.primary, false: c.border }}
        />
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
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  settingText: { flex: 1, paddingRight: spacing.md },
  settingTitle: { fontSize: fontSize.body, fontWeight: fontWeight.semibold },
  settingHint: { fontSize: fontSize.caption, marginTop: 2 },
  label: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  email: { fontSize: fontSize.subtitle, fontWeight: fontWeight.semibold, marginTop: spacing.xs },
  name: { fontSize: fontSize.body, marginTop: spacing.xs },
});
