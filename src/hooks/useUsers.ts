import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../api/userService';
import { QUERY_KEYS } from '../config/constants';
import type { User, PaginatedResponse } from '../types';

/**
 * Custom hook to fetch users
 */
export const useUsers = (page: number, limit: number, sortBy?: string, order?: 'asc' | 'desc') => {
  return useQuery<PaginatedResponse<User>, Error>({
    queryKey: [QUERY_KEYS.USERS, page, limit, sortBy, order],
    queryFn: () => userService.getUsers(page, limit, sortBy, order),
  });
};

/**
 * Custom hook to fetch a single user
 */
export const useUser = (userId: string, enabled = true) => {
  return useQuery<User, Error>({
    queryKey: [QUERY_KEYS.USER, userId],
    queryFn: () => userService.getUserById(userId),
    enabled,
  });
};

/**
 * Custom hook to block a user
 */
export const useBlockUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => userService.blockUser(userId),
    onSuccess: () => {
      // Invalidate users query to refetch
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] });
    },
  });
};

/**
 * Custom hook to unblock a user
 */
export const useUnblockUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => userService.unblockUser(userId),
    onSuccess: () => {
      // Invalidate users query to refetch
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] });
    },
  });
};
