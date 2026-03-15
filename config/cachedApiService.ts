import * as apiService from './apiService';
import { fetchWithCache, setCacheData, getCacheData, CACHE_KEYS } from '@/utils/cacheManager';
import { handleApiError } from '@/utils/errorHandler';

const DEFAULT_CACHE_DURATION = 24 * 60 * 60 * 1000;
const SHORT_CACHE_DURATION = 5 * 60 * 1000;

export const getBanners = async (languageCode: string = 'ar') => {
  try {
    return await fetchWithCache(
      CACHE_KEYS.BANNERS,
      () => apiService.getBanners(),
      { expiryDuration: DEFAULT_CACHE_DURATION }
    );
  } catch (error) {
    handleApiError(error, languageCode);
    throw error;
  }
};

export const getStylists = async (
  params?: apiService.PaginationParams,
  languageCode: string = 'ar'
) => {
  try {
    const cacheKey = params?.search
      ? `${CACHE_KEYS.STYLISTS_LIST}_${params.search}`
      : CACHE_KEYS.STYLISTS_LIST;

    return await fetchWithCache(
      cacheKey,
      () => apiService.getStylists(params),
      { expiryDuration: SHORT_CACHE_DURATION }
    );
  } catch (error) {
    handleApiError(error, languageCode);
    throw error;
  }
};

export const getStylistById = async (id: string | number, languageCode: string = 'ar') => {
  try {
    return await fetchWithCache(
      CACHE_KEYS.STYLIST_DETAIL(id.toString()),
      () => apiService.getStylistById(id),
      { expiryDuration: DEFAULT_CACHE_DURATION }
    );
  } catch (error) {
    handleApiError(error, languageCode);
    throw error;
  }
};

export const getStylistPortfolio = async (
  stylistId: string | number,
  params?: apiService.PaginationParams,
  languageCode: string = 'ar'
) => {
  try {
    return await fetchWithCache(
      CACHE_KEYS.STYLIST_PORTFOLIO(stylistId.toString()),
      () => apiService.getStylistPortfolio(stylistId, params),
      { expiryDuration: DEFAULT_CACHE_DURATION }
    );
  } catch (error) {
    handleApiError(error, languageCode);
    throw error;
  }
};

export const getUserOrders = async (
  params?: apiService.PaginationParams,
  languageCode: string = 'ar'
) => {
  try {
    return await fetchWithCache(
      CACHE_KEYS.ORDERS,
      () => apiService.getUserOrders(params),
      { expiryDuration: SHORT_CACHE_DURATION }
    );
  } catch (error) {
    handleApiError(error, languageCode);
    throw error;
  }
};

export const getUserFavorites = async (
  params?: apiService.PaginationParams,
  languageCode: string = 'ar'
) => {
  try {
    return await fetchWithCache(
      CACHE_KEYS.FAVORITES,
      () => apiService.getUserFavorites(params),
      { expiryDuration: SHORT_CACHE_DURATION }
    );
  } catch (error) {
    handleApiError(error, languageCode);
    throw error;
  }
};

export const addFavorite = async (stylistId: string | number, languageCode: string = 'ar') => {
  try {
    const result = await apiService.addFavorite(stylistId);
    await setCacheData(CACHE_KEYS.FAVORITES, null, { expiryDuration: 0 });
    return result;
  } catch (error) {
    handleApiError(error, languageCode);
    throw error;
  }
};

export const removeFavorite = async (stylistId: string | number, languageCode: string = 'ar') => {
  try {
    const result = await apiService.removeFavorite(stylistId);
    await setCacheData(CACHE_KEYS.FAVORITES, null, { expiryDuration: 0 });
    return result;
  } catch (error) {
    handleApiError(error, languageCode);
    throw error;
  }
};

export const getUserProfile = async (languageCode: string = 'ar') => {
  try {
    return await fetchWithCache(
      CACHE_KEYS.USER_PROFILE,
      () => apiService.getUserProfile(),
      { expiryDuration: SHORT_CACHE_DURATION }
    );
  } catch (error) {
    handleApiError(error, languageCode);
    throw error;
  }
};

export const updateUserProfile = async (data: any, languageCode: string = 'ar') => {
  try {
    const result = await apiService.updateUserProfile(data);
    await setCacheData(CACHE_KEYS.USER_PROFILE, null, { expiryDuration: 0 });
    return result;
  } catch (error) {
    handleApiError(error, languageCode);
    throw error;
  }
};

export * from './apiService';
