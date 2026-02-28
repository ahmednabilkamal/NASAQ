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

// Request interceptor to add auth token
api.interceptors.request.use(async (config) => {
  try {
    // Try to get token asynchronously
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error getting token in interceptor:', error);
    // Fallback to sync method if async fails
    const syncToken = getAccessTokenSync();
    if (syncToken) {
      config.headers.Authorization = `Bearer ${syncToken}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;



