import { httpClient } from '../api/httpClient';
import { API_ENDPOINTS } from '../config/constants';
import type { User, PaginatedResponse, Post, Comment } from '../types';

/**
 * User Service
 * Handles user management API calls
 */

export const userService = {
  /**
   * Get paginated list of users
   */
  async getUsers(
    page: number,
    limit: number,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc'
  ): Promise<PaginatedResponse<User>> {
    return httpClient.get<PaginatedResponse<User>>(API_ENDPOINTS.ADMIN.USERS, {
      page,
      limit,
      sortBy,
      sortOrder,
    });
  },

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User> {
    return httpClient.get<User>(API_ENDPOINTS.ADMIN.USER_BY_ID(userId));
  },

  /**
   * Block user
   */
  async blockUser(userId: string): Promise<{ message: string }> {
    return httpClient.post<{ message: string }>(API_ENDPOINTS.ADMIN.BLOCK_USER(userId));
  },

  /**
   * Unblock user
   */
  async unblockUser(userId: string): Promise<{ message: string }> {
    return httpClient.post<{ message: string }>(API_ENDPOINTS.ADMIN.UNBLOCK_USER(userId));
  },

  /**
   * Get posts by user ID
   */
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

  /**
   * Get comments by user ID
   */
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
};
