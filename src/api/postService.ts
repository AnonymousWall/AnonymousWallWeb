import { httpClient } from '../api/httpClient';
import { API_ENDPOINTS } from '../config/constants';
import type { Post, PaginatedResponse } from '../types';

/**
 * Post Service
 * Handles post management API calls
 */

export const postService = {
  /**
   * Get paginated list of posts
   */
  async getPosts(
    page: number,
    limit: number,
    userId?: string,
    hidden?: boolean,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
    wall?: 'national' | 'campus'
  ): Promise<PaginatedResponse<Post>> {
    return httpClient.get<PaginatedResponse<Post>>(API_ENDPOINTS.ADMIN.POSTS, {
      page,
      limit,
      userId,
      hidden,
      sortBy,
      sortOrder,
      wall,
    });
  },

  /**
   * Delete post (soft delete)
   */
  async deletePost(postId: string): Promise<{ message: string }> {
    return httpClient.delete<{ message: string }>(API_ENDPOINTS.ADMIN.DELETE_POST(postId));
  },
};
