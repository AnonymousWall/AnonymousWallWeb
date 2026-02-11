import { useQuery } from '@tanstack/react-query';
import { userService } from '../api/userService';
import { postService } from '../api/postService';
import { commentService } from '../api/commentService';
import { reportService } from '../api/reportService';
import { QUERY_KEYS } from '../config/constants';
import type { DashboardStats } from '../types';

/**
 * Custom hook to fetch dashboard statistics
 */
export const useDashboardStats = () => {
  return useQuery<DashboardStats, Error>({
    queryKey: [QUERY_KEYS.DASHBOARD_STATS],
    queryFn: async () => {
      // Fetch data from multiple endpoints
      const [usersData, postsData, commentsData, reportsData] = await Promise.all([
        userService.getUsers(1, 1),
        postService.getPosts(1, 1),
        commentService.getComments(1, 1),
        reportService.getReports(1, 1),
      ]);

      // Get additional stats for blocked users and hidden posts
      const [blockedUsersData, hiddenPostsData] = await Promise.all([
        userService.getUsers(1, 100),
        postService.getPosts(1, 100, undefined, true),
      ]);

      const blockedCount = blockedUsersData.data.filter((u) => u.blocked).length;

      return {
        totalUsers: usersData.pagination.total,
        totalPosts: postsData.pagination.total,
        totalComments: commentsData.pagination.total,
        totalReports: reportsData.pagination.total,
        blockedUsers: blockedCount,
        hiddenPosts: hiddenPostsData.pagination.total,
        hiddenComments: 0, // Not available in current API
      };
    },
    staleTime: 60000, // Cache for 1 minute
  });
};
