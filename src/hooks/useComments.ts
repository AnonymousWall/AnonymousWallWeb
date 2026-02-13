import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentService } from '../api/commentService';
import { QUERY_KEYS } from '../config/constants';
import type { Comment, PaginatedResponse } from '../types';

/**
 * Custom hook to fetch comments
 */
export const useComments = (
  page: number,
  limit: number,
  hidden?: boolean,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
) => {
  return useQuery<PaginatedResponse<Comment>, Error>({
    queryKey: [QUERY_KEYS.COMMENTS, page, limit, hidden, sortBy, sortOrder],
    queryFn: () => commentService.getComments(page, limit, hidden, sortBy, sortOrder),
  });
};

/**
 * Custom hook to fetch a single comment
 */
export const useComment = (commentId: string, enabled = true) => {
  return useQuery<Comment, Error>({
    queryKey: [QUERY_KEYS.COMMENT, commentId],
    queryFn: () => commentService.getCommentById(commentId),
    enabled,
  });
};

/**
 * Custom hook to delete a comment
 */
export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => commentService.deleteComment(commentId),
    onSuccess: () => {
      // Invalidate comments query to refetch
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COMMENTS] });
    },
  });
};
