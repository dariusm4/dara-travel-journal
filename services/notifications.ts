import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Local journaling reminders (criterion 6). No server/push involved — these are
 * scheduled on-device. The user toggles them from the Profile screen.
 */

const REMINDER_DAYS = 3;
const SECONDS_PER_DAY = 86_400;
const CHANNEL_ID = 'reminders';

// Show reminders while the app is foregrounded too.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function ensurePermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Journaling reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

/** Schedules a recurring nudge; returns false if permission was denied. */
export async function scheduleJournalReminder(): Promise<boolean> {
  if (!(await ensurePermission())) return false;
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Time to journal ✈️',
      body: "It's been a few days — capture a travel memory in Dara.",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: REMINDER_DAYS * SECONDS_PER_DAY,
      repeats: true,
      channelId: CHANNEL_ID,
    },
  });
  return true;
}

export async function cancelJournalReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function hasScheduledReminder(): Promise<boolean> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return scheduled.length > 0;
}
