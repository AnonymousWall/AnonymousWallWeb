import { httpClient } from '../api/httpClient';
import { API_ENDPOINTS } from '../config/constants';
import type { ReportsResponse, PostReport, CommentReport } from '../types';

export const reportService = {
  async getReports(
    page: number,
    limit: number,
    type?: 'post' | 'comment',
    sortBy?: string,
    sortOrder?: 'asc' | 'desc'
  ): Promise<ReportsResponse> {
    return httpClient.get<ReportsResponse>(API_ENDPOINTS.ADMIN.REPORTS, {
      page,
      limit,
      type,
      sortBy,
      sortOrder,
    });
  },

  async getReportById(id: string, type: 'POST' | 'COMMENT'): Promise<PostReport | CommentReport> {
    return httpClient.get<PostReport | CommentReport>(API_ENDPOINTS.ADMIN.REPORT_BY_ID(id), {
      type,
    });
  },

  async resolveReport(id: string, type: 'POST' | 'COMMENT'): Promise<{ message: string }> {
    return httpClient.put<{ message: string }>(
      `${API_ENDPOINTS.ADMIN.RESOLVE_REPORT(id)}?type=${type}`
    );
  },

  async rejectReport(id: string, type: 'POST' | 'COMMENT'): Promise<{ message: string }> {
    return httpClient.put<{ message: string }>(
      `${API_ENDPOINTS.ADMIN.REJECT_REPORT(id)}?type=${type}`
    );
  },
};
