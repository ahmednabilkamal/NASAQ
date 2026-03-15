import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'venus_access_token';

let accessTokenCache: string | null = null;

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

export const getAccessToken = async (): Promise<string | null> => {
  try {
    if (accessTokenCache) {
      return accessTokenCache;
    }

    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    accessTokenCache = token;
    return token;
  } catch (error) {
    console.error('❌ Error retrieving token:', error);
    return null;
  }
};

export const getAccessTokenSync = (): string | null => {
  return accessTokenCache;
};

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
