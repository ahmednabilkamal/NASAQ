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

// Request interceptor ... existing code ...
api.interceptors.request.use(async (config) => {
  try {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    // SILENT fail - syncToken fallback will attempt or request will fail 401
    const syncToken = getAccessTokenSync();
    if (syncToken) {
      config.headers.Authorization = `Bearer ${syncToken}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = error.response?.data?.message || error.message || 'Something went wrong';

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



