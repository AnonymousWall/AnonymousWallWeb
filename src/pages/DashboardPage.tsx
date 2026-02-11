import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  People as PeopleIcon,
  Article as ArticleIcon,
  Comment as CommentIcon,
  Report as ReportIcon,
  Block as BlockIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { apiService } from '../services/api';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="text.secondary" gutterBottom variant="overline">
              {title}
            </Typography>
            <Typography variant="h3" component="div" fontWeight="bold">
              {value.toLocaleString()}
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}20`,
              borderRadius: 2,
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box sx={{ fontSize: 40, color }}>
              {icon}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export const DashboardPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalComments: 0,
    totalReports: 0,
    blockedUsers: 0,
    hiddenPosts: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Fetch data from multiple endpoints
      const [usersData, postsData, commentsData, reportsData] = await Promise.all([
        apiService.getUsers(1, 1),
        apiService.getPosts(1, 1),
        apiService.getComments(1, 1),
        apiService.getReports(1, 1),
      ]);

      // Get additional stats for blocked users and hidden posts
      const [blockedUsersData, hiddenPostsData] = await Promise.all([
        apiService.getUsers(1, 100), // Fetch first page to count blocked
        apiService.getPosts(1, 100, undefined, true), // Fetch hidden posts
      ]);

      const blockedCount = blockedUsersData.data.filter(u => u.blocked).length;

      setStats({
        totalUsers: usersData.pagination.total,
        totalPosts: postsData.pagination.total,
        totalComments: commentsData.pagination.total,
        totalReports: reportsData.pagination.total,
        blockedUsers: blockedCount,
        hiddenPosts: hiddenPostsData.pagination.total,
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load statistics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Dashboard Overview
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Overview of system statistics and metrics
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<PeopleIcon />}
          color="#1976d2"
        />
        <StatCard
          title="Total Posts"
          value={stats.totalPosts}
          icon={<ArticleIcon />}
          color="#2e7d32"
        />
        <StatCard
          title="Total Comments"
          value={stats.totalComments}
          icon={<CommentIcon />}
          color="#ed6c02"
        />
        <StatCard
          title="Total Reports"
          value={stats.totalReports}
          icon={<ReportIcon />}
          color="#d32f2f"
        />
        <StatCard
          title="Blocked Users"
          value={stats.blockedUsers}
          icon={<BlockIcon />}
          color="#9c27b0"
        />
        <StatCard
          title="Hidden Posts"
          value={stats.hiddenPosts}
          icon={<VisibilityOffIcon />}
          color="#757575"
        />
      </Box>
    </Box>
  );
};
