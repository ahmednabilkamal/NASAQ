import api from "./axios";

/**
 * NASQ API Service
 * Covers all endpoints from the Postman collection:
 *   - Public (banners, stylists, fashion styles, categories)
 *   - User addresses, reviews, orders, payments, chat, tickets
 *   - Stylist profile, services, chat
 */

// ── Generic helpers ────────────────────────────────────────────────────────

export interface PaginationParams {
    per_page?: number;
    page?: number;
    search?: string;
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

// ── Public API Types ───────────────────────────────────────────────────────

export interface Banner {
    id: number | string;
    title?: string;
    image: string;
    link?: string;
    order?: number;
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

// ── Address Types ──────────────────────────────────────────────────────────

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

// ── Order & Review Types ───────────────────────────────────────────────────

export interface Order {
    id: number | string;
    stylist_service_id?: number;
    notes?: string;
    status?: string;
    [key: string]: any;
}

export interface CreateOrderData {
    stylist_service_id: number;
    notes?: string;
}

export interface CreateReviewData {
    product_id?: number;
    stylist_id?: number;
    rating: number;
    comment?: string;
}

// ── Payment Types ──────────────────────────────────────────────────────────

export interface PaymentConfig {
    publishable_key?: string;
    [key: string]: any;
}

// ── Chat Types ─────────────────────────────────────────────────────────────

export interface Conversation {
    id: number | string;
    stylist_id?: number;
    stylist?: Stylist;
    last_message?: string;
    unread_count?: number;
    [key: string]: any;
}

export interface Message {
    id: number | string;
    body: string;
    sender_type?: string;
    created_at?: string;
    [key: string]: any;
}

// ── Ticket Types ───────────────────────────────────────────────────────────

export interface Ticket {
    id: number | string;
    subject: string;
    body: string;
    priority?: string;
    status?: string;
    order_id?: number;
    [key: string]: any;
}

export interface CreateTicketData {
    subject: string;
    body: string;
    priority?: 'low' | 'medium' | 'high';
    order_id?: number;
}

// ── Stylist Service Types ──────────────────────────────────────────────────

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
}

// ══════════════════════════════════════════════════════════════════════════
// API SERVICE
// ══════════════════════════════════════════════════════════════════════════

export const apiService = {

    // ── Public ─────────────────────────────────────────────────────────────

    /** GET /api/banners */
    getBanners: async (): Promise<ApiResponse<Banner[]>> => {
        const response = await api.get('/banners');
        return response.data;
    },

    /** GET /api/stylists?per_page=&search= */
    getStylists: async (params?: PaginationParams): Promise<ApiResponse<Stylist[]>> => {
        const response = await api.get('/stylists', { params });
        return response.data;
    },

    /** GET /api/stylists/trusted */
    getTrustedStylists: async (): Promise<ApiResponse<Stylist[]>> => {
        const response = await api.get('/stylists/trusted');
        return response.data;
    },

    /** GET /api/stylists/recommended-services */
    getRecommendedServices: async (params?: PaginationParams): Promise<ApiResponse<RecommendedService[]>> => {
        const response = await api.get('/stylists/recommended-services', { params });
        return response.data;
    },

    /** GET /api/stylists/:id */
    getStylistById: async (id: number | string): Promise<ApiResponse<Stylist>> => {
        const response = await api.get(`/stylists/${id}`);
        return response.data;
    },

    /** GET /api/fashion-styles */
    getFashionStyles: async (params?: PaginationParams): Promise<ApiResponse<FashionStyle[]>> => {
        const response = await api.get('/fashion-styles', { params });
        return response.data;
    },

    /** GET /api/categories */
    getCategories: async (): Promise<ApiResponse<Category[]>> => {
        const response = await api.get('/categories');
        return response.data;
    },

    // ── User – Addresses ───────────────────────────────────────────────────

    /** GET /api/user/addresses */
    listAddresses: async (): Promise<ApiResponse<Address[]>> => {
        const response = await api.get('/user/addresses');
        return response.data;
    },

    /** POST /api/user/addresses */
    createAddress: async (data: CreateAddressData): Promise<ApiResponse<Address>> => {
        const response = await api.post('/user/addresses', data);
        return response.data;
    },

    /** POST /api/user/addresses/:id */
    updateAddress: async (id: number | string, data: Partial<CreateAddressData>): Promise<ApiResponse<Address>> => {
        const response = await api.post(`/user/addresses/${id}`, data);
        return response.data;
    },

    /** DELETE /api/user/addresses/:id */
    deleteAddress: async (id: number | string): Promise<ApiResponse<null>> => {
        const response = await api.delete(`/user/addresses/${id}`);
        return response.data;
    },

    // ── User – Reviews & Orders ────────────────────────────────────────────

    /** POST /api/user/reviews */
    createReview: async (data: CreateReviewData): Promise<ApiResponse<any>> => {
        const response = await api.post('/user/reviews', data);
        return response.data;
    },

    /** POST /api/user/orders */
    createOrder: async (data: CreateOrderData): Promise<ApiResponse<Order>> => {
        const response = await api.post('/user/orders', data);
        return response.data;
    },

    // ── User – Payments ────────────────────────────────────────────────────

    /** GET /api/user/payments/config */
    getPaymentConfig: async (): Promise<ApiResponse<PaymentConfig>> => {
        const response = await api.get('/user/payments/config');
        return response.data;
    },

    /** POST /api/user/payments/initiate */
    initiatePayment: async (order_id: number): Promise<ApiResponse<any>> => {
        const response = await api.post('/user/payments/initiate', { order_id });
        return response.data;
    },

    // ── User – Chat ────────────────────────────────────────────────────────

    /** GET /api/user/chat/conversations */
    listConversations: async (): Promise<ApiResponse<Conversation[]>> => {
        const response = await api.get('/user/chat/conversations');
        return response.data;
    },

    /** POST /api/user/chat/conversations */
    startConversation: async (stylist_id: number): Promise<ApiResponse<Conversation>> => {
        const response = await api.post('/user/chat/conversations', { stylist_id });
        return response.data;
    },

    /** GET /api/user/chat/conversations/:id/messages */
    getMessages: async (conversationId: number | string): Promise<ApiResponse<Message[]>> => {
        const response = await api.get(`/user/chat/conversations/${conversationId}/messages`);
        return response.data;
    },

    /** POST /api/user/chat/conversations/:id/messages */
    sendMessage: async (conversationId: number | string, data: string | FormData): Promise<ApiResponse<Message>> => {
        const payload = typeof data === 'string' ? { body: data } : data;
        const response = await api.post(`/user/chat/conversations/${conversationId}/messages`, payload);
        return response.data;
    },

    /** GET /api/user/favorites */
    getFavorites: async (): Promise<ApiResponse<Stylist[]>> => {
        const response = await api.get('/user/favorites');
        return response.data;
    },

    /** POST /api/user/favorites/toggle */
    toggleFavorite: async (stylist_id: number | string): Promise<ApiResponse<{ is_favorite: boolean }>> => {
        const response = await api.post('/user/favorites/toggle', { stylist_id });
        return response.data;
    },

    // ── User – Tickets ─────────────────────────────────────────────────────

    /** GET /api/user/tickets */
    listTickets: async (): Promise<ApiResponse<Ticket[]>> => {
        const response = await api.get('/user/tickets');
        return response.data;
    },

    /** POST /api/user/tickets */
    createTicket: async (data: CreateTicketData): Promise<ApiResponse<Ticket>> => {
        const response = await api.post('/user/tickets', data);
        return response.data;
    },

    /** GET /api/user/tickets/:id */
    getTicket: async (id: number | string): Promise<ApiResponse<Ticket>> => {
        const response = await api.get(`/user/tickets/${id}`);
        return response.data;
    },

    /** POST /api/user/tickets/:id/reply */
    replyToTicket: async (id: number | string, body: string): Promise<ApiResponse<any>> => {
        const response = await api.post(`/user/tickets/${id}/reply`, { body });
        return response.data;
    },

    // ── Stylist – Profile & Orders ─────────────────────────────────────────

    /** GET /api/user/stylist/profile (role=stylist) */
    getStylistProfile: async (): Promise<ApiResponse<any>> => {
        const response = await api.get('/user/stylist/profile');
        return response.data;
    },

    /** PUT /api/user/stylist/profile – become a stylist */
    completeStylistProfile: async (data: {
        name?: string;
        bio?: string;
        about?: string;
        fashion_style_ids?: number[];
    }): Promise<ApiResponse<any>> => {
        const response = await api.put('/user/stylist/profile', data);
        return response.data;
    },

    /** PATCH /api/user/stylist/profile */
    updateStylistProfile: async (data: {
        name?: string;
        bio?: string;
        about?: string;
        fashion_style_ids?: number[];
    }): Promise<ApiResponse<any>> => {
        const response = await api.patch('/user/stylist/profile', data);
        return response.data;
    },

    /** GET /api/user/stylist/orders */
    getStylistOrders: async (params?: PaginationParams): Promise<ApiResponse<Order[]>> => {
        const response = await api.get('/user/stylist/orders', { params });
        return response.data;
    },

    // ── Stylist – Services ─────────────────────────────────────────────────

    /** GET /api/user/stylist/services */
    listStylistServices: async (): Promise<ApiResponse<StylistService[]>> => {
        const response = await api.get('/user/stylist/services');
        return response.data;
    },

    /** POST /api/user/stylist/services */
    createStylistService: async (data: CreateStylistServiceData): Promise<ApiResponse<StylistService>> => {
        const response = await api.post('/user/stylist/services', data);
        return response.data;
    },

    /** PUT /api/user/stylist/services/:id */
    updateStylistService: async (id: number | string, data: Partial<CreateStylistServiceData>): Promise<ApiResponse<StylistService>> => {
        const response = await api.put(`/user/stylist/services/${id}`, data);
        return response.data;
    },

    /** DELETE /api/user/stylist/services/:id */
    deleteStylistService: async (id: number | string): Promise<ApiResponse<null>> => {
        const response = await api.delete(`/user/stylist/services/${id}`);
        return response.data;
    },

    // ── Stylist – Chat (role=stylist) ──────────────────────────────────────

    /** GET /api/user/stylist/chat/conversations */
    listStylistConversations: async (): Promise<ApiResponse<Conversation[]>> => {
        const response = await api.get('/user/stylist/chat/conversations');
        return response.data;
    },

    /** GET /api/user/stylist/chat/conversations/:id/messages */
    getStylistMessages: async (conversationId: number | string): Promise<ApiResponse<Message[]>> => {
        const response = await api.get(`/user/stylist/chat/conversations/${conversationId}/messages`);
        return response.data;
    },

    /** POST /api/user/stylist/chat/conversations/:id/messages */
    sendStylistMessage: async (conversationId: number | string, body: string): Promise<ApiResponse<Message>> => {
        const response = await api.post(`/user/stylist/chat/conversations/${conversationId}/messages`, { body });
        return response.data;
    },
};

export default apiService;
