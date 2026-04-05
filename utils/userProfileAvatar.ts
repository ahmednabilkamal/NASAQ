import { pickResolvedEntityImageUrl } from '@/utils/resolveMediaUrl';

const UI_AVATARS_HOST = 'ui-avatars.com';

function isGeneratedAvatar(url: string | undefined): boolean {
    return !url || url.includes(UI_AVATARS_HOST);
}

/**
 * Profile / header avatar: prefer a real uploaded photo from `user` or nested `stylist`
 * (stylists often have `image_url` on the stylist row while `users.image` is still empty).
 */
export function resolveUserProfileAvatarUrl(
    user: Record<string, unknown> | null | undefined
): string | undefined {
    if (!user) return undefined;

    const fromUser = pickResolvedEntityImageUrl(user);
    const stylist = user.stylist as Record<string, unknown> | undefined;
    const fromStylist = pickResolvedEntityImageUrl(stylist);

    if (fromUser && !isGeneratedAvatar(fromUser)) return fromUser;
    if (fromStylist && !isGeneratedAvatar(fromStylist)) return fromStylist;
    return fromUser ?? fromStylist;
}
