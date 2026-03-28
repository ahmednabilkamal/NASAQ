import axios from "axios";
import base_URL from "./baseurl";
import { getAccessToken, getAccessTokenSync } from "./authToken";

const api = axios.create({
  baseURL: base_URL,
  timeout: 10000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

import Toast from 'react-native-toast-message';

function buildUrl(config: { baseURL?: string; url?: string }): string {
  const base = (config.baseURL || '').replace(/\/$/, '');
  const path = String(config.url || '').replace(/^\//, '');
  return path ? `${base}/${path}` : base;
}

api.interceptors.request.use(async (config) => {
  try {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    const syncToken = getAccessTokenSync();
    if (syncToken) {
      config.headers.Authorization = `Bearer ${syncToken}`;
    }
  }
  if (__DEV__) {
    const method = (config.method || 'GET').toUpperCase();
    const url = buildUrl(config);
    console.log(`[API] → ${method} ${url}`, {
      params: config.params,
      data: config.data,
    });
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      const cfg = response.config;
      const method = (cfg.method || 'GET').toUpperCase();
      console.log(`[API] ← ${response.status} ${method} ${buildUrl(cfg)}`);
    }
    return response;
  },
  (error) => {
    if (__DEV__ && error.config) {
      const cfg = error.config;
      const method = (cfg.method || 'GET').toUpperCase();
      const status = error.response?.status;
      console.log(`[API] ✕ ${status ?? 'ERR'} ${method} ${buildUrl(cfg)}`, error.response?.data ?? error.message);
    }
    let message = error.response?.data?.message || error.message || 'حدث خطأ';

    // Check for validation errors and format them nicely
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors;
      const errorStrings = Object.keys(errors).map(key => {
        const fieldErrors = errors[key];
        return Array.isArray(fieldErrors) ? fieldErrors.join(' ') : fieldErrors;
      });
      if (errorStrings.length > 0) {
        message = errorStrings.join('\n');
      }
    }

    Toast.show({
      type: 'error',
      text1: 'خطأ', // Header in Arabic
      text2: message,
      position: 'bottom',
      visibilityTime: 4000,
      bottomOffset: 60, // A bit higher than the absolute bottom
    });

    return Promise.reject(error);
  }
);

export default api;



