import type { Order } from '@/config/apiService';

/** Laravel `service_orders.status` values + legacy aliases */
export function orderStatusLabelAr(status?: string | null): string {
    const s = String(status || '').toLowerCase().trim();
    const map: Record<string, string> = {
        new: 'جديد',
        in_progress: 'قيد التنفيذ',
        processing: 'قيد التنفيذ',
        completed: 'مكتمل',
        done: 'مكتمل',
        cancelled: 'ملغى',
        canceled: 'ملغى',
        pending: 'معلق',
    };
    return map[s] || (status ? String(status) : '—');
}

export function paymentStatusLabelAr(paymentStatus?: string | null): string {
    const s = String(paymentStatus || '').toLowerCase().trim();
    const map: Record<string, string> = {
        pending: 'في انتظار الدفع',
        paid: 'مدفوع',
        failed: 'فشل الدفع',
    };
    return map[s] || (paymentStatus ? String(paymentStatus) : '');
}

export function stylistOrderServiceTitle(item: Order): string {
    const anyItem = item as Record<string, unknown>;
    const service = anyItem.service as { title?: string } | undefined;
    return (
        (item.service_name as string | undefined) ||
        (item.title as string | undefined) ||
        service?.title ||
        `طلب #${item.id}`
    );
}
