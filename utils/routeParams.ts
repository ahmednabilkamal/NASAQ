/** Expo Router can surface the same key as string or string[]. */
export function routeParamToString(v: string | string[] | undefined | null): string {
    if (v == null) return '';
    if (Array.isArray(v)) return v[0] ?? '';
    return String(v);
}
