import type { Href } from 'expo-router';
import type { ParsedNotificationPayload } from './notificationPayload';

/** Maps a validated push payload to an Expo Router href (matches existing chat / order_details param names). */
export function getHrefFromNotificationPayload(parsed: ParsedNotificationPayload): Href {
  if (parsed.type === 'message') {
    const qs = new URLSearchParams({ id: parsed.conversationId });
    qs.set('messageId', parsed.messageId);
    return `/pages/chat?${qs.toString()}` as Href;
  }
  if (parsed.type === 'ticket') {
    return `/pages/ticket_detail?id=${encodeURIComponent(parsed.ticketId)}` as Href;
  }
  return `/pages/order_details?id=${encodeURIComponent(parsed.orderId)}` as Href;
}
