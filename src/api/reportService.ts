import { httpClient } from '../api/httpClient';
import { API_ENDPOINTS } from '../config/constants';
import type { ReportsResponse } from '../types';

/**
 * Report Service
 * Handles report management API calls
 */

export const reportService = {
  /**
   * Get paginated list of reports
   */
  async getReports(
    page: number,
    limit: number,
    type?: 'post' | 'comment',
    sortBy?: string,
    order?: 'asc' | 'desc'
  ): Promise<ReportsResponse> {
    return httpClient.get<ReportsResponse>(API_ENDPOINTS.ADMIN.REPORTS, {
      page,
      limit,
      type,
      sortBy,
      order,
    });
  },
};
