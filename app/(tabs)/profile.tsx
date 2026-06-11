import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Switch, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { fontSize, fontWeight, radius, spacing, type ColorScheme } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { signOutUser } from '@/services/auth';
import {
  cancelJournalReminders,
  hasScheduledReminder,
  scheduleJournalReminder,
} from '@/services/notifications';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setUser } from '@/store/slices/authSlice';
import { haptics } from '@/utils/haptics';
import { computeTripStats } from '@/utils/stats';

export default function ProfileScreen() {
  const c = useTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const stats = computeTripStats(useAppSelector((s) => s.trips.items));
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
  const onLogout = async () => {
    await signOutUser();
    // No auth listener anymore — flip Redux ourselves so the root guard
    // redirects back to /login.
    dispatch(setUser(null));
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
          styles.statsRow,
          { backgroundColor: c.surface, borderColor: c.border },
        ]}
      >
        <Stat label="Trips" value={stats.trips} color={c} />
        <Stat label="Places" value={stats.places} color={c} />
        <Stat label="Days" value={stats.days} color={c} />
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

function Stat({ label, value, color }: { label: string; value: number; color: ColorScheme }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color: color.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: color.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statValue: { fontSize: fontSize.heading, fontWeight: fontWeight.bold },
  statLabel: {
    fontSize: fontSize.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
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
