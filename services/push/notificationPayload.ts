import { z } from 'zod';

const messagePayloadSchema = z.object({
  type: z.literal('message'),
  conversationId: z.string().min(1),
  messageId: z.string().min(1),
});

const orderPayloadSchema = z.object({
  type: z.literal('order'),
  orderId: z.string().min(1),
  status: z.string().min(1),
});

const ticketPayloadSchema = z.object({
  type: z.literal('ticket'),
  ticketId: z.string().min(1),
});

export type ParsedNotificationPayload =
  | z.infer<typeof messagePayloadSchema>
  | z.infer<typeof orderPayloadSchema>
  | z.infer<typeof ticketPayloadSchema>;

function coerceRecord(input: unknown): Record<string, string> | null {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) {
    return null;
  }
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    if (v === undefined || v === null) continue;
    out[String(k)] = typeof v === 'string' ? v : String(v);
  }
  return out;
}

/** Parse `data` from an Expo notification (OS may deliver string or mixed types). */
export function parseNotificationData(data: unknown): ParsedNotificationPayload | null {
  const flat = coerceRecord(data);
  if (!flat) {
    if (__DEV__) {
      console.warn('[push] notification data missing or not an object');
    }
    return null;
  }

  const t = flat.type;
  if (t === 'message') {
    const r = messagePayloadSchema.safeParse(flat);
    if (!r.success && __DEV__) {
      console.warn('[push] invalid message payload', r.error.flatten());
    }
    return r.success ? r.data : null;
  }
  if (t === 'order') {
    const r = orderPayloadSchema.safeParse(flat);
    if (!r.success && __DEV__) {
      console.warn('[push] invalid order payload', r.error.flatten());
    }
    return r.success ? r.data : null;
  }
  if (t === 'ticket') {
    const r = ticketPayloadSchema.safeParse(flat);
    if (!r.success && __DEV__) {
      console.warn('[push] invalid ticket payload', r.error.flatten());
    }
    return r.success ? r.data : null;
  }
  if (__DEV__) {
    console.warn('[push] unknown notification type', t);
  }
  return null;
}
