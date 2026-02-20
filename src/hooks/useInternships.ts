import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { internshipService } from '../api/internshipService';
import { QUERY_KEYS } from '../config/constants';
import type { Internship, PaginatedResponse } from '../types';

export const useInternships = (
  page: number,
  limit: number,
  userId?: string,
  hidden?: boolean,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
) => {
  return useQuery<PaginatedResponse<Internship>, Error>({
    queryKey: [QUERY_KEYS.INTERNSHIPS, page, limit, userId, hidden, sortBy, sortOrder],
    queryFn: () => internshipService.getInternships(page, limit, userId, hidden, sortBy, sortOrder),
  });
};

export const useInternship = (id: string, enabled = true) => {
  return useQuery<Internship, Error>({
    queryKey: [QUERY_KEYS.INTERNSHIP, id],
    queryFn: () => internshipService.getInternshipById(id),
    enabled,
  });
};

export const useHideInternship = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => internshipService.hideInternship(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INTERNSHIPS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INTERNSHIP, id] });
    },
  });
};

export const useUnhideInternship = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => internshipService.unhideInternship(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INTERNSHIPS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INTERNSHIP, id] });
    },
  });
};
