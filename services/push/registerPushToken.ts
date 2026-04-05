/**
 * Push tokens for production builds require `extra.eas.projectId` in app.json.
 * Run: npx eas init — then set "extra": { "eas": { "projectId": "<uuid>" } } in app.json.
 */
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import authService from '@/config/authService';

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

export async function registerDeviceForPushNotificationsAsync(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return null;
  }

  await ensureAndroidNotificationChannel();

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    if (__DEV__) {
      console.warn('[push] notification permission not granted');
    }
    return null;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  if (!projectId && !__DEV__) {
    console.warn(
      '[push] Missing extra.eas.projectId in app.json — Expo push may fail in release builds. Run `eas init` and add the project UUID.'
    );
  }

  try {
    const tokenResponse = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );
    return tokenResponse.data ?? null;
  } catch (e) {
    if (__DEV__) {
      console.warn('[push] getExpoPushTokenAsync failed', e);
    }
    return null;
  }
}

/** Registers the Expo token with Laravel (authenticated). */
export async function syncExpoPushTokenToBackend(expoPushToken: string): Promise<void> {
  const parts = [Device.osBuildId, Device.osInternalBuildId, Device.modelId, Device.modelName].filter(
    (p) => p != null && String(p) !== ''
  );
  const device_id = parts.length ? parts.map(String).join(':') : undefined;
  await authService.registerPushToken({
    expo_push_token: expoPushToken,
    device_id: device_id ?? undefined,
    platform: Platform.OS,
  });
}

export async function registerAndSyncPushToken(): Promise<void> {
  const token = await registerDeviceForPushNotificationsAsync();
  if (!token) return;
  try {
    await syncExpoPushTokenToBackend(token);
  } catch (e) {
    if (__DEV__) {
      console.warn('[push] backend registration failed', e);
    }
  }
}
