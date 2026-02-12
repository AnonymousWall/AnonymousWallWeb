import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentService } from '../api/commentService';
import { QUERY_KEYS } from '../config/constants';
import type { Comment, PaginatedResponse } from '../types';

/**
 * Custom hook to fetch comments
 */
export const useComments = (page: number, limit: number, hidden?: boolean) => {
  return useQuery<PaginatedResponse<Comment>, Error>({
    queryKey: [QUERY_KEYS.COMMENTS, page, limit, hidden],
    queryFn: () => commentService.getComments(page, limit, hidden),
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
