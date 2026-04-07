import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const ANDROID_CHANNEL_ID = 'nasq_default';

export async function ensureAndroidNotificationChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'عام',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#064E3B',
  });
}

/**
 * Expo recommends not relying on `status` alone on iOS — use `granted` and/or `ios.status`.
 * @see https://docs.expo.dev/versions/latest/sdk/notifications/#interpret-the-ios-permissions-response
 */
export function hasNotificationAccess(
  status: Notifications.NotificationPermissionsStatus
): boolean {
  if (status.granted) return true;
  if (Platform.OS === 'ios' && status.ios) {
    const s = status.ios.status;
    return (
      s === Notifications.IosAuthorizationStatus.AUTHORIZED ||
      s === Notifications.IosAuthorizationStatus.PROVISIONAL
    );
  }
  return status.status === 'granted';
}

/**
 * Ensures the native notification permission prompt (when still possible) and returns whether access is granted.
 */
export async function ensureNotificationPermissionAsync(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  await ensureAndroidNotificationChannel();

  const current = await Notifications.getPermissionsAsync();
  if (hasNotificationAccess(current)) {
    return true;
  }

  if (Platform.OS === 'ios' && current.status === 'denied' && current.canAskAgain === false) {
    if (__DEV__) {
      console.warn(
        '[push] iOS: الإشعارات مرفوضة مسبقًا. فعّلها من: الإعدادات → الإشعارات → NASAQ'
      );
    }
    return false;
  }

  const next =
    Platform.OS === 'ios'
      ? await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        })
      : await Notifications.requestPermissionsAsync();

  if (__DEV__ && Platform.OS === 'ios') {
    console.log('[push] iOS permission', {
      granted: next.granted,
      status: next.status,
      iosAuthorization: next.ios?.status,
      canAskAgain: next.canAskAgain,
    });
  }

  return hasNotificationAccess(next);
}
