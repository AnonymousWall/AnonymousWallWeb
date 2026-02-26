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
    sortOrder?: 'asc' | 'desc',
    wall?: 'national' | 'campus'
  ): Promise<PaginatedResponse<MarketplaceItem>> {
    return httpClient.get<PaginatedResponse<MarketplaceItem>>(API_ENDPOINTS.ADMIN.MARKETPLACES, {
      page,
      limit,
      userId,
      hidden,
      sortBy,
      sortOrder,
      wall,
    });
  },

  async getMarketplaceById(id: string): Promise<MarketplaceItem> {
    return httpClient.get<MarketplaceItem>(API_ENDPOINTS.ADMIN.MARKETPLACE_BY_ID(id));
  },

  async getMarketplaceImages(
    id: string
  ): Promise<{ marketplaceItemId: string; imageUrls: string[] }> {
    return httpClient.get<{ marketplaceItemId: string; imageUrls: string[] }>(
      API_ENDPOINTS.ADMIN.MARKETPLACE_IMAGES(id)
    );
  },

  async hideMarketplace(id: string): Promise<{ message: string }> {
    return httpClient.put<{ message: string }>(API_ENDPOINTS.ADMIN.HIDE_MARKETPLACE(id));
  },

  async unhideMarketplace(id: string): Promise<{ message: string }> {
    return httpClient.put<{ message: string }>(API_ENDPOINTS.ADMIN.UNHIDE_MARKETPLACE(id));
  },
};
