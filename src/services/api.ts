import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';
import type {
  User,
  Post,
  Comment,
  PaginatedResponse,
  ReportsResponse,
  LoginRequest,
  LoginResponse,
} from '../types';

// API Base URL - can be configured via environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

class ApiService {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid - clear token
          // Navigation will be handled by the component using useNavigate
          this.clearToken();
        }
        return Promise.reject(error);
      }
    );

    // Load token from localStorage
    this.loadToken();
  }

  private loadToken() {
    const token = localStorage.getItem('adminToken');
    if (token) {
      this.token = token;
    }
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('adminToken', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('adminToken');
  }

  getToken() {
    return this.token;
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.client.post<LoginResponse>('/auth/login/password', credentials);
    return response.data;
  }

  // User Management endpoints
  async getUsers(page = 1, limit = 20): Promise<PaginatedResponse<User>> {
    const response = await this.client.get<PaginatedResponse<User>>('/admin/users', {
      params: { page, limit },
    });
    return response.data;
  }

  async getUserById(userId: string): Promise<User> {
    const response = await this.client.get<User>(`/admin/users/${userId}`);
    return response.data;
  }

  async blockUser(userId: string): Promise<{ message: string }> {
    const response = await this.client.post<{ message: string }>(`/admin/users/${userId}/block`);
    return response.data;
  }

  async unblockUser(userId: string): Promise<{ message: string }> {
    const response = await this.client.post<{ message: string }>(`/admin/users/${userId}/unblock`);
    return response.data;
  }

  // Post Moderation endpoints
  async getPosts(page = 1, limit = 20, userId?: string, hidden?: boolean): Promise<PaginatedResponse<Post>> {
    const response = await this.client.get<PaginatedResponse<Post>>('/admin/posts', {
      params: { page, limit, userId, hidden },
    });
    return response.data;
  }

  async deletePost(postId: string): Promise<{ message: string }> {
    const response = await this.client.delete<{ message: string }>(`/admin/posts/${postId}`);
    return response.data;
  }

  // Comment Moderation endpoints
  async getComments(page = 1, limit = 20): Promise<PaginatedResponse<Comment>> {
    const response = await this.client.get<PaginatedResponse<Comment>>('/admin/comments', {
      params: { page, limit },
    });
    return response.data;
  }

  async deleteComment(commentId: string): Promise<{ message: string }> {
    const response = await this.client.delete<{ message: string }>(`/admin/comments/${commentId}`);
    return response.data;
  }

  // Report Management endpoints
  async getReports(page = 1, limit = 20, type?: 'post' | 'comment'): Promise<ReportsResponse> {
    const response = await this.client.get<ReportsResponse>('/admin/reports', {
      params: { page, limit, type },
    });
    return response.data;
  }
}

export const apiService = new ApiService();
