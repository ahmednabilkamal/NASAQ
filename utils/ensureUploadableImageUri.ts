import * as FileSystem from 'expo-file-system';

/**
 * Android `content://` and iOS `ph://` URIs often fail in RN `Image` and in multipart uploads.
 * Copy into the app cache as `file://` when needed.
 */
export async function ensureUploadableImageUri(uri: string): Promise<string> {
    if (!uri || typeof uri !== 'string') return uri;
    const lower = uri.toLowerCase();
    if (lower.startsWith('file://')) {
        return uri;
    }
    if (
        lower.startsWith('content://') ||
        lower.startsWith('ph://') ||
        lower.startsWith('assets-library://')
    ) {
        const base = FileSystem.cacheDirectory;
        if (!base) return uri;
        const extMatch = /\.([a-z0-9]+)(\?|$)/i.exec(uri);
        const ext = extMatch?.[1]?.toLowerCase();
        const safeExt =
            ext && ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'].includes(ext) ? ext : 'jpg';
        const dest = `${base}stylist_pick_${Date.now()}.${safeExt}`;
        try {
            await FileSystem.copyAsync({ from: uri, to: dest });
            return dest;
        } catch {
            return uri;
        }
    }
    return uri;
}
