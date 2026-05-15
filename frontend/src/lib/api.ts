import axios from 'axios';

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

// ── Request interceptor: attach JWT ──
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: handle 401 + envelope ──
api.interceptors.response.use(
  (response) => response.data, // unwrap envelope → return `data` directly
  async (error) => {
    if (error.response?.status === 401) {
      // TODO: attempt refresh token, then retry
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  },
);

export default api;
