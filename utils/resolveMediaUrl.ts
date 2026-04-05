import type { ImageSourcePropType } from 'react-native';
import { getServerOrigin } from '@/config/serverOrigin';

const ENTITY_IMAGE_KEYS = [
    'image_url',
    'cover_url',
    'avatar_url',
    'thumbnail_url',
    'image',
    'cover',
    'avatar',
    'photo',
] as const;

/** Turn any backend/user-supplied image reference into a URL the device can load. */
export function resolveMediaUrl(raw: string | null | undefined): string | undefined {
    if (raw == null) return undefined;
    const s = String(raw).trim();
    if (!s || s === 'null' || s === 'undefined') return undefined;

    const low = s.toLowerCase();
    if (
        low.startsWith('file://') ||
        low.startsWith('content://') ||
        low.startsWith('ph://') ||
        low.startsWith('blob:')
    ) {
        return s;
    }

    if (/^https?:\/\//i.test(s)) {
        return rewriteStorageUrlToClientOrigin(s);
    }

    const origin = getServerOrigin();
    const norm = s.replace(/^\/+/, '');
    if (norm.startsWith('storage/')) {
        return `${origin}/${norm}`;
    }
    return `${origin}/storage/${norm}`;
}

/**
 * Laravel often emits `http://127.0.0.1` or `http://localhost` in `asset()` while the app calls `http://192.168.x.x`.
 * Remap `/storage/...` URLs to the configured API origin.
 */
function rewriteStorageUrlToClientOrigin(url: string): string {
    let parsed: URL;
    try {
        parsed = new URL(url);
    } catch {
        return url;
    }
    const p = parsed.pathname || '';
    if (p.includes('/storage/') || p === '/storage' || p.startsWith('/storage')) {
        const origin = getServerOrigin();
        return `${origin}${p}${parsed.search}`;
    }
    return url;
}

/** First non-empty resolved URL from common API field names (stylist, user, conversation peer, etc.). */
export function pickResolvedEntityImageUrl(
    entity: Record<string, unknown> | null | undefined
): string | undefined {
    if (!entity || typeof entity !== 'object') return undefined;
    for (const key of ENTITY_IMAGE_KEYS) {
        const v = entity[key];
        if (typeof v === 'string' && v.trim() !== '') {
            const r = resolveMediaUrl(v);
            if (r) return r;
        }
    }
    return undefined;
}

/** Stylist gallery item: API may return a path string or `{ path: string }` (Laravel accessor often returns a full URL in `path`). */
export function resolveStylistPortfolioImageUrl(item: unknown): string | undefined {
    if (item == null) return undefined;
    if (typeof item === 'string') return resolveMediaUrl(item);
    if (typeof item === 'object' && item !== null) {
        const o = item as Record<string, unknown>;
        const p = o.path;
        if (typeof p === 'string' && p.trim()) return resolveMediaUrl(p);
        const u = o.url;
        if (typeof u === 'string' && u.trim()) return resolveMediaUrl(u);
    }
    return undefined;
}

/** Hero: prefer wide cover, then profile image. */
export function pickStylistHeroImageUrl(
    stylist: Record<string, unknown> | null | undefined
): string | undefined {
    if (!stylist) return undefined;
    const cover =
        resolveMediaUrl(stylist.cover_url as string) ?? resolveMediaUrl(stylist.cover as string);
    const img =
        resolveMediaUrl(stylist.image_url as string) ?? resolveMediaUrl(stylist.image as string);
    return cover || img;
}

export function toResolvedImageSource(
    raw: string | null | undefined
): ImageSourcePropType | undefined {
    const u = resolveMediaUrl(raw);
    return u ? { uri: u } : undefined;
}

/** Safe `{ uri }` for RN Image from an entity; returns undefined if nothing usable. */
export function entityToImageSource(
    entity: Record<string, unknown> | null | undefined
): ImageSourcePropType | undefined {
    const u = pickResolvedEntityImageUrl(entity);
    return u ? { uri: u } : undefined;
}
