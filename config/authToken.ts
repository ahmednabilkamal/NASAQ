import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@venus_access_token';

// In-memory cache for faster access
let accessTokenCache: string | null = null;

/**
 * Set access token - stores in both AsyncStorage and memory cache
 * @param token - The access token to store, or null to clear
 */
export const setAccessToken = async (token: string | null): Promise<void> => {
  try {
    accessTokenCache = token;
    if (token) {
      await AsyncStorage.setItem(TOKEN_KEY, token);
      console.log('✅ Token stored successfully');
    } else {
      await AsyncStorage.removeItem(TOKEN_KEY);
      console.log('✅ Token removed successfully');
    }
  } catch (error) {
    console.error('❌ Error storing token:', error);
    throw error;
  }
};

/**
 * Get access token - returns from memory cache or AsyncStorage
 * @returns The access token or null if not found
 */
export const getAccessToken = async (): Promise<string | null> => {
  try {
    // Return from cache if available
    if (accessTokenCache) {
      return accessTokenCache;
    }

    // Otherwise, load from AsyncStorage
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    accessTokenCache = token;
    return token;
  } catch (error) {
    console.error('❌ Error retrieving token:', error);
    return null;
  }
};

/**
 * Get access token synchronously from cache only
 * Use this only when you're sure the token has been loaded
 * @returns The cached access token or null
 */
export const getAccessTokenSync = (): string | null => {
  return accessTokenCache;
};

/**
 * Initialize token from AsyncStorage on app start
 * Call this early in the app lifecycle
 */
export const initializeToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    accessTokenCache = token;
    if (token) {
      console.log('✅ Token loaded from storage');
    }
    return token;
  } catch (error) {
    console.error('❌ Error initializing token:', error);
    return null;
  }
};

/**
 * Clear all authentication data
 */
export const clearAuthData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    accessTokenCache = null;
    console.log('✅ Auth data cleared');
  } catch (error) {
    console.error('❌ Error clearing auth data:', error);
    throw error;
  }
};
