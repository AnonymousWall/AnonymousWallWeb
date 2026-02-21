import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../api/userService';
import { QUERY_KEYS } from '../config/constants';
import type {
  User,
  PaginatedResponse,
  Post,
  Comment,
  Internship,
  MarketplaceItem,
  Conversation,
} from '../types';

export const useUsers = (
  page: number,
  limit: number,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc',
  blocked?: boolean
) => {
  return useQuery<PaginatedResponse<User>, Error>({
    queryKey: [QUERY_KEYS.USERS, page, limit, sortBy, sortOrder, blocked],
    queryFn: () => userService.getUsers(page, limit, sortBy, sortOrder, blocked),
  });
};

export const useUser = (userId: string, enabled = true) => {
  return useQuery<User, Error>({
    queryKey: [QUERY_KEYS.USER, userId],
    queryFn: () => userService.getUserById(userId),
    enabled,
  });
};

export const useUserPosts = (
  userId: string,
  page: number,
  limit: number,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc',
  enabled = true
) => {
  return useQuery<PaginatedResponse<Post>, Error>({
    queryKey: [QUERY_KEYS.USER_POSTS, userId, page, limit, sortBy, sortOrder],
    queryFn: () => userService.getUserPosts(userId, page, limit, sortBy, sortOrder),
    enabled,
  });
};

export const useUserComments = (
  userId: string,
  page: number,
  limit: number,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc',
  enabled = true
) => {
  return useQuery<PaginatedResponse<Comment>, Error>({
    queryKey: [QUERY_KEYS.USER_COMMENTS, userId, page, limit, sortBy, sortOrder],
    queryFn: () => userService.getUserComments(userId, page, limit, sortBy, sortOrder),
    enabled,
  });
};

export const useUserInternships = (userId: string, page: number, limit: number, enabled = true) => {
  return useQuery<PaginatedResponse<Internship>, Error>({
    queryKey: [QUERY_KEYS.USER_INTERNSHIPS, userId, page, limit],
    queryFn: () => userService.getUserInternships(userId, page, limit),
    enabled,
  });
};

export const useUserMarketplaces = (
  userId: string,
  page: number,
  limit: number,
  enabled = true
) => {
  return useQuery<PaginatedResponse<MarketplaceItem>, Error>({
    queryKey: [QUERY_KEYS.USER_MARKETPLACES, userId, page, limit],
    queryFn: () => userService.getUserMarketplaces(userId, page, limit),
    enabled,
  });
};

export const useUserConversations = (
  userId: string,
  page: number,
  limit: number,
  enabled = true
) => {
  return useQuery<PaginatedResponse<Conversation>, Error>({
    queryKey: [QUERY_KEYS.USER_CONVERSATIONS, userId, page, limit],
    queryFn: () => userService.getUserConversations(userId, page, limit),
    enabled,
  });
};

export const useBlockUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => userService.blockUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] });
    },
  });
};

export const useUnblockUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => userService.unblockUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] });
    },
  });
};
