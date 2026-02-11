import { create } from 'zustand';
import { authService } from '../api/authService';
import { httpClient } from '../api/httpClient';
import { AUTH_CONFIG, ADMIN_ROLES } from '../config/constants';
import type { User, LoginRequest } from '../types';
import { extractRoleFromJWT } from '../utils/jwt';

/**
 * Auth Store
 * Global state management for authentication using Zustand
 */

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  loadUser: () => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
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

      // Extract role from JWT token
      const role = extractRoleFromJWT(response.accessToken);
      if (!role) {
        throw new Error('Unable to extract role from token');
      }

      // Check if user has admin or moderator role
      if (!ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number])) {
        throw new Error('Unauthorized: Admin or Moderator role required');
      }

      // Add role to user object (backend doesn't include it in response)
      const userWithRole: User = {
        ...response.user,
        role: role as 'USER' | 'ADMIN' | 'MODERATOR',
      };

      // Save token and user
      httpClient.setToken(response.accessToken);
      localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(userWithRole));

      set({
        user: userWithRole,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      set({
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
  logout: () => {
    authService.logout();
    localStorage.removeItem(AUTH_CONFIG.USER_KEY);
    set({
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
      const storedUser = localStorage.getItem(AUTH_CONFIG.USER_KEY);

      if (token && storedUser) {
        const user = JSON.parse(storedUser) as User;
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      httpClient.clearAuth();
      localStorage.removeItem(AUTH_CONFIG.USER_KEY);
      set({ isLoading: false });
    }
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
