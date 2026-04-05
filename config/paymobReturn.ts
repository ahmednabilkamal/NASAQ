/**
 * Parse Paymob return URL query for intention id (names vary by product / version).
 */
export function pickIntentionIdFromQuery(q: Record<string, unknown> | undefined): string | null {
    if (!q || typeof q !== 'object') return null;
    const keys = [
        'intention_id',
        'intention',
        'intent_id',
        'payment_intention_id',
        'integration_intention_id',
        'id',
    ];
    for (const k of keys) {
        const v = q[k];
        if (v !== undefined && v !== null && String(v).length > 0) return String(v);
    }
    return null;
}

/**
 * True when `url` is the Paymob success redirect. Prefer `backendRedirectionUrl` from API
 * (`paymob_redirect_url`) so custom PAYMOB_REDIRECTION_URL still works.
 */
export function isPaymobReturnNavigationUrl(url: string, backendRedirectionUrl?: string | null): boolean {
    if (backendRedirectionUrl) {
        try {
            const u = new URL(url);
            const b = new URL(backendRedirectionUrl);
            const pn = (u.pathname.replace(/\/$/, '') || '/') as string;
            const pb = (b.pathname.replace(/\/$/, '') || '/') as string;
            return u.origin === b.origin && pn === pb;
        } catch {
            return false;
        }
    }
    return url.includes('/payment/paymob/return');
}
