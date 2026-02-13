import { httpClient } from '../api/httpClient';
import { API_ENDPOINTS } from '../config/constants';
import type { Comment, PaginatedResponse } from '../types';

/**
 * Comment Service
 * Handles comment management API calls
 */

export const commentService = {
  /**
   * Get paginated list of comments
   */
  async getComments(
    page: number,
    limit: number,
    hidden?: boolean,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc'
  ): Promise<PaginatedResponse<Comment>> {
    return httpClient.get<PaginatedResponse<Comment>>(API_ENDPOINTS.ADMIN.COMMENTS, {
      page,
      limit,
      hidden,
      sortBy,
      sortOrder,
    });
  },

  /**
   * Get comment by ID
   */
  async getCommentById(commentId: string): Promise<Comment> {
    return httpClient.get<Comment>(API_ENDPOINTS.ADMIN.COMMENT_BY_ID(commentId));
  },

  /**
   * Delete comment (soft delete)
   */
  async deleteComment(commentId: string): Promise<{ message: string }> {
    return httpClient.delete<{ message: string }>(API_ENDPOINTS.ADMIN.DELETE_COMMENT(commentId));
  },
};
