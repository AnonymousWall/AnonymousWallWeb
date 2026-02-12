import { httpClient } from '../api/httpClient';
import { API_ENDPOINTS } from '../config/constants';
import type { SchoolDomain, CreateSchoolDomainRequest } from '../types';

/**
 * School Domain Service
 * Handles school domain management API calls
 */

export const schoolDomainService = {
  /**
   * Get all school domains
   */
  async getSchoolDomains(): Promise<SchoolDomain[]> {
    return httpClient.get<SchoolDomain[]>(API_ENDPOINTS.ADMIN.SCHOOL_DOMAINS);
  },

  /**
   * Add a new school domain
   */
  async addSchoolDomain(data: CreateSchoolDomainRequest): Promise<SchoolDomain> {
    return httpClient.post<SchoolDomain>(API_ENDPOINTS.ADMIN.SCHOOL_DOMAINS, data);
  },

  /**
   * Delete a school domain
   */
  async deleteSchoolDomain(id: string): Promise<{ message: string }> {
    return httpClient.delete<{ message: string }>(API_ENDPOINTS.ADMIN.DELETE_SCHOOL_DOMAIN(id));
  },
};
