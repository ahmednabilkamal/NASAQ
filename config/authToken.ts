import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'venus_access_token';

// In-memory cache for faster access
let accessTokenCache: string | null = null;

/**
 * Set access token - stores in both SecureStore and memory cache
 * @param token - The access token to store, or null to clear
 */
export const setAccessToken = async (token: string | null): Promise<void> => {
  try {
    accessTokenCache = token;
    if (token) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      console.log('✅ Token stored securely');
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      console.log('✅ Token removed securely');
    }
  } catch (error) {
    console.error('❌ Error storing token:', error);
    throw error;
  }
};

/**
 * Get access token - returns from memory cache or SecureStore
 * @returns The access token or null if not found
 */
export const getAccessToken = async (): Promise<string | null> => {
  try {
    // Return from cache if available
    if (accessTokenCache) {
      return accessTokenCache;
    }

    // Otherwise, load from SecureStore
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
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
 * Initialize token from SecureStore on app start
 * Call this early in the app lifecycle
 */
export const initializeToken = async (): Promise<string | null> => {
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    accessTokenCache = token;
    if (token) {
      console.log('✅ Token loaded from secure storage');
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
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    accessTokenCache = null;
    console.log('✅ Auth data cleared');
  } catch (error) {
    console.error('❌ Error clearing auth data:', error);
    throw error;
  }
};
