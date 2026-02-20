import { httpClient } from '../api/httpClient';
import { API_ENDPOINTS } from '../config/constants';
import type { Comment, PaginatedResponse } from '../types';

export const commentService = {
  async getComments(
    page: number,
    limit: number,
    hidden?: boolean,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
    userId?: string
  ): Promise<PaginatedResponse<Comment>> {
    return httpClient.get<PaginatedResponse<Comment>>(API_ENDPOINTS.ADMIN.COMMENTS, {
      page,
      limit,
      hidden,
      sortBy,
      sortOrder,
      userId,
    });
  },

  async getCommentById(commentId: string): Promise<Comment> {
    return httpClient.get<Comment>(API_ENDPOINTS.ADMIN.COMMENT_BY_ID(commentId));
  },

  async hideComment(commentId: string): Promise<{ message: string }> {
    return httpClient.put<{ message: string }>(API_ENDPOINTS.ADMIN.HIDE_COMMENT(commentId));
  },

  async unhideComment(commentId: string): Promise<{ message: string }> {
    return httpClient.put<{ message: string }>(API_ENDPOINTS.ADMIN.UNHIDE_COMMENT(commentId));
  },
};
