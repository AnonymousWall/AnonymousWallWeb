import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { marketplaceService } from '../api/marketplaceService';
import { QUERY_KEYS } from '../config/constants';
import type { MarketplaceItem, PaginatedResponse } from '../types';

export const useMarketplaces = (
  page: number,
  limit: number,
  userId?: string,
  hidden?: boolean,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
) => {
  return useQuery<PaginatedResponse<MarketplaceItem>, Error>({
    queryKey: [QUERY_KEYS.MARKETPLACES, page, limit, userId, hidden, sortBy, sortOrder],
    queryFn: () =>
      marketplaceService.getMarketplaces(page, limit, userId, hidden, sortBy, sortOrder),
  });
};

export const useMarketplace = (id: string, enabled = true) => {
  return useQuery<MarketplaceItem, Error>({
    queryKey: [QUERY_KEYS.MARKETPLACE, id],
    queryFn: () => marketplaceService.getMarketplaceById(id),
    enabled,
  });
};

export const useHideMarketplace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => marketplaceService.hideMarketplace(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MARKETPLACES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MARKETPLACE, id] });
    },
  });
};

export const useUnhideMarketplace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => marketplaceService.unhideMarketplace(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MARKETPLACES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MARKETPLACE, id] });
    },
  });
};
