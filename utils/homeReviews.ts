import type { ApiResponse, HomeFeedReview, Stylist, StylistReview } from '@/config/apiService';
import { apiService } from '@/config/apiService';

/** Normalize `/stylists/recent-reviews` body — handles `{ data: [...] }` from axios. */
export function normalizeReviewsApiPayload(raw: unknown): HomeFeedReview[] {
    if (Array.isArray(raw)) {
        return raw as HomeFeedReview[];
    }
    if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as { data: unknown }).data)) {
        return (raw as { data: HomeFeedReview[] }).data;
    }
    return [];
}

/**
 * When the dedicated home reviews endpoint is missing, errors, or returns empty,
 * aggregate reviews from stylist detail responses (already used on stylist profile).
 */
export async function fetchHomeReviewsFallbackFromStylists(stylists: Stylist[]): Promise<HomeFeedReview[]> {
    const take = Math.min(8, stylists.length);
    if (take === 0) {
        return [];
    }
    const slice = stylists.slice(0, take);
    const settled = await Promise.allSettled(slice.map((s) => apiService.getStylistById(s.id)));

    const out: HomeFeedReview[] = [];
    settled.forEach((r, i) => {
        if (r.status !== 'fulfilled') {
            return;
        }
        const raw = r.value as ApiResponse<Stylist> | undefined;
        const stylist = (raw?.data ?? raw) as Stylist;
        const sid = slice[i]?.id ?? stylist?.id;
        const sname = stylist?.name ?? slice[i]?.name;
        const revs = Array.isArray(stylist?.reviews) ? (stylist.reviews as StylistReview[]) : [];
        for (const rev of revs) {
            out.push({
                id: rev.id,
                rating: rev.rating,
                review: rev.review,
                comment: rev.comment ?? rev.review,
                created_at: (rev as { created_at?: string }).created_at,
                user: rev.user,
                stylist: { id: sid as number | string, name: sname },
            });
        }
    });

    const seen = new Set<string>();
    const deduped: HomeFeedReview[] = [];
    for (const item of out.sort((a, b) => Number(b.id) - Number(a.id))) {
        const k = String(item.id);
        if (seen.has(k)) {
            continue;
        }
        seen.add(k);
        deduped.push(item);
    }
    return deduped.slice(0, 12);
}
