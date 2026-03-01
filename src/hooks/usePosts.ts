import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postService } from '../api/postService';
import { QUERY_KEYS } from '../config/constants';
import type { Post, PaginatedResponse, PollData } from '../types';

export const usePosts = (
  page: number,
  limit: number,
  userId?: string,
  hidden?: boolean,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc',
  wall?: 'national' | 'campus'
) => {
  return useQuery<PaginatedResponse<Post>, Error>({
    queryKey: [QUERY_KEYS.POSTS, page, limit, userId, hidden, sortBy, sortOrder, wall],
    queryFn: () => postService.getPosts(page, limit, userId, hidden, sortBy, sortOrder, wall),
  });
};

export const usePost = (postId: string, enabled = true) => {
  return useQuery<Post, Error>({
    queryKey: [QUERY_KEYS.POST, postId],
    queryFn: () => postService.getPostById(postId),
    enabled,
  });
};

export const usePostPoll = (postId: string, enabled = true) => {
  return useQuery<PollData, Error>({
    queryKey: [QUERY_KEYS.POST_POLL, postId],
    queryFn: () => postService.getPostPoll(postId),
    enabled,
  });
};

export const usePostImages = (postId: string, enabled = true) => {
  return useQuery<{ postId: string; imageUrls: string[] }, Error>({
    queryKey: [QUERY_KEYS.POST_IMAGES, postId],
    queryFn: () => postService.getPostImages(postId),
    enabled,
  });
};

export const useHidePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => postService.hidePost(postId),
    onSuccess: (_data, postId) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.POSTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.POST, postId] });
    },
  });
};

export const useUnhidePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => postService.unhidePost(postId),
    onSuccess: (_data, postId) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.POSTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.POST, postId] });
    },
  });
};
