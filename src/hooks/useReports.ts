import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportService } from '../api/reportService';
import { QUERY_KEYS } from '../config/constants';
import type { ReportsResponse, PostReport, CommentReport } from '../types';

export const useReports = (
  page: number,
  limit: number,
  type?: 'post' | 'comment',
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
) => {
  return useQuery<ReportsResponse, Error>({
    queryKey: [QUERY_KEYS.REPORTS, page, limit, type, sortBy, sortOrder],
    queryFn: () => reportService.getReports(page, limit, type, sortBy, sortOrder),
  });
};

export const useReport = (id: string, type: 'POST' | 'COMMENT', enabled = true) => {
  return useQuery<PostReport | CommentReport, Error>({
    queryKey: [QUERY_KEYS.REPORT, id, type],
    queryFn: () => reportService.getReportById(id, type),
    enabled,
  });
};

export const useResolveReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, type }: { id: string; type: 'POST' | 'COMMENT' }) =>
      reportService.resolveReport(id, type),
    onSuccess: (_data, { id, type }) => {
      queryClient.setQueriesData<ReportsResponse>({ queryKey: [QUERY_KEYS.REPORTS] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          postReports: old.postReports.map((r) =>
            r.id === id && type === 'POST' ? { ...r, status: 'RESOLVED' as const } : r
          ),
          commentReports: old.commentReports.map((r) =>
            r.id === id && type === 'COMMENT' ? { ...r, status: 'RESOLVED' as const } : r
          ),
        };
      });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.REPORTS] });
    },
  });
};

export const useRejectReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, type }: { id: string; type: 'POST' | 'COMMENT' }) =>
      reportService.rejectReport(id, type),
    onSuccess: (_data, { id, type }) => {
      queryClient.setQueriesData<ReportsResponse>({ queryKey: [QUERY_KEYS.REPORTS] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          postReports: old.postReports.map((r) =>
            r.id === id && type === 'POST' ? { ...r, status: 'REJECTED' as const } : r
          ),
          commentReports: old.commentReports.map((r) =>
            r.id === id && type === 'COMMENT' ? { ...r, status: 'REJECTED' as const } : r
          ),
        };
      });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.REPORTS] });
    },
  });
};
