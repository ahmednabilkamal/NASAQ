import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Notification } from 'expo-notifications';

const STORAGE_KEY = '@venus/notification_history';
const MAX_ITEMS = 100;

export interface NotificationHistoryItem {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  /** Push `data` for deep linking; null if missing. */
  data: Record<string, string> | null;
}

function normalizeData(raw: unknown): Record<string, string> | null {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (v === undefined || v === null) continue;
    out[String(k)] = typeof v === 'string' ? v : String(v);
  }
  return Object.keys(out).length ? out : null;
}

function stableId(notification: Notification): string {
  const rid = notification.request.identifier;
  if (rid) {
    return `native:${rid}`;
  }
  const c = notification.request.content;
  const data = normalizeData(c.data);
  const dataKey = data ? JSON.stringify(data) : '';
  return `h:${String(c.title)}:${String(c.body)}:${dataKey}`;
}

function buildItem(
  notification: Notification,
  read: boolean
): Omit<NotificationHistoryItem, 'id'> & { id: string } {
  const content = notification.request.content;
  const title =
    typeof content.title === 'string' && content.title.trim() !== ''
      ? content.title
      : 'إشعار';
  const body = typeof content.body === 'string' ? content.body : '';
  const data = normalizeData(content.data);
  const id = stableId(notification);
  const createdAt =
    typeof notification.date === 'number'
      ? new Date(notification.date).toISOString()
      : new Date().toISOString();

  return { id, title, body, createdAt, read, data };
}

export async function loadNotificationHistory(): Promise<NotificationHistoryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as NotificationHistoryItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x) => x && typeof x.id === 'string' && typeof x.title === 'string'
    );
  } catch {
    return [];
  }
}

async function saveHistory(items: NotificationHistoryItem[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
}

/**
 * Record a notification (foreground delivery or tray tap). Deduplicates by stable id;
 * re-open marks read and moves to top.
 */
export async function recordNotificationInHistory(
  notification: Notification,
  options: { opened?: boolean } = {}
): Promise<void> {
  const opened = options.opened === true;
  const item = buildItem(notification, opened);
  const list = await loadNotificationHistory();
  const idx = list.findIndex((e) => e.id === item.id);

  if (idx >= 0) {
    const prev = list[idx];
    const merged: NotificationHistoryItem = {
      ...prev,
      title: item.title || prev.title,
      body: item.body || prev.body,
      data: item.data ?? prev.data,
      read: opened || prev.read,
      createdAt: item.createdAt,
    };
    list.splice(idx, 1);
    list.unshift(merged);
  } else {
    list.unshift(item as NotificationHistoryItem);
  }

  await saveHistory(list);
}

export async function markNotificationRead(id: string): Promise<void> {
  const list = await loadNotificationHistory();
  const next = list.map((n) => (n.id === id ? { ...n, read: true } : n));
  await saveHistory(next);
}

export async function markAllNotificationsRead(): Promise<void> {
  const list = await loadNotificationHistory();
  const next = list.map((n) => ({ ...n, read: true }));
  await saveHistory(next);
}
