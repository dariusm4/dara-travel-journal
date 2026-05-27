import * as Haptics from 'expo-haptics';

/**
 * Thin wrapper around expo-haptics (criterion D). Calls are fire-and-forget and
 * never throw, so they're safe to sprinkle on key actions (save, delete, tap).
 */
export const haptics = {
  light() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },
  success() {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  },
  warning() {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
  },
};
