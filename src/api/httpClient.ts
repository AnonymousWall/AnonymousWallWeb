import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG, AUTH_CONFIG, ERROR_MESSAGES } from '../config/constants';

/**
 * HTTP Client
 * Centralized Axios instance with request/response interceptors
 */

class HttpClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
    this.loadToken();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (this.token && config.headers) {
          config.headers.Authorization = `Bearer ${this.token}`;
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

        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
          if (!originalRequest._retry) {
            originalRequest._retry = true;

            // Try to refresh token
            try {
              await this.refreshToken();
              return this.client(originalRequest);
            } catch {
              // Refresh failed, clear auth and redirect to login
              this.clearAuth();
              window.location.href = '/login';
              return Promise.reject(error);
            }
          } else {
            // Refresh already attempted, clear auth
            this.clearAuth();
            window.location.href = '/login';
          }
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * Load token from localStorage
   */
  private loadToken(): void {
    const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
    if (token) {
      this.token = token;
    }
  }

  /**
   * Set authentication token
   */
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, token);
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Clear authentication token
   */
  clearToken(): void {
    this.token = null;
    localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
  }

  /**
   * Clear all authentication data
   */
  clearAuth(): void {
    this.clearToken();
    localStorage.removeItem(AUTH_CONFIG.USER_KEY);
    localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
  }

  /**
   * Refresh authentication token
   */
  private async refreshToken(): Promise<void> {
    const refreshToken = localStorage.getItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.client.post('/auth/refresh', { refreshToken });
    const { accessToken } = response.data;
    this.setToken(accessToken);
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
  async post<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.post<T>(url, data);
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
}

// Export singleton instance
export const httpClient = new HttpClient();
