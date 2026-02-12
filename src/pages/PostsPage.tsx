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
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Delete as DeleteIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { usePosts, useDeletePost } from '../hooks/usePosts';
import { PAGINATION_CONFIG, SUCCESS_MESSAGES } from '../config/constants';
import type { Post } from '../types';
import { format } from 'date-fns';

export const PostsPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(PAGINATION_CONFIG.DEFAULT_PAGE_SIZE);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [hiddenFilter, setHiddenFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [successMessage, setSuccessMessage] = useState('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch posts with pagination, filter, and sorting
  const hidden = hiddenFilter === 'all' ? undefined : hiddenFilter === 'hidden';
  const { data, isLoading, error } = usePosts(
    page + 1,
    rowsPerPage,
    undefined,
    hidden,
    sortBy,
    sortOrder
  );

  // Delete post mutation
  const deletePostMutation = useDeletePost();

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
      setSortBy(field);
      setSortOrder(field === 'createdAt' ? 'desc' : 'asc');
    }
    setPage(0);
  };

  const handleShowDetails = (post: Post) => {
    setSelectedPost(post);
    setDetailsOpen(true);
  };

  const handleDeleteClick = (post: Post) => {
    setSelectedPost(post);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedPost) return;

    try {
      await deletePostMutation.mutateAsync(selectedPost.id);
      setSuccessMessage(SUCCESS_MESSAGES.POST_DELETED);
      setConfirmOpen(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      // Error is handled by mutation
      console.error('Delete failed:', err);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Post Moderation
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and moderate posts
          </Typography>
        </Box>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Filter</InputLabel>
          <Select
            value={hiddenFilter}
            label="Filter"
            onChange={(e) => setHiddenFilter(e.target.value as 'all' | 'visible' | 'hidden')}
          >
            <MenuItem value="all">All Posts</MenuItem>
            <MenuItem value="visible">Visible Only</MenuItem>
            <MenuItem value="hidden">Hidden Only</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

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
                <TableCell>Author</TableCell>
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
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'createdAt'}
                    direction={sortBy === 'createdAt' ? sortOrder : 'asc'}
                    onClick={() => handleSort('createdAt')}
                  >
                    Created
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">Actions</TableCell>
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
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {post.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={post.wall}
                        size="small"
                        color={post.wall === 'campus' ? 'primary' : 'secondary'}
                      />
                    </TableCell>
                    <TableCell>{post.schoolDomain || 'N/A'}</TableCell>
                    <TableCell>{post.profileName}</TableCell>
                    <TableCell>{post.likeCount}</TableCell>
                    <TableCell>{post.commentCount}</TableCell>
                    <TableCell>
                      <Chip
                        label={post.hidden ? 'Hidden' : 'Visible'}
                        size="small"
                        color={post.hidden ? 'error' : 'success'}
                      />
                    </TableCell>
                    <TableCell>{format(new Date(post.createdAt), 'MMM d, yyyy HH:mm')}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => handleShowDetails(post)}>
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      {!post.hidden && (
                        <Tooltip title="Delete Post">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(post)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
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

      {/* Post Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Post Details</DialogTitle>
        <DialogContent>
          {selectedPost && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="body2" gutterBottom>
                <strong>ID:</strong> {selectedPost.id}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Title:</strong> {selectedPost.title}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Content:</strong>
              </Typography>
              <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.100' }}>
                <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>
                  {selectedPost.content}
                </Typography>
              </Paper>
              <Typography variant="body2" gutterBottom>
                <strong>Wall:</strong> {selectedPost.wall}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>School Domain:</strong> {selectedPost.schoolDomain || 'N/A'}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Author:</strong> {selectedPost.profileName}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Author ID:</strong> {selectedPost.userId}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Likes:</strong> {selectedPost.likeCount}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Comments:</strong> {selectedPost.commentCount}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Status:</strong> {selectedPost.hidden ? 'Hidden' : 'Visible'}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Created:</strong>{' '}
                {format(new Date(selectedPost.createdAt), 'MMM d, yyyy HH:mm:ss')}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Updated:</strong>{' '}
                {format(new Date(selectedPost.updatedAt), 'MMM d, yyyy HH:mm:ss')}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Delete Post</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the post titled <strong>"{selectedPost?.title}"</strong>
            ?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This will soft-delete the post and it will no longer be visible to users.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={deletePostMutation.isPending}
          >
            {deletePostMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
