import { httpClient } from '../api/httpClient';
import { API_ENDPOINTS } from '../config/constants';
import type { Internship, PaginatedResponse } from '../types';

export const internshipService = {
  async getInternships(
    page: number,
    limit: number,
    userId?: string,
    hidden?: boolean,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc'
  ): Promise<PaginatedResponse<Internship>> {
    return httpClient.get<PaginatedResponse<Internship>>(API_ENDPOINTS.ADMIN.INTERNSHIPS, {
      page,
      limit,
      userId,
      hidden,
      sortBy,
      sortOrder,
    });
  },

  async getInternshipById(id: string): Promise<Internship> {
    return httpClient.get<Internship>(API_ENDPOINTS.ADMIN.INTERNSHIP_BY_ID(id));
  },

  async hideInternship(id: string): Promise<{ message: string }> {
    return httpClient.put<{ message: string }>(API_ENDPOINTS.ADMIN.HIDE_INTERNSHIP(id));
  },

  async unhideInternship(id: string): Promise<{ message: string }> {
    return httpClient.put<{ message: string }>(API_ENDPOINTS.ADMIN.UNHIDE_INTERNSHIP(id));
  },
};
