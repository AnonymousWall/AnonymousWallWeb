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
    hidden?: boolean
  ): Promise<PaginatedResponse<Post>> {
    const params: Record<string, unknown> = {
      page,
      limit,
    };

    // Only include optional params if they are defined
    if (userId !== undefined) {
      params.userId = userId;
    }
    if (hidden !== undefined) {
      params.hidden = hidden;
    }

    return httpClient.get<PaginatedResponse<Post>>(API_ENDPOINTS.ADMIN.POSTS, params);
  },

  /**
   * Delete post (soft delete)
   */
  async deletePost(postId: string): Promise<{ message: string }> {
    return httpClient.delete<{ message: string }>(API_ENDPOINTS.ADMIN.DELETE_POST(postId));
  },
};
