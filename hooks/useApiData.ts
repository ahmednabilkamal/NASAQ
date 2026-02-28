import { useState, useEffect } from 'react';
import apiService, {
    RecommendedService,
    Banner,
    FashionStyle,
    PaginationParams,
    ApiResponse
} from '@/config/apiService';

/**
 * Custom hook to fetch recommended services
 * @param params - Pagination parameters
 * @returns Object containing data, loading state, error, and refetch function
 */
export const useRecommendedServices = (params?: PaginationParams) => {
    const [data, setData] = useState<RecommendedService[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.getRecommendedServices(params);
            setData(response.data || []);
        } catch (err) {
            setError(err as Error);
            console.error('Error fetching recommended services:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [params?.per_page, params?.page]);

    return {
        data,
        loading,
        error,
        refetch: fetchData
    };
};

/**
 * Custom hook to fetch banners
 * @returns Object containing data, loading state, error, and refetch function
 */
export const useBanners = () => {
    const [data, setData] = useState<Banner[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.getBanners();
            setData(response.data || []);
        } catch (err) {
            setError(err as Error);
            console.error('Error fetching banners:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return {
        data,
        loading,
        error,
        refetch: fetchData
    };
};

/**
 * Custom hook to fetch fashion styles
 * @param params - Pagination parameters
 * @returns Object containing data, loading state, error, and refetch function
 */
export const useFashionStyles = (params?: PaginationParams) => {
    const [data, setData] = useState<FashionStyle[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.getFashionStyles(params);
            setData(response.data || []);
        } catch (err) {
            setError(err as Error);
            console.error('Error fetching fashion styles:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [params?.per_page, params?.page]);

    return {
        data,
        loading,
        error,
        refetch: fetchData
    };
};
