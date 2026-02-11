// User types
export interface User {
  id: string;
  email: string;
  profileName: string;
  schoolDomain: string;
  role?: 'USER' | 'ADMIN' | 'MODERATOR'; // Optional: Not included in login response, extracted from JWT by backend
  blocked: boolean;
  verified: boolean;
  passwordSet: boolean;
  reportCount: number;
  createdAt: string;
}

// Post types
export interface Post {
  id: string;
  userId: string;
  profileName: string;
  title: string;
  content: string;
  wall: 'campus' | 'national';
  schoolDomain: string;
  likeCount: number;
  commentCount: number;
  hidden: boolean;
  createdAt: string;
  updatedAt: string;
}

// Comment types
export interface Comment {
  id: string;
  postId: string;
  userId: string;
  profileName: string;
  text: string;
  hidden: boolean;
  createdAt: string;
}

// Report types
export interface PostReport {
  id: string;
  postId: string;
  reporterUserId: string;
  reason: string;
  createdAt: string;
}

export interface CommentReport {
  id: string;
  commentId: string;
  reporterUserId: string;
  reason: string;
  createdAt: string;
}

export interface ReportsResponse {
  postReports: PostReport[];
  commentReports: CommentReport[];
  pagination: PaginationInfo;
}

// Pagination types
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
}

// Statistics types
export interface DashboardStats {
  totalUsers: number;
  totalPosts: number;
  totalComments: number;
  totalReports: number;
  blockedUsers: number;
  hiddenPosts: number;
  hiddenComments: number;
}
