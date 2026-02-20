import { httpClient } from '../api/httpClient';
import { API_ENDPOINTS } from '../config/constants';
import type {
  User,
  PaginatedResponse,
  Post,
  Comment,
  Internship,
  MarketplaceItem,
  Conversation,
} from '../types';

export const userService = {
  async getUsers(
    page: number,
    limit: number,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
    blocked?: boolean
  ): Promise<PaginatedResponse<User>> {
    return httpClient.get<PaginatedResponse<User>>(API_ENDPOINTS.ADMIN.USERS, {
      page,
      limit,
      sortBy,
      sortOrder,
      blocked,
    });
  },

  async getUserById(userId: string): Promise<User> {
    return httpClient.get<User>(API_ENDPOINTS.ADMIN.USER_BY_ID(userId));
  },

  async blockUser(userId: string): Promise<{ message: string }> {
    return httpClient.put<{ message: string }>(API_ENDPOINTS.ADMIN.BLOCK_USER(userId));
  },

  async unblockUser(userId: string): Promise<{ message: string }> {
    return httpClient.put<{ message: string }>(API_ENDPOINTS.ADMIN.UNBLOCK_USER(userId));
  },

  async getUserPosts(
    userId: string,
    page: number,
    limit: number,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc'
  ): Promise<PaginatedResponse<Post>> {
    return httpClient.get<PaginatedResponse<Post>>(API_ENDPOINTS.ADMIN.USER_POSTS(userId), {
      page,
      limit,
      sortBy,
      sortOrder,
    });
  },

  async getUserComments(
    userId: string,
    page: number,
    limit: number,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc'
  ): Promise<PaginatedResponse<Comment>> {
    return httpClient.get<PaginatedResponse<Comment>>(API_ENDPOINTS.ADMIN.USER_COMMENTS(userId), {
      page,
      limit,
      sortBy,
      sortOrder,
    });
  },

  async getUserInternships(
    userId: string,
    page: number,
    limit: number
  ): Promise<PaginatedResponse<Internship>> {
    return httpClient.get<PaginatedResponse<Internship>>(
      API_ENDPOINTS.ADMIN.USER_INTERNSHIPS(userId),
      { page, limit }
    );
  },

  async getUserMarketplaces(
    userId: string,
    page: number,
    limit: number
  ): Promise<PaginatedResponse<MarketplaceItem>> {
    return httpClient.get<PaginatedResponse<MarketplaceItem>>(
      API_ENDPOINTS.ADMIN.USER_MARKETPLACES(userId),
      { page, limit }
    );
  },

  async getUserConversations(
    userId: string,
    page: number,
    limit: number
  ): Promise<PaginatedResponse<Conversation>> {
    return httpClient.get<PaginatedResponse<Conversation>>(
      API_ENDPOINTS.ADMIN.USER_CONVERSATIONS(userId),
      { page, limit }
    );
  },
};
