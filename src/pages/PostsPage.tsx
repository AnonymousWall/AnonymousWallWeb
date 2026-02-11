import React, { useState, useEffect } from 'react';
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
import {
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { apiService } from '../services/api';
import type { Post } from '../types';
import { format } from 'date-fns';

export const PostsPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [hiddenFilter, setHiddenFilter] = useState<'all' | 'visible' | 'hidden'>('all');

  useEffect(() => {
    loadPosts();
  }, [page, rowsPerPage, hiddenFilter]);

  const loadPosts = async () => {
    setIsLoading(true);
    setError('');
    try {
      const hidden = hiddenFilter === 'all' ? undefined : hiddenFilter === 'hidden';
      const response = await apiService.getPosts(page + 1, rowsPerPage, undefined, hidden);
      setPosts(response.data);
      setTotal(response.pagination.total);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
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
      await apiService.deletePost(selectedPost.id);
      setConfirmOpen(false);
      loadPosts();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete post');
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
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Wall</TableCell>
                <TableCell>School</TableCell>
                <TableCell>Author</TableCell>
                <TableCell>Likes</TableCell>
                <TableCell>Comments</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
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
              ) : posts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No posts found
                  </TableCell>
                </TableRow>
              ) : (
                posts.map((post) => (
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
                    <TableCell>{format(new Date(post.createdAt), 'MMM d, yyyy')}</TableCell>
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
        <TablePagination
          rowsPerPageOptions={[10, 20, 50, 100]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
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
                <strong>Created:</strong> {format(new Date(selectedPost.createdAt), 'PPPpp')}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Updated:</strong> {format(new Date(selectedPost.updatedAt), 'PPPpp')}
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
            Are you sure you want to delete the post titled <strong>"{selectedPost?.title}"</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This will soft-delete the post and it will no longer be visible to users.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
