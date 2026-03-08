import axios from 'axios';
import { httpClient } from '../api/httpClient';
import { API_CONFIG, API_ENDPOINTS } from '../config/constants';
import type { LoginRequest, LoginResponse } from '../types';
import { normalizeTokenValue } from '../utils/authTokenUtils';

type TokenPayload = {
  accessToken?: string;
  refreshToken?: string;
  access_token?: string;
  refresh_token?: string;
};

export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken?: string;
}

const normalizeTokenPayload = <T extends TokenPayload>(payload: T): T & TokenRefreshResponse => {
  const accessToken = normalizeTokenValue(payload.accessToken ?? payload.access_token);
  const refreshToken = normalizeTokenValue(payload.refreshToken ?? payload.refresh_token);

  if (!accessToken) {
    throw new Error(
      'Missing access token in authentication response (expected accessToken or access_token)'
    );
  }

  return {
    ...payload,
    accessToken,
    refreshToken,
  };
};

/**
 * Authentication Service
 * Handles authentication-related API calls
 */

export const authService = {
  /**
   * Login with email and password
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await httpClient.post<LoginResponse & TokenPayload>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    const normalizedResponse = normalizeTokenPayload(response);

    if (!normalizedResponse.refreshToken) {
      throw new Error(
        'Missing refresh token in login response (expected refreshToken or refresh_token)'
      );
    }

    if (!response.user) {
      throw new Error('Missing user in login response');
    }

    return {
      accessToken: normalizedResponse.accessToken,
      refreshToken: normalizedResponse.refreshToken,
      user: response.user,
    };
  },

  /**
   * Exchange a refresh token for a new token pair
   */
  async refreshToken(refreshToken: string): Promise<TokenRefreshResponse> {
    // Use axios directly so a 401 from /auth/refresh does not recurse through the
    // shared client interceptor and trigger an infinite refresh loop.
    const response = await axios.post<TokenRefreshResponse & TokenPayload>(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
      { refreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return normalizeTokenPayload(response.data);
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
