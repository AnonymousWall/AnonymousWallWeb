import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postService } from '../api/postService';
import { QUERY_KEYS } from '../config/constants';
import type { Post, PaginatedResponse } from '../types';

/**
 * Custom hook to fetch posts
 */
export const usePosts = (page: number, limit: number, userId?: string, hidden?: boolean) => {
  return useQuery<PaginatedResponse<Post>, Error>({
    queryKey: [QUERY_KEYS.POSTS, page, limit, userId, hidden],
    queryFn: () => postService.getPosts(page, limit, userId, hidden),
  });
};

/**
 * Custom hook to delete a post
 */
export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => postService.deletePost(postId),
    onSuccess: () => {
      // Invalidate posts query to refetch
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.POSTS] });
    },
  });
};
