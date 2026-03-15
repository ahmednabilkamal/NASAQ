import api from "./axios";

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

export interface PaymentConfig {
    publishable_key?: string;
    [key: string]: any;
}

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

export const apiService = {

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
        const response = await api.post('/user/orders', data);
        return response.data;
    },

    getUserOrders: async (params?: PaginationParams): Promise<ApiResponse<Order[]>> => {
        const response = await api.get('/user/orders', { params });
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

    listConversations: async (): Promise<ApiResponse<Conversation[]>> => {
        const response = await api.get('/user/chat/conversations');
        return response.data;
    },

    startConversation: async (stylist_id: number): Promise<ApiResponse<Conversation>> => {
        const response = await api.post('/user/chat/conversations', { stylist_id });
        return response.data;
    },

    getMessages: async (conversationId: number | string): Promise<ApiResponse<Message[]>> => {
        const response = await api.get(`/user/chat/conversations/${conversationId}/messages`);
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

    listTickets: async (): Promise<ApiResponse<Ticket[]>> => {
        const response = await api.get('/user/tickets');
        return response.data;
    },

    createTicket: async (data: CreateTicketData): Promise<ApiResponse<Ticket>> => {
        const response = await api.post('/user/tickets', data);
        return response.data;
    },

    getTicket: async (id: number | string): Promise<ApiResponse<Ticket>> => {
        const response = await api.get(`/user/tickets/${id}`);
        return response.data;
    },

    replyToTicket: async (id: number | string, body: string): Promise<ApiResponse<any>> => {
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
    }): Promise<ApiResponse<any>> => {
        const response = await api.put('/user/stylist/profile', data);
        return response.data;
    },

    updateStylistProfile: async (data: {
        name?: string;
        bio?: string;
        about?: string;
        fashion_style_ids?: number[];
    }): Promise<ApiResponse<any>> => {
        const response = await api.patch('/user/stylist/profile', data);
        return response.data;
    },

    getStylistOrders: async (params?: PaginationParams): Promise<ApiResponse<Order[]>> => {
        const response = await api.get('/user/stylist/orders', { params });
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

    listStylistConversations: async (): Promise<ApiResponse<Conversation[]>> => {
        const response = await api.get('/user/stylist/chat/conversations');
        return response.data;
    },

    getStylistMessages: async (conversationId: number | string): Promise<ApiResponse<Message[]>> => {
        const response = await api.get(`/user/stylist/chat/conversations/${conversationId}/messages`);
        return response.data;
    },

    sendStylistMessage: async (conversationId: number | string, body: string): Promise<ApiResponse<Message>> => {
        const response = await api.post(`/user/stylist/chat/conversations/${conversationId}/messages`, { body });
        return response.data;
    },
};

export default apiService;
