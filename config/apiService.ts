import { isAxiosError } from 'axios';
import api from './axios';
import Toast from 'react-native-toast-message';

export interface PaginationParams {
    per_page?: number;
    page?: number;
    search?: string;
    /** Comma-separated category IDs; stylists who offer at least one service in any of these categories */
    category_ids?: string;
}

export interface ApiResponse<T> {
    data: T;
    meta?: {
        current_page?: number;
        total?: number;
        per_page?: number;
        last_page?: number;
    };
    message?: string;
}

export interface Banner {
    id: number | string;
    title?: string;
    image?: string; // local storage path or absolute URL
    image_url?: string; // absolute URL for the mobile app
    link?: string;
    status?: boolean;
    display_order?: number;
    [key: string]: any;
}

export interface Stylist {
    id: number | string;
    name: string;
    bio?: string;
    about?: string;
    rating?: number | string;
    clients_count?: number;
    price?: number | string;
    image?: string;
    fashion_styles?: FashionStyle[];
    services?: StylistService[];
    images?: string[];
    reviews?: StylistReview[];
    [key: string]: any;
}

/** Latest reviews on the home feed (`/stylists/recent-reviews`). */
export interface HomeFeedReview {
    id: number | string;
    rating: number;
    review?: string;
    comment?: string;
    created_at?: string;
    user?: { id?: number; name?: string; image?: string };
    stylist?: { id?: number; name?: string };
}

export interface StylistReview {
    id: number | string;
    rating: number;
    review?: string;
    comment?: string;
    user?: {
        id: number | string;
        name?: string;
        image?: string;
    };
    [key: string]: any;
}

export interface RecommendedService {
    id: number | string;
    title: string;
    price?: number | string;
    image?: string;
    stylist?: Stylist;
    [key: string]: any;
}

export interface FashionStyle {
    id: number | string;
    name: string;
    description?: string;
    image?: string;
    [key: string]: any;
}

export interface Category {
    id: number | string;
    name: string;
    image?: string;
    [key: string]: any;
}

export interface Address {
    id: number | string;
    name: string;
    lat?: number;
    lng?: number;
    area_id?: number;
    notes?: string;
    is_primary?: boolean;
    [key: string]: any;
}

export interface CreateAddressData {
    name: string;
    lat?: number;
    lng?: number;
    area_id?: number;
    notes?: string;
    is_primary?: boolean;
}

export interface Order {
    id: number | string;
    stylist_service_id?: number;
    notes?: string;
    status?: string;
    [key: string]: any;
}

export interface StylistEarningsSummary {
    commission_percent: number;
    completed_earnings: number;
    /** Earnings from completed orders still inside the post-completion hold (not yet withdrawable). */
    payout_hold_balance?: number;
    /** Hours after completion before earnings become withdrawable (server-driven). */
    payout_hold_hours?: number;
    pending_clearance: number;
    available_balance: number;
    total_paid_out: number;
    bank: {
        bank_name?: string | null;
        bank_account_holder?: string | null;
        iban?: string | null;
        is_complete: boolean;
    };
    recent_orders: {
        id: number;
        status: string;
        payment_status?: string;
        total: number;
        stylist_earning_amount?: number | null;
        created_at?: string;
        client_name?: string;
        service_title?: string;
    }[];
    recent_payouts: {
        id: number;
        amount: number;
        status: string;
        admin_note?: string | null;
        created_at?: string;
        processed_at?: string | null;
    }[];
    /** True when totals were derived from orders (production server missing `/user/stylist/earnings`). */
    earnings_fallback?: boolean;
}

const DEFAULT_STYLIST_COMMISSION_PERCENT = 15;

function roundMoney(n: number): number {
    return Math.round(n * 100) / 100;
}

function stylistNetFromOrder(o: Order, commissionPercent: number): number {
    const raw = o.stylist_earning_amount;
    if (raw != null && raw !== '') {
        const n = parseFloat(String(raw));
        if (Number.isFinite(n)) return n;
    }
    const total = parseFloat(String(o.total ?? 0));
    if (!Number.isFinite(total)) return 0;
    const p = commissionPercent / 100;
    return roundMoney(total * (1 - p));
}

async function fetchStylistOrdersAllPages(): Promise<Order[]> {
    const all: Order[] = [];
    let page = 1;
    const per_page = 100;
    for (;;) {
        const response = await api.get<ApiResponse<Order[]>>('/user/stylist/orders', {
            params: { per_page, page },
            skipErrorToast: true,
        });
        const body = response.data;
        const batch = Array.isArray(body.data) ? body.data : [];
        all.push(...batch);
        const lastPage = body.meta?.last_page ?? 1;
        if (page >= lastPage || batch.length === 0) break;
        page += 1;
        if (page > 100) break;
    }
    return all;
}

function buildStylistEarningsFallback(
    orders: Order[],
    profile: Record<string, unknown> | null | undefined
): StylistEarningsSummary {
    const pct = DEFAULT_STYLIST_COMMISSION_PERCENT;
    const paid = orders.filter((o) => String(o.payment_status ?? '').toLowerCase() === 'paid');

    let completedEarnings = 0;
    let pendingClearance = 0;
    for (const o of paid) {
        const st = String(o.status ?? '').toLowerCase();
        const net = stylistNetFromOrder(o, pct);
        if (st === 'completed' || st === 'done') {
            completedEarnings += net;
        } else if (st !== 'cancelled') {
            pendingClearance += net;
        }
    }

    const recent = [...paid]
        .sort((a, b) => {
            const ta = new Date(String(a.created_at ?? 0)).getTime();
            const tb = new Date(String(b.created_at ?? 0)).getTime();
            return tb - ta;
        })
        .slice(0, 25)
        .map((o) => ({
            id: Number(o.id),
            status: String(o.status ?? ''),
            payment_status: o.payment_status,
            total: parseFloat(String(o.total ?? 0)) || 0,
            commission_percent_applied:
                o.commission_percent_applied != null ? parseFloat(String(o.commission_percent_applied)) : null,
            platform_commission_amount:
                o.platform_commission_amount != null ? parseFloat(String(o.platform_commission_amount)) : null,
            stylist_earning_amount: stylistNetFromOrder(o, pct),
            created_at: o.created_at,
            client_name: (o.user as { name?: string } | undefined)?.name,
            service_title: (o.service as { title?: string } | undefined)?.title,
        }));

    const bn = profile?.bank_name;
    const bh = profile?.bank_account_holder;
    const ib = profile?.iban;
    const bankComplete = Boolean(
        bn && String(bn).trim() && bh && String(bh).trim() && ib && String(ib).trim()
    );

    return {
        commission_percent: pct,
        completed_earnings: roundMoney(completedEarnings),
        payout_hold_balance: 0,
        payout_hold_hours: 24,
        pending_clearance: roundMoney(pendingClearance),
        available_balance: 0,
        total_paid_out: 0,
        bank: {
            bank_name: bn as string | null | undefined,
            bank_account_holder: bh as string | null | undefined,
            iban: ib as string | null | undefined,
            is_complete: bankComplete,
        },
        recent_orders: recent,
        recent_payouts: [],
        earnings_fallback: true,
    };
}

export interface CreateOrderData {
    stylist_service_id: number;
    notes?: string;
    /** Stable key per checkout attempt to prevent duplicate order creation. */
    idempotency_key?: string;
}

export interface CreateReviewData {
    product_id?: number;
    stylist_id?: number;
    rating: number;
    comment?: string;
}

export interface PaymentConfig {
    public_key?: string;
    publishable_key?: string;
    provider?: string;
    [key: string]: any;
}

export interface Conversation {
    id: number | string;
    user_id?: number;
    stylist_id?: number;
    /** When set, the server closed the thread (e.g. order completed) — chat is read-only. */
    closed_at?: string | null;
    stylist?: Stylist;
    user?: { id?: number | string; name?: string; image?: string };
    last_message?: string;
    /** First image URL from the latest message (user & stylist conversation list APIs). */
    last_message_image_url?: string | null;
    unread_count?: number;
    [key: string]: any;
}

export interface Message {
    id: number | string;
    body: string;
    sender_type?: string;
    created_at?: string;
    /** Returned by Message model accessor `attachments_with_url` (or `attachments`). */
    attachments_with_url?: ChatAttachment[];
    attachments?: ChatAttachment[];
    [key: string]: any;
}

export interface ChatAttachment {
    id?: number | string;
    type?: string;
    url?: string;
    original_name?: string;
    [key: string]: any;
}

export interface TicketOrderSummary {
    id?: number;
    status?: string;
    total?: number;
}

export interface TicketOrderReportSummary {
    id?: number;
    category?: string;
    category_label?: string;
    status?: string;
    status_label?: string;
}

export interface Ticket {
    id: number | string;
    subject: string;
    body: string;
    priority?: string;
    status?: string;
    is_stylist_ticket?: boolean;
    order?: TicketOrderSummary;
    order_report?: TicketOrderReportSummary;
    created_at?: string;
    updated_at?: string;
    [key: string]: any;
}

export interface TicketMessage {
    id: number | string;
    body: string;
    sender_type?: string;
    sender_name?: string;
    created_at?: string;
    [key: string]: any;
}

export interface TicketDetail extends Ticket {
    messages?: TicketMessage[];
}

export interface OrderReportWithTicketPayload {
    report: { id: number; category?: string; status?: string; [key: string]: unknown };
    ticket: Ticket;
}

export interface CreateTicketData {
    subject: string;
    body: string;
    priority?: 'low' | 'medium' | 'high';
    order_id?: number;
}

export interface StylistService {
    id: number | string;
    title: string;
    price: number;
    available?: boolean;
    category_id?: number;
    category?: Category;
    [key: string]: any;
}

export interface CreateStylistServiceData {
    category_id: number;
    title: string;
    price: number;
    available?: boolean;
    duration?: number;
}

/** Public platform copy (privacy, terms, notifications) — editable in admin Platform settings. */
export interface PlatformSettings {
    privacy: string;
    terms: string;
    notifications_policy: string;
}

export const apiService = {

    getPlatformSettings: async (): Promise<ApiResponse<PlatformSettings>> => {
        const response = await api.get('/platform-settings', { skipErrorToast: true });
        return response.data;
    },

    getBanners: async (): Promise<ApiResponse<Banner[]>> => {
        const response = await api.get('/banners');
        return response.data;
    },

    getStylists: async (params?: PaginationParams): Promise<ApiResponse<Stylist[]>> => {
        const response = await api.get('/stylists', { params });
        return response.data;
    },

    getTrustedStylists: async (): Promise<ApiResponse<Stylist[]>> => {
        const response = await api.get('/stylists/trusted');
        return response.data;
    },

    getPopularStylists: async (params?: { limit?: number }): Promise<ApiResponse<Stylist[]>> => {
        const response = await api.get('/stylists/popular', {
            params: { limit: params?.limit ?? 10 },
            skipErrorToast: true,
        });
        return response.data;
    },

    getRecentStylistReviews: async (params?: { limit?: number }): Promise<ApiResponse<HomeFeedReview[]>> => {
        const response = await api.get('/stylists/recent-reviews', {
            params: { limit: params?.limit ?? 12 },
            skipErrorToast: true,
        });
        return response.data;
    },

    getRecommendedServices: async (params?: PaginationParams): Promise<ApiResponse<RecommendedService[]>> => {
        const response = await api.get('/stylists/recommended-services', { params });
        return response.data;
    },

    getStylistById: async (id: number | string): Promise<ApiResponse<Stylist>> => {
        const response = await api.get(`/stylists/${id}`);
        return response.data;
    },

    getFashionStyles: async (params?: PaginationParams): Promise<ApiResponse<FashionStyle[]>> => {
        const response = await api.get('/fashion-styles', { params });
        return response.data;
    },

    getCategories: async (): Promise<ApiResponse<Category[]>> => {
        const response = await api.get('/categories');
        return response.data;
    },

    listAddresses: async (): Promise<ApiResponse<Address[]>> => {
        const response = await api.get('/user/addresses');
        return response.data;
    },

    createAddress: async (data: CreateAddressData): Promise<ApiResponse<Address>> => {
        const response = await api.post('/user/addresses', data);
        return response.data;
    },

    updateAddress: async (id: number | string, data: Partial<CreateAddressData>): Promise<ApiResponse<Address>> => {
        const response = await api.post(`/user/addresses/${id}`, data);
        return response.data;
    },

    deleteAddress: async (id: number | string): Promise<ApiResponse<null>> => {
        const response = await api.delete(`/user/addresses/${id}`);
        return response.data;
    },

    createReview: async (data: CreateReviewData): Promise<ApiResponse<any>> => {
        const response = await api.post('/user/reviews', data);
        return response.data;
    },

    createOrder: async (data: CreateOrderData): Promise<ApiResponse<Order>> => {
        const idempotencyKey = data.idempotency_key?.trim();
        const response = await api.post('/user/orders', data, {
            ...(idempotencyKey
                ? {
                      headers: {
                          'Idempotency-Key': idempotencyKey,
                      },
                  }
                : {}),
        });
        return response.data;
    },

    getUserOrders: async (params?: PaginationParams): Promise<ApiResponse<Order[]>> => {
        const response = await api.get('/user/orders', { params });
        return response.data;
    },

    getOrder: async (id: number | string): Promise<ApiResponse<Order>> => {
        const response = await api.get(`/user/orders/${id}`);
        return response.data;
    },

    canMessageStylist: async (
        stylistId: number | string
    ): Promise<ApiResponse<{ can_chat: boolean; message?: string | null }>> => {
        const response = await api.get(`/user/chat/can-message/${stylistId}`);
        return response.data;
    },

    canMessageStylistUser: async (
        userId: number | string
    ): Promise<ApiResponse<{ can_chat: boolean; message?: string | null }>> => {
        const response = await api.get(`/user/stylist/chat/can-message-user/${userId}`);
        return response.data;
    },

    reportOrder: async (
        orderId: number | string,
        data: { category: string; details?: string }
    ): Promise<ApiResponse<OrderReportWithTicketPayload>> => {
        const response = await api.post(`/user/orders/${orderId}/report`, data);
        return response.data;
    },

    reportStylistOrder: async (
        orderId: number | string,
        data: { category: string; details?: string }
    ): Promise<ApiResponse<OrderReportWithTicketPayload>> => {
        const response = await api.post(`/user/stylist/orders/${orderId}/report`, data);
        return response.data;
    },

    getPaymentConfig: async (): Promise<ApiResponse<PaymentConfig>> => {
        const response = await api.get('/user/payments/config');
        return response.data;
    },

    initiatePayment: async (order_id: number): Promise<ApiResponse<any>> => {
        const response = await api.post('/user/payments/initiate', { order_id });
        return response.data;
    },

    /** Paymob checkout session (WebView / browser). */
    sdkPaymentIntent: async (order_id: number): Promise<
        ApiResponse<{
            payment_url: string;
            paymob_redirect_url?: string;
            order_id: number;
            total: number;
            intention_id?: string | null;
            client_secret?: string;
            public_key?: string | null;
        }>
    > => {
        const response = await api.post('/user/payments/sdk-intent', { order_id });
        return response.data;
    },

    confirmSdkPayment: async (body: {
        order_id: number;
        intention_id?: string;
        client_secret?: string;
    }): Promise<ApiResponse<{ order_id: number }>> => {
        const response = await api.post('/user/payments/confirm-sdk', body, { skipErrorToast: true });
        return response.data;
    },

    chargeSavedCard: async (body: {
        order_id: number;
        user_card_id: number;
    }): Promise<ApiResponse<{ order_id: number }>> => {
        const response = await api.post('/user/payments/charge-saved', body, { skipErrorToast: true });
        return response.data;
    },

    saveCardIntent: async (): Promise<
        ApiResponse<{
            payment_url: string;
            paymob_redirect_url?: string;
            intention_id?: string | null;
            client_secret?: string;
            public_key?: string | null;
        }>
    > => {
        const response = await api.post('/user/payments/save-card-intent');
        return response.data;
    },

    confirmSaveCard: async (body: {
        intention_id?: string;
        client_secret?: string;
    }): Promise<ApiResponse<null>> => {
        const response = await api.post('/user/payments/confirm-save-card', body, { skipErrorToast: true });
        return response.data;
    },

    listConversations: async (reqConfig?: { skipErrorToast?: boolean }): Promise<ApiResponse<Conversation[]>> => {
        const response = await api.get('/user/chat/conversations', { timeout: 45000, ...reqConfig });
        return response.data;
    },

    startConversation: async (
        stylist_id: number,
        options?: { for_history?: boolean; order_id?: number | string }
    ): Promise<ApiResponse<Conversation>> => {
        const body: Record<string, unknown> = { stylist_id };
        if (options?.for_history) body.for_history = true;
        if (options?.order_id != null) body.order_id = Number(options.order_id);
        const response = await api.post('/user/chat/conversations', body, {
            skipErrorToast: options?.for_history === true,
        });
        return response.data;
    },

    getMessages: async (conversationId: number | string): Promise<ApiResponse<Message[]>> => {
        const response = await api.get(`/user/chat/conversations/${conversationId}/messages`, {
            skipErrorToast: true,
        });
        return response.data;
    },

    sendMessage: async (conversationId: number | string, data: string | FormData): Promise<ApiResponse<Message>> => {
        const payload = typeof data === 'string' ? { body: data } : data;
        const response = await api.post(`/user/chat/conversations/${conversationId}/messages`, payload);
        return response.data;
    },

    getFavorites: async (): Promise<ApiResponse<Stylist[]>> => {
        const response = await api.get('/user/favorites');
        return response.data;
    },

    toggleFavorite: async (stylist_id: number | string): Promise<ApiResponse<{ is_favorite: boolean }>> => {
        const response = await api.post('/user/favorites/toggle', { stylist_id });
        return response.data;
    },

    listTickets: async (params?: PaginationParams): Promise<ApiResponse<Ticket[]>> => {
        const response = await api.get('/user/tickets', { params });
        return response.data;
    },

    createTicket: async (data: CreateTicketData): Promise<ApiResponse<Ticket>> => {
        const response = await api.post('/user/tickets', data);
        return response.data;
    },

    getTicket: async (id: number | string): Promise<ApiResponse<TicketDetail>> => {
        const response = await api.get(`/user/tickets/${id}`);
        return response.data;
    },

    replyToTicket: async (
        id: number | string,
        body: string,
        files?: { uri: string; name: string; type: string }[]
    ): Promise<ApiResponse<any>> => {
        if (files?.length) {
            const fd = new FormData();
            fd.append('body', body ?? '');
            files.forEach((f) => {
                fd.append('attachments[]', { uri: f.uri, name: f.name, type: f.type } as any);
            });
            const response = await api.post(`/user/tickets/${id}/reply`, fd);
            return response.data;
        }
        const response = await api.post(`/user/tickets/${id}/reply`, { body });
        return response.data;
    },

    getStylistProfile: async (): Promise<ApiResponse<any>> => {
        const response = await api.get('/user/stylist/profile');
        return response.data;
    },

    completeStylistProfile: async (data: {
        name?: string;
        bio?: string;
        about?: string;
        fashion_style_ids?: number[];
        bank_name?: string;
        bank_account_holder?: string;
        iban?: string;
    }): Promise<ApiResponse<any>> => {
        const response = await api.put('/user/stylist/profile', data);
        return response.data;
    },

    updateStylistProfile: async (data: {
        name?: string;
        bio?: string;
        about?: string;
        fashion_style_ids?: number[];
        bank_name?: string;
        bank_account_holder?: string;
        iban?: string;
    }): Promise<ApiResponse<any>> => {
        const response = await api.patch('/user/stylist/profile', data);
        return response.data;
    },

    getStylistEarnings: async (): Promise<ApiResponse<StylistEarningsSummary>> => {
        try {
            const response = await api.get('/user/stylist/earnings', { skipErrorToast: true });
            return response.data;
        } catch (err: unknown) {
            const status = isAxiosError(err) ? err.response?.status : undefined;
            const msg =
                isAxiosError(err) &&
                err.response?.data &&
                typeof err.response.data === 'object' &&
                'message' in err.response.data
                    ? String((err.response.data as { message?: string }).message ?? '')
                    : '';
            if (status === 404 || /route not found/i.test(msg)) {
                try {
                    const [profileRes, orders] = await Promise.all([
                        api.get<ApiResponse<Record<string, unknown>>>('/user/stylist/profile', {
                            skipErrorToast: true,
                        }),
                        fetchStylistOrdersAllPages(),
                    ]);
                    const profile = profileRes.data?.data as Record<string, unknown> | undefined;
                    const summary = buildStylistEarningsFallback(orders, profile);
                    return {
                        data: summary,
                        message: profileRes.data?.message ?? 'Success',
                    };
                } catch (fallbackErr) {
                    const fbMsg =
                        isAxiosError(fallbackErr) &&
                        fallbackErr.response?.data &&
                        typeof fallbackErr.response.data === 'object' &&
                        'message' in fallbackErr.response.data
                            ? String((fallbackErr.response.data as { message?: string }).message ?? '')
                            : 'تعذر تحميل الأرباح';
                    Toast.show({ type: 'error', text1: 'تعذر تحميل الأرباح', text2: fbMsg });
                    throw fallbackErr;
                }
            }
            const message =
                isAxiosError(err) &&
                err.response?.data &&
                typeof err.response.data === 'object' &&
                'message' in err.response.data
                    ? String((err.response.data as { message?: string }).message ?? '')
                    : err instanceof Error
                      ? err.message
                      : 'تعذر تحميل الأرباح';
            Toast.show({ type: 'error', text1: 'خطأ', text2: message });
            throw err;
        }
    },

    requestStylistPayout: async (amount: number): Promise<ApiResponse<any>> => {
        const response = await api.post('/user/stylist/payouts', { amount });
        return response.data;
    },

    getStylistOrders: async (params?: PaginationParams): Promise<ApiResponse<Order[]>> => {
        const response = await api.get('/user/stylist/orders', { params });
        return response.data;
    },

    getStylistOrder: async (id: number | string): Promise<ApiResponse<Order>> => {
        const response = await api.get(`/user/stylist/orders/${id}`);
        return response.data;
    },

    acceptStylistOrder: async (id: number | string): Promise<ApiResponse<Order>> => {
        const response = await api.post(`/user/stylist/orders/${id}/accept`);
        return response.data;
    },

    rejectStylistOrder: async (id: number | string): Promise<ApiResponse<Order>> => {
        const response = await api.post(`/user/stylist/orders/${id}/reject`);
        return response.data;
    },

    completeStylistOrder: async (id: number | string): Promise<ApiResponse<Order>> => {
        const response = await api.post(`/user/stylist/orders/${id}/complete`);
        return response.data;
    },

    listStylistServices: async (): Promise<ApiResponse<StylistService[]>> => {
        const response = await api.get('/user/stylist/services');
        return response.data;
    },

    createStylistService: async (data: CreateStylistServiceData): Promise<ApiResponse<StylistService>> => {
        const response = await api.post('/user/stylist/services', data);
        return response.data;
    },

    updateStylistService: async (id: number | string, data: Partial<CreateStylistServiceData>): Promise<ApiResponse<StylistService>> => {
        const response = await api.put(`/user/stylist/services/${id}`, data);
        return response.data;
    },

    deleteStylistService: async (id: number | string): Promise<ApiResponse<null>> => {
        const response = await api.delete(`/user/stylist/services/${id}`);
        return response.data;
    },

    listStylistConversations: async (reqConfig?: { skipErrorToast?: boolean }): Promise<ApiResponse<Conversation[]>> => {
        const response = await api.get('/user/stylist/chat/conversations', { timeout: 45000, ...reqConfig });
        return response.data;
    },

    startStylistConversation: async (
        user_id: number,
        options?: { for_history?: boolean; order_id?: number | string }
    ): Promise<ApiResponse<Conversation>> => {
        const body: Record<string, unknown> = { user_id };
        if (options?.for_history) body.for_history = true;
        if (options?.order_id != null) body.order_id = Number(options.order_id);
        const response = await api.post('/user/stylist/chat/conversations', body, {
            skipErrorToast: options?.for_history === true,
        });
        return response.data;
    },

    getStylistMessages: async (conversationId: number | string): Promise<ApiResponse<Message[]>> => {
        const response = await api.get(`/user/stylist/chat/conversations/${conversationId}/messages`, {
            skipErrorToast: true,
        });
        return response.data;
    },

    sendStylistMessage: async (conversationId: number | string, data: string | FormData): Promise<ApiResponse<Message>> => {
        const payload = typeof data === 'string' ? { body: data } : data;
        const response = await api.post(`/user/stylist/chat/conversations/${conversationId}/messages`, payload);
        return response.data;
    },
};

export default apiService;
