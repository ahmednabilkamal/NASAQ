import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'venus_cache_';
const CACHE_EXPIRY_KEY = 'venus_cache_expiry_';
const DEFAULT_CACHE_DURATION = 24 * 60 * 60 * 1000;

interface CacheOptions {
  expiryDuration?: number;
  forceRefresh?: boolean;
}

export const setCacheData = async (
  key: string,
  data: any,
  options: CacheOptions = {}
): Promise<void> => {
  try {
    const cacheKey = CACHE_PREFIX + key;
    const expiryKey = CACHE_EXPIRY_KEY + key;
    const expiryTime = Date.now() + (options.expiryDuration || DEFAULT_CACHE_DURATION);

    await Promise.all([
      AsyncStorage.setItem(cacheKey, JSON.stringify(data)),
      AsyncStorage.setItem(expiryKey, expiryTime.toString()),
    ]);
  } catch (error) {
    console.error('Cache set error:', error);
  }
};

export const getCacheData = async <T = any>(
  key: string,
  options: CacheOptions = {}
): Promise<T | null> => {
  try {
    if (options.forceRefresh) {
      return null;
    }

    const cacheKey = CACHE_PREFIX + key;
    const expiryKey = CACHE_EXPIRY_KEY + key;

    const [cachedData, expiryTime] = await Promise.all([
      AsyncStorage.getItem(cacheKey),
      AsyncStorage.getItem(expiryKey),
    ]);

    if (!cachedData || !expiryTime) {
      return null;
    }

    const now = Date.now();
    const expiry = parseInt(expiryTime, 10);

    if (now > expiry) {
      await removeCacheData(key);
      return null;
    }

    return JSON.parse(cachedData) as T;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
};

export const removeCacheData = async (key: string): Promise<void> => {
  try {
    const cacheKey = CACHE_PREFIX + key;
    const expiryKey = CACHE_EXPIRY_KEY + key;

    await Promise.all([
      AsyncStorage.removeItem(cacheKey),
      AsyncStorage.removeItem(expiryKey),
    ]);
  } catch (error) {
    console.error('Cache remove error:', error);
  }
};

export const clearAllCache = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(
      (key) => key.startsWith(CACHE_PREFIX) || key.startsWith(CACHE_EXPIRY_KEY)
    );

    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
    }
  } catch (error) {
    console.error('Clear cache error:', error);
  }
};

export const isOnline = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch('https://www.google.com/favicon.ico', {
      method: 'HEAD',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
};

export const fetchWithCache = async <T = any>(
  key: string,
  fetchFunction: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> => {
  try {
    const freshData = await fetchFunction();

    await setCacheData(key, freshData, options);

    return freshData;
  } catch (error) {
    console.log('Fetch failed, trying cache:', error);

    const cachedData = await getCacheData<T>(key, options);

    if (cachedData) {
      console.log('Serving from cache:', key);
      return cachedData;
    }

    throw error;
  }
};

export const CACHE_KEYS = {
  STYLISTS_LIST: 'stylists_list',
  BANNERS: 'banners',
  USER_PROFILE: 'user_profile',
  FAVORITES: 'favorites',
  ORDERS: 'orders',
  STYLIST_DETAIL: (id: string) => `stylist_detail_${id}`,
  STYLIST_PORTFOLIO: (id: string) => `stylist_portfolio_${id}`,
};
