import { create } from 'zustand';
import { authService } from '../api/authService';
import { AUTH_CONFIG, AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../config/constants';
import type { User, LoginRequest } from '../types';
import { decodeJwtPayload, isUsableTokenValue } from '../utils/authTokenUtils';

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
  loadUser: () => Promise<void>;
  setAccessToken: (token: string) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const isExpiredAccessToken = (token: string): boolean => {
  const payload = decodeJwtPayload(token);
  return typeof payload?.exp === 'number' && payload.exp * 1000 < Date.now();
};

let hydrationRefreshPromise: Promise<{
  accessToken: string;
  refreshToken?: string;
}> | null = null;

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

      localStorage.setItem(AUTH_TOKEN_KEY, response.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
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

    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(AUTH_CONFIG.USER_KEY);
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
  loadUser: async () => {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      const storedUser = localStorage.getItem(AUTH_CONFIG.USER_KEY);

      if (isUsableTokenValue(token) && isUsableTokenValue(refreshToken) && storedUser) {
        const user = JSON.parse(storedUser) as User;

        if (isExpiredAccessToken(token)) {
          hydrationRefreshPromise ??= authService.refreshToken(refreshToken).finally(() => {
            hydrationRefreshPromise = null;
          });

          const refreshedTokens = await hydrationRefreshPromise;
          const nextRefreshToken = isUsableTokenValue(refreshedTokens.refreshToken)
            ? refreshedTokens.refreshToken
            : refreshToken;

          localStorage.setItem(AUTH_TOKEN_KEY, refreshedTokens.accessToken);
          localStorage.setItem(REFRESH_TOKEN_KEY, nextRefreshToken);

          set({
            token: refreshedTokens.accessToken,
            user,
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        }

        set({
          token,
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(AUTH_CONFIG.USER_KEY);
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(AUTH_CONFIG.USER_KEY);
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
    localStorage.setItem(AUTH_TOKEN_KEY, token);
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
