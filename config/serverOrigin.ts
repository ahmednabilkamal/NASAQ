import base_URL from '@/config/baseurl';

/**
 * Web origin for Laravel `public` files (e.g. `/storage/...`), without the `/api` suffix.
 * `EXPO_PUBLIC_SERVER_URL` should be like `http://192.168.x.x:8000/api` so devices reach your machine.
 */
export function getServerOrigin(): string {
    const api = String(base_URL || '').replace(/\/$/, '');
    const withoutApi = api.replace(/\/?api$/i, '');
    return withoutApi || api;
}
