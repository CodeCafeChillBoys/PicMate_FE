import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7123';

const http = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('picmate_access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('picmate_refresh_token');

      if (refreshToken && !isRefreshing) {
        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const resp = await axios.post(`${API_BASE_URL}/api/auth/refresh`, { refreshToken }, { withCredentials: true });
          const newToken = resp.data?.accessToken;
          if (newToken) {
            localStorage.setItem('picmate_access_token', newToken);
            processQueue(null, newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return http(originalRequest);
          }
          throw new Error('Refresh failed');
        } catch (err) {
          processQueue(err, null);
          // Clear auth state but do NOT hard-redirect; let React handle it
          localStorage.removeItem('picmate_user');
          localStorage.removeItem('picmate_access_token');
          localStorage.removeItem('picmate_refresh_token');
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = 'Bearer ' + token;
            return http(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      // No refresh token available — clear auth state, reject (no hard redirect)
      localStorage.removeItem('picmate_user');
      localStorage.removeItem('picmate_access_token');
      localStorage.removeItem('picmate_refresh_token');
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default http;
