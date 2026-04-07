import { useAuth } from '@/config/authContext';
import { getHrefFromNotificationPayload } from '@/services/push/navigationFromNotification';
import { parseNotificationData } from '@/services/push/notificationPayload';
import { recordNotificationInHistory } from '@/services/push/notificationHistory';
import {
  registerAndSyncPushToken,
  registerDeviceForPushNotificationsAsync,
} from '@/services/push/registerPushToken';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useRouter, type Href } from 'expo-router';
import React, { useCallback, useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';

const PENDING_HREF_KEY = '@venus/pending_notification_href';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function extractData(response: Notifications.NotificationResponse | null): unknown {
  return response?.notification.request.content.data;
}

function buildDedupeKey(response: Notifications.NotificationResponse | null): string {
  if (!response) return '';
  const id = response.notification.request.identifier;
  if (id) return id;
  try {
    return JSON.stringify(response.notification.request.content.data ?? {});
  } catch {
    return String(Date.now());
  }
}

function hrefToStoreString(href: Href): string {
  return typeof href === 'string' ? href : JSON.stringify(href);
}

function parseStoredHref(raw: string): Href {
  if (raw.startsWith('/')) return raw as Href;
  try {
    return JSON.parse(raw) as Href;
  } catch {
    return raw as Href;
  }
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const lastHandledDedupeKey = useRef<string | null>(null);
  const coldStartHandled = useRef(false);
  const authRef = useRef({ isAuthenticated, loading });

  useEffect(() => {
    authRef.current = { isAuthenticated, loading };
  }, [isAuthenticated, loading]);

  /** Prompt for notification permission on cold start (Android channel + iOS dialog). Backend sync stays after login. */
  useEffect(() => {
    if (Platform.OS === 'web') return;
    void registerDeviceForPushNotificationsAsync();
  }, []);

  const navigateFromResponse = useCallback(async (response: Notifications.NotificationResponse | null) => {
    if (!response) return;

    if (Platform.OS !== 'web') {
      await recordNotificationInHistory(response.notification, { opened: true });
    }

    const dedupe = buildDedupeKey(response);
    if (dedupe && lastHandledDedupeKey.current === dedupe) {
      return;
    }

    const data = extractData(response);
    const parsed = parseNotificationData(data);
    if (!parsed) {
      return;
    }

    const href = getHrefFromNotificationPayload(parsed);
    const { isAuthenticated: authed, loading: authLoading } = authRef.current;

    if (authLoading) {
      await AsyncStorage.setItem(PENDING_HREF_KEY, hrefToStoreString(href));
      return;
    }

    if (!authed) {
      await AsyncStorage.setItem(PENDING_HREF_KEY, hrefToStoreString(href));
      return;
    }

    if (dedupe) {
      lastHandledDedupeKey.current = dedupe;
    }
    router.push(href);
  }, [router]);

  /** After login / session restore: open stored target once. */
  useEffect(() => {
    if (loading || !isAuthenticated) return;

    let cancelled = false;
    (async () => {
      const raw = await AsyncStorage.getItem(PENDING_HREF_KEY);
      if (!raw || cancelled) return;
      await AsyncStorage.removeItem(PENDING_HREF_KEY);
      const href = parseStoredHref(raw);
      lastHandledDedupeKey.current = `pending:${raw}`;
      router.push(href);
    })();

    return () => {
      cancelled = true;
    };
  }, [loading, isAuthenticated, router]);

  /** Notification that launched the app (killed state). */
  useEffect(() => {
    if (loading) return;
    if (coldStartHandled.current) return;
    coldStartHandled.current = true;

    (async () => {
      const last = await Notifications.getLastNotificationResponseAsync();
      await navigateFromResponse(last);
    })();
  }, [loading, navigateFromResponse]);

  /** User tapped a notification while app was backgrounded or foreground. */
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      void navigateFromResponse(response);
    });
    return () => sub.remove();
  }, [navigateFromResponse]);

  /** Foreground deliveries — keep in-app history. */
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const sub = Notifications.addNotificationReceivedListener((event) => {
      void recordNotificationInHistory(event.notification, { opened: false });
    });
    return () => sub.remove();
  }, []);

  /** Register Expo token with Laravel when session is active. */
  useEffect(() => {
    if (!isAuthenticated || loading || Platform.OS === 'web') return;
    void registerAndSyncPushToken();
  }, [isAuthenticated, loading]);

  /** Token can rotate; re-sync when returning to the app. */
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && isAuthenticated && !loading) {
        void registerAndSyncPushToken();
      }
    });
    return () => sub.remove();
  }, [isAuthenticated, loading]);

  return <>{children}</>;
}
