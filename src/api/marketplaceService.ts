import { httpClient } from '../api/httpClient';
import { API_ENDPOINTS } from '../config/constants';
import type { MarketplaceItem, PaginatedResponse } from '../types';

export const marketplaceService = {
  async getMarketplaces(
    page: number,
    limit: number,
    userId?: string,
    hidden?: boolean,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc'
  ): Promise<PaginatedResponse<MarketplaceItem>> {
    return httpClient.get<PaginatedResponse<MarketplaceItem>>(API_ENDPOINTS.ADMIN.MARKETPLACES, {
      page,
      limit,
      userId,
      hidden,
      sortBy,
      sortOrder,
    });
  },

  async getMarketplaceById(id: string): Promise<MarketplaceItem> {
    return httpClient.get<MarketplaceItem>(API_ENDPOINTS.ADMIN.MARKETPLACE_BY_ID(id));
  },

  async hideMarketplace(id: string): Promise<{ message: string }> {
    return httpClient.put<{ message: string }>(API_ENDPOINTS.ADMIN.HIDE_MARKETPLACE(id));
  },

  async unhideMarketplace(id: string): Promise<{ message: string }> {
    return httpClient.put<{ message: string }>(API_ENDPOINTS.ADMIN.UNHIDE_MARKETPLACE(id));
  },
};
