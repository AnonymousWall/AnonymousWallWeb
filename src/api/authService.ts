import axios from 'axios';
import { httpClient } from '../api/httpClient';
import { API_CONFIG, API_ENDPOINTS } from '../config/constants';
import type { LoginRequest, LoginResponse } from '../types';

export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
}

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
   * Exchange a refresh token for a new token pair
   */
  async refreshToken(refreshToken: string): Promise<TokenRefreshResponse> {
    // Use axios directly so a 401 from /auth/refresh does not recurse through the
    // shared client interceptor and trigger an infinite refresh loop.
    const response = await axios.post<TokenRefreshResponse>(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
      { refreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  },

  /**
   * Logout
   */
  async logout(token: string): Promise<void> {
    await httpClient.post<void>(API_ENDPOINTS.AUTH.LOGOUT, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
