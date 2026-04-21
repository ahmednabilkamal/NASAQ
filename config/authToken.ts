import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'venus_access_token';

let accessTokenCache: string | null = null;

export type SetAccessTokenOptions = {
  /**
   * When false, the token is kept in memory only for this app session (SecureStore is cleared).
   * Used for “remember me” unchecked — user must log in again after a full app restart.
   */
  persist?: boolean;
};

export const setAccessToken = async (
  token: string | null,
  options?: SetAccessTokenOptions
): Promise<void> => {
  const persist = options?.persist !== false;
  try {
    if (token) {
      accessTokenCache = token;
      if (persist) {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
        console.log('✅ Token stored securely');
      } else {
        try {
          await SecureStore.deleteItemAsync(TOKEN_KEY);
        } catch {
          /* no existing key */
        }
        console.log('✅ Session token (not persisted to device storage)');
      }
    } else {
      accessTokenCache = null;
      try {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      } catch {
        /* ignore */
      }
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
