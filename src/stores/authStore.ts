import { create } from 'zustand';
import { authService } from '../api/authService';
import { httpClient } from '../api/httpClient';
import { AUTH_CONFIG } from '../config/constants';
import type { User, LoginRequest } from '../types';

/**
 * Auth Store
 * Global state management for authentication using Zustand
 */

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  logout: (revokeServerToken?: boolean) => void;
  loadUser: () => void;
  setAccessToken: (token: string) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  /**
   * Login user
   */
  login: async (credentials: LoginRequest) => {
    try {
      set({ isLoading: true, error: null });

      const response = await authService.login(credentials);

      httpClient.setToken(response.accessToken);
      localStorage.setItem(AUTH_CONFIG.REFRESH_TOKEN_KEY, response.refreshToken);
      localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(response.user));

      set({
        token: response.accessToken,
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  /**
   * Logout user
   */
  logout: (revokeServerToken = true) => {
    const token = get().token;

    if (revokeServerToken && token) {
      void authService.logout(token).catch((error) => {
        console.error('Failed to revoke refresh tokens during logout:', error);
        // Intentionally swallowed — local logout proceeds regardless
      });
    }

    httpClient.clearAuth();
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  /**
   * Load user from localStorage
   */
  loadUser: () => {
    try {
      const token = httpClient.getToken();
      const refreshToken = localStorage.getItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
      const storedUser = localStorage.getItem(AUTH_CONFIG.USER_KEY);

      if (token && refreshToken && storedUser) {
        const user = JSON.parse(storedUser) as User;
        set({
          token,
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        httpClient.clearAuth();
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      httpClient.clearAuth();
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  /**
   * Update access token after silent refresh
   */
  setAccessToken: (token: string) => {
    httpClient.setToken(token);
    set({ token });
  },

  /**
   * Set error message
   */
  setError: (error: string | null) => {
    set({ error });
  },

  /**
   * Clear error message
   */
  clearError: () => {
    set({ error: null });
  },
}));
