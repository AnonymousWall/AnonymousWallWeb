import { httpClient } from '../api/httpClient';
import { API_ENDPOINTS } from '../config/constants';
import type { Post, PaginatedResponse } from '../types';

export const postService = {
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

  async getPostById(postId: string): Promise<Post> {
    return httpClient.get<Post>(API_ENDPOINTS.ADMIN.POST_BY_ID(postId));
  },

  async getPostImages(postId: string): Promise<{ postId: string; imageUrls: string[] }> {
    return httpClient.get<{ postId: string; imageUrls: string[] }>(
      API_ENDPOINTS.ADMIN.POST_IMAGES(postId)
    );
  },

  async hidePost(postId: string): Promise<{ message: string }> {
    return httpClient.put<{ message: string }>(API_ENDPOINTS.ADMIN.HIDE_POST(postId));
  },

  async unhidePost(postId: string): Promise<{ message: string }> {
    return httpClient.put<{ message: string }>(API_ENDPOINTS.ADMIN.UNHIDE_POST(postId));
  },
};
