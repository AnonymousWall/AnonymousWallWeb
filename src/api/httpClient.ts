import axios, {
  type AxiosInstance,
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import {
  API_CONFIG,
  AUTH_CONFIG,
  AUTH_TOKEN_KEY,
  ERROR_MESSAGES,
  REFRESH_TOKEN_KEY,
} from '../config/constants';
import { isUsableTokenValue } from '../utils/authTokenUtils';

type PendingRequest = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

/**
 * HTTP Client
 * Centralized Axios instance with request/response interceptors
 */

class HttpClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private pendingQueue: PendingRequest[] = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status !== 401 || !originalRequest) {
          return Promise.reject(this.handleError(error));
        }

        if (originalRequest._retry) {
          const { useAuthStore } = await import('../stores/authStore');
          useAuthStore.getState().logout(false);
          return Promise.reject(error);
        }

        if (this.isRefreshing) {
          return new Promise((resolve, reject) => {
            originalRequest.headers = originalRequest.headers ?? {};
            this.pendingQueue.push({
              resolve: (token: string) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                originalRequest._retry = true;
                this.client(originalRequest).then(resolve).catch(reject);
              },
              reject,
            });
          });
        }

        this.isRefreshing = true;
        originalRequest._retry = true;
        originalRequest.headers = originalRequest.headers ?? {};

        try {
          const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
          if (!isUsableTokenValue(storedRefreshToken)) {
            throw new Error('No refresh token available');
          }

          const { authService } = await import('./authService');
          const tokenResponse = await authService.refreshToken(storedRefreshToken);
          const updatedRefreshToken = isUsableTokenValue(tokenResponse.refreshToken)
            ? tokenResponse.refreshToken
            : storedRefreshToken;

          localStorage.setItem(REFRESH_TOKEN_KEY, updatedRefreshToken);

          const { useAuthStore } = await import('../stores/authStore');
          useAuthStore.getState().setAccessToken(tokenResponse.accessToken);

          this.drainQueue(null, tokenResponse.accessToken);

          originalRequest.headers.Authorization = `Bearer ${tokenResponse.accessToken}`;
          return this.client(originalRequest);
        } catch (refreshError) {
          this.drainQueue(refreshError, null);

          const { useAuthStore } = await import('../stores/authStore');
          useAuthStore.getState().logout(false);

          return Promise.reject(refreshError);
        } finally {
          this.isRefreshing = false;
        }
      }
    );
  }

  private drainQueue(error: unknown, token: string | null): void {
    this.pendingQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else if (token) {
        resolve(token);
      }
    });
    this.pendingQueue = [];
  }

  /**
   * Set authentication token
   */
  setToken(token: string): void {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  /**
   * Clear authentication token
   */
  clearToken(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }

  /**
   * Clear all authentication data
   */
  clearAuth(): void {
    this.clearToken();
    localStorage.removeItem(AUTH_CONFIG.USER_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Handle API errors
   */
  private handleError(error: AxiosError): Error {
    if (!error.response) {
      return new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }

    const status = error.response.status;
    const data = error.response.data as { error?: string; message?: string };

    switch (status) {
      case 400:
        return new Error(data.error || data.message || ERROR_MESSAGES.VALIDATION_ERROR);
      case 401:
        return new Error(data.error || data.message || ERROR_MESSAGES.UNAUTHORIZED);
      case 403:
        return new Error(data.error || data.message || ERROR_MESSAGES.FORBIDDEN);
      case 404:
        return new Error(data.error || data.message || ERROR_MESSAGES.NOT_FOUND);
      case 500:
        return new Error(data.error || data.message || ERROR_MESSAGES.SERVER_ERROR);
      default:
        return new Error(data.error || data.message || ERROR_MESSAGES.UNKNOWN_ERROR);
    }
  }

  /**
   * GET request
   */
  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const response = await this.client.get<T>(url, { params });
    return response.data;
  }

  /**
   * POST request
   */
  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  /**
   * PUT request
   */
  async put<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  /**
   * DELETE request
   */
  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }

  /**
   * PATCH request
   */
  async patch<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.patch<T>(url, data);
    return response.data;
  }

  /**
   * GET request returning raw Blob (for authenticated media/image fetching)
   */
  async getBlob(url: string): Promise<Blob> {
    const response = await this.client.get<Blob>(url, { responseType: 'blob' });
    return response.data;
  }
}

// Export singleton instance
export const httpClient = new HttpClient();
