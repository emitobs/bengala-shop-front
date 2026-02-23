import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/auth.store';

interface FailedRequest {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

function processQueue(error: unknown, token: string | null = null): void {
  failedQueue.forEach((pending) => {
    if (error) {
      pending.reject(error);
    } else if (token) {
      pending.resolve(token);
    }
  });
  failedQueue = [];
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const isRefreshRequest = originalRequest.url?.includes('/auth/refresh');
    if (isRefreshRequest) {
      useAuthStore.getState().clearAuth();
      window.location.href = '/iniciar-sesion';
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return apiClient(originalRequest);
      });
    }

    isRefreshing = true;

    try {
      const refreshToken = localStorage.getItem('bengala-refresh-token');
      const { data } = await apiClient.post<{
        user: { id: string; email: string; firstName: string; lastName: string; role: string };
        accessToken: string;
        refreshToken: string;
      }>('/auth/refresh', { refreshToken });

      useAuthStore.getState().setAuth(data.user as any, data.accessToken);
      localStorage.setItem('bengala-refresh-token', data.refreshToken);

      processQueue(null, data.accessToken);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      }

      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      useAuthStore.getState().clearAuth();
      window.location.href = '/iniciar-sesion';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
