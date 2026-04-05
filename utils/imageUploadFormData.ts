/**
 * Helpers for stylist cover / image multipart uploads.
 * Laravel CompleteStylistRequest allows image & cover files up to max:5120 (kilobytes) ≈ 5MB.
 */
export const MAX_STYLIST_IMAGE_BYTES = 5 * 1024 * 1024;

export function isLocalImageUri(uri: string | undefined | null): boolean {
    if (!uri) return false;
    const u = uri.toLowerCase();
    return (
        u.startsWith('file://') ||
        u.startsWith('content://') ||
        u.startsWith('ph://') ||
        u.startsWith('assets-library://')
    );
}

export function appendImageFieldToFormData(formData: FormData, fieldName: string, uri: string): void {
    const nameFromUri = uri.split('/').pop()?.split('?')[0] || `${fieldName}.jpg`;
    const ext = nameFromUri.includes('.') ? (nameFromUri.split('.').pop() || 'jpg').toLowerCase() : 'jpg';
    const mime =
        ext === 'png'
            ? 'image/png'
            : ext === 'webp'
              ? 'image/webp'
              : ext === 'heic' || ext === 'heif'
                ? 'image/heic'
                : 'image/jpeg';
    const name = nameFromUri.includes('.') ? nameFromUri : `${fieldName}.${ext === 'png' ? 'png' : 'jpg'}`;
    formData.append(fieldName, { uri, name, type: mime } as any);
}
