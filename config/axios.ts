import axios from "axios";
import base_URL from "./baseurl";
import { getAccessToken } from "./authToken";

const api = axios.create({
  baseURL: base_URL,
  timeout: 10000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;



