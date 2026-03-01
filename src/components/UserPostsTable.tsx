import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Poll as PollIcon } from '@mui/icons-material';
import { useUserPosts } from '../hooks/useUsers';
import { PAGINATION_CONFIG, QUERY_KEYS } from '../config/constants';
import { format } from 'date-fns';
import { PostLink } from './EntityLinks';
import { ImageViewerButton } from './ImageViewerButton';
import { postService } from '../api/postService';

interface UserPostsTableProps {
  userId: string;
}

export const UserPostsTable: React.FC<UserPostsTableProps> = ({ userId }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(PAGINATION_CONFIG.DEFAULT_PAGE_SIZE);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch user posts with pagination and sorting
  const { data, isLoading, error } = useUserPosts(
    userId,
    page + 1,
    rowsPerPage,
    sortBy,
    sortOrder,
    !!userId
  );

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      // Toggle order if clicking the same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // When switching to a new field, use desc for dates and asc for others
      setSortOrder(field === 'createdAt' ? 'desc' : 'asc');
    }
    setSortBy(field);
    setPage(0);
  };

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error.message}
      </Alert>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        User Posts
      </Typography>
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'title'}
                    direction={sortBy === 'title' ? sortOrder : 'asc'}
                    onClick={() => handleSort('title')}
                  >
                    Title
                  </TableSortLabel>
                </TableCell>
                <TableCell>Wall</TableCell>
                <TableCell>School</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'likeCount'}
                    direction={sortBy === 'likeCount' ? sortOrder : 'asc'}
                    onClick={() => handleSort('likeCount')}
                  >
                    Likes
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'commentCount'}
                    direction={sortBy === 'commentCount' ? sortOrder : 'asc'}
                    onClick={() => handleSort('commentCount')}
                  >
                    Comments
                  </TableSortLabel>
                </TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'createdAt'}
                    direction={sortBy === 'createdAt' ? sortOrder : 'asc'}
                    onClick={() => handleSort('createdAt')}
                  >
                    Created
                  </TableSortLabel>
                </TableCell>
                <TableCell>Images</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : !data || data.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No posts found
                  </TableCell>
                </TableRow>
              ) : (
                data.data.map((post) => (
                  <TableRow key={post.id} hover>
                    <TableCell>
                      <PostLink postId={post.id} sx={{ maxWidth: 200 }}>
                        {post.title}
                      </PostLink>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={post.wall}
                        size="small"
                        color={post.wall === 'campus' ? 'primary' : 'secondary'}
                      />
                    </TableCell>
                    <TableCell>{post.schoolDomain || 'N/A'}</TableCell>
                    <TableCell>{post.likeCount}</TableCell>
                    <TableCell>{post.commentCount}</TableCell>
                    <TableCell>
                      <Chip
                        label={post.hidden ? 'Hidden' : 'Visible'}
                        size="small"
                        color={post.hidden ? 'error' : 'success'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={post.postType === 'poll' ? <PollIcon /> : undefined}
                        label={post.postType === 'poll' ? 'Poll' : 'Standard'}
                        size="small"
                        color={post.postType === 'poll' ? 'info' : 'default'}
                      />
                    </TableCell>
                    <TableCell>{format(new Date(post.createdAt), 'MMM d, yyyy HH:mm')}</TableCell>
                    <TableCell>
                      <ImageViewerButton
                        entityId={post.id}
                        fetchImages={(id) => postService.getPostImages(id)}
                        queryKey={QUERY_KEYS.POST_IMAGES}
                        dialogTitle="Post Images"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {data && (
          <TablePagination
            rowsPerPageOptions={PAGINATION_CONFIG.PAGE_SIZE_OPTIONS}
            component="div"
            count={data.pagination.total}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        )}
      </Paper>
    </Box>
  );
};
