import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentService } from '../api/commentService';
import { QUERY_KEYS } from '../config/constants';
import type { Comment, PaginatedResponse } from '../types';

export const useComments = (
  page: number,
  limit: number,
  hidden?: boolean,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc',
  userId?: string
) => {
  return useQuery<PaginatedResponse<Comment>, Error>({
    queryKey: [QUERY_KEYS.COMMENTS, page, limit, hidden, sortBy, sortOrder, userId],
    queryFn: () => commentService.getComments(page, limit, hidden, sortBy, sortOrder, userId),
  });
};

export const useComment = (commentId: string, enabled = true) => {
  return useQuery<Comment, Error>({
    queryKey: [QUERY_KEYS.COMMENT, commentId],
    queryFn: () => commentService.getCommentById(commentId),
    enabled,
  });
};

export const useHideComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => commentService.hideComment(commentId),
    onSuccess: (_data, commentId) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COMMENTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COMMENT, commentId] });
    },
  });
};

export const useUnhideComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => commentService.unhideComment(commentId),
    onSuccess: (_data, commentId) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COMMENTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COMMENT, commentId] });
    },
  });
};
