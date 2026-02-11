/**
 * Application Configuration
 * Centralized configuration for the admin dashboard
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
} as const;

// Authentication Configuration
export const AUTH_CONFIG = {
  TOKEN_KEY: 'adminToken',
  USER_KEY: 'adminUser',
  REFRESH_TOKEN_KEY: 'adminRefreshToken',
  TOKEN_EXPIRY_BUFFER: 5 * 60 * 1000, // 5 minutes before expiry
} as const;

// Pagination Configuration
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

// Route Configuration
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  USERS: '/users',
  POSTS: '/posts',
  COMMENTS: '/comments',
  REPORTS: '/reports',
} as const;

// Role Configuration
export const ROLES = {
  ADMIN: 'ADMIN',
  MODERATOR: 'MODERATOR',
  USER: 'USER',
} as const;

// Allowed roles for admin access
export const ADMIN_ROLES = [ROLES.ADMIN, ROLES.MODERATOR] as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login/password',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  ADMIN: {
    USERS: '/admin/users',
    USER_BY_ID: (id: string) => `/admin/users/${id}`,
    BLOCK_USER: (id: string) => `/admin/users/${id}/block`,
    UNBLOCK_USER: (id: string) => `/admin/users/${id}/unblock`,
    POSTS: '/admin/posts',
    DELETE_POST: (id: string) => `/admin/posts/${id}`,
    COMMENTS: '/admin/comments',
    DELETE_COMMENT: (id: string) => `/admin/comments/${id}`,
    REPORTS: '/admin/reports',
  },
} as const;

// Query Keys for React Query
export const QUERY_KEYS = {
  USERS: 'users',
  USER: 'user',
  POSTS: 'posts',
  COMMENTS: 'comments',
  REPORTS: 'reports',
  DASHBOARD_STATS: 'dashboard-stats',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied. Admin or Moderator role required.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  LOGOUT_SUCCESS: 'Logged out successfully.',
  USER_BLOCKED: 'User blocked successfully.',
  USER_UNBLOCKED: 'User unblocked successfully.',
  POST_DELETED: 'Post deleted successfully.',
  COMMENT_DELETED: 'Comment deleted successfully.',
} as const;
