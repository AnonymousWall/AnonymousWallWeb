import { httpClient } from '../api/httpClient';
import { API_ENDPOINTS } from '../config/constants';
import type { LoginRequest, LoginResponse } from '../types';

/**
 * Authentication Service
 * Handles authentication-related API calls
 */

export const authService = {
  /**
   * Login with email and password
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await httpClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
    return response;
  },

  /**
   * Logout
   */
  async logout(): Promise<void> {
    // Clear local auth data
    httpClient.clearAuth();
    // Optionally call logout endpoint if available
    // await httpClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  },
};
