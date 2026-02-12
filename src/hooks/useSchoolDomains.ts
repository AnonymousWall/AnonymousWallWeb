import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schoolDomainService } from '../api/schoolDomainService';
import { QUERY_KEYS } from '../config/constants';
import type { SchoolDomain, CreateSchoolDomainRequest } from '../types';

/**
 * Custom hook to fetch school domains
 */
export const useSchoolDomains = () => {
  return useQuery<SchoolDomain[], Error>({
    queryKey: [QUERY_KEYS.SCHOOL_DOMAINS],
    queryFn: () => schoolDomainService.getSchoolDomains(),
  });
};

/**
 * Custom hook to add a school domain
 */
export const useAddSchoolDomain = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSchoolDomainRequest) => schoolDomainService.addSchoolDomain(data),
    onSuccess: () => {
      // Invalidate school domains query to refetch
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SCHOOL_DOMAINS] });
    },
  });
};

/**
 * Custom hook to delete a school domain
 */
export const useDeleteSchoolDomain = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => schoolDomainService.deleteSchoolDomain(id),
    onSuccess: () => {
      // Invalidate school domains query to refetch
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SCHOOL_DOMAINS] });
    },
  });
};
