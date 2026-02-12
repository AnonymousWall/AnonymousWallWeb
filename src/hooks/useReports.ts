import { useQuery } from '@tanstack/react-query';
import { reportService } from '../api/reportService';
import { QUERY_KEYS } from '../config/constants';
import type { ReportsResponse } from '../types';

/**
 * Custom hook to fetch reports
 */
export const useReports = (
  page: number,
  limit: number,
  type?: 'post' | 'comment',
  sortBy?: string,
  order?: 'asc' | 'desc'
) => {
  return useQuery<ReportsResponse, Error>({
    queryKey: [QUERY_KEYS.REPORTS, page, limit, type, sortBy, order],
    queryFn: () => reportService.getReports(page, limit, type, sortBy, order),
  });
};
