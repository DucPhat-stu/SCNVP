import axios from 'axios';
import type { ApiResponse } from '@shared/types';

/**
 * Pre-configured Axios instance for all API calls.
 * Automatically injects JWT from localStorage.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    const body = response.data as ApiResponse<unknown>;
    if (body && typeof body === 'object' && 'success' in body) {
      return body.data;
    }
    return response.data;
  },
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  },
);

export default api;
