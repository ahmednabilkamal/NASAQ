import api from "./axios";

/**
 * API Service for Venus Style App
 * Contains all API endpoints for stylists, banners, and fashion styles
 */

// ============================================
// TYPES & INTERFACES
// ============================================

export interface RecommendedService {
    id: string;
    name: string;
    description?: string;
    price?: string;
    image?: string;
    [key: string]: any;
}

export interface Banner {
    id: string;
    title?: string;
    image: string;
    link?: string;
    order?: number;
    [key: string]: any;
}

export interface FashionStyle {
    id: string;
    name: string;
    description?: string;
    image?: string;
    tags?: string[];
    [key: string]: any;
}

export interface PaginationParams {
    per_page?: number;
    page?: number;
}

export interface ApiResponse<T> {
    data: T;
    meta?: {
        current_page?: number;
        total?: number;
        per_page?: number;
        last_page?: number;
    };
}

// ============================================
// API SERVICE
// ============================================

export const apiService = {
    /**
     * Get recommended services for stylists
     * GET /stylists/recommended-services
     * @param params - Pagination parameters (per_page, page)
     * @returns Promise with recommended services data
     */
    getRecommendedServices: async (params?: PaginationParams): Promise<ApiResponse<RecommendedService[]>> => {
        const queryParams = new URLSearchParams();

        if (params?.per_page) {
            queryParams.append('per_page', params.per_page.toString());
        }
        if (params?.page) {
            queryParams.append('page', params.page.toString());
        }

        const queryString = queryParams.toString();
        const url = queryString
            ? `/stylists/recommended-services?${queryString}`
            : '/stylists/recommended-services';

        const response = await api.get(url);
        return response.data;
    },

    /**
     * Get banners for the app
     * GET /banners
     * Requires Bearer Token authentication
     * @returns Promise with banners data
     */
    getBanners: async (): Promise<ApiResponse<Banner[]>> => {
        const response = await api.get('/banners');
        return response.data;
    },

    /**
     * Get fashion styles
     * GET /fashion-styles
     * Requires Bearer Token authentication
     * @param params - Pagination parameters (per_page, page)
     * @returns Promise with fashion styles data
     */
    getFashionStyles: async (params?: PaginationParams): Promise<ApiResponse<FashionStyle[]>> => {
        const queryParams = new URLSearchParams();

        if (params?.per_page) {
            queryParams.append('per_page', params.per_page.toString());
        }
        if (params?.page) {
            queryParams.append('page', params.page.toString());
        }

        const queryString = queryParams.toString();
        const url = queryString
            ? `/fashion-styles?${queryString}`
            : '/fashion-styles';

        const response = await api.get(url);
        return response.data;
    },
};

// ============================================
// EXPORT DEFAULT
// ============================================

export default apiService;
