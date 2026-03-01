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
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Poll as PollIcon,
} from '@mui/icons-material';
import { usePosts, useHidePost, useUnhidePost } from '../hooks/usePosts';
import { PAGINATION_CONFIG, SUCCESS_MESSAGES, QUERY_KEYS } from '../config/constants';
import type { Post } from '../types';
import { format } from 'date-fns';
import { UserLink, PostLink } from '../components/EntityLinks';
import { ImageViewerButton } from '../components/ImageViewerButton';
import { postService } from '../api/postService';

export const PostsPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(PAGINATION_CONFIG.DEFAULT_PAGE_SIZE);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'hide' | 'unhide'>('hide');
  const [hiddenFilter, setHiddenFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [wallFilter, setWallFilter] = useState<'all' | 'national' | 'campus'>('all');
  const [successMessage, setSuccessMessage] = useState('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const hidden = hiddenFilter === 'all' ? undefined : hiddenFilter === 'hidden';
  const wall = wallFilter === 'all' ? undefined : wallFilter;
  const { data, isLoading, error } = usePosts(
    page + 1,
    rowsPerPage,
    undefined,
    hidden,
    sortBy,
    sortOrder,
    wall
  );

  const hidePostMutation = useHidePost();
  const unhidePostMutation = useUnhidePost();

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortOrder(field === 'createdAt' ? 'desc' : 'asc');
    }
    setSortBy(field);
    setPage(0);
  };

  const handleShowDetails = (post: Post) => {
    setSelectedPost(post);
    setDetailsOpen(true);
  };

  const handleActionClick = (post: Post, action: 'hide' | 'unhide') => {
    setSelectedPost(post);
    setConfirmAction(action);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedPost) return;

    try {
      if (confirmAction === 'hide') {
        await hidePostMutation.mutateAsync(selectedPost.id);
        setSuccessMessage(SUCCESS_MESSAGES.POST_HIDDEN);
      } else {
        await unhidePostMutation.mutateAsync(selectedPost.id);
        setSuccessMessage(SUCCESS_MESSAGES.POST_UNHIDDEN);
      }
      setConfirmOpen(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Action failed:', err);
    }
  };

  const isPending = hidePostMutation.isPending || unhidePostMutation.isPending;

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
                <TableCell>
                  <FormControl size="small" sx={{ minWidth: 100 }}>
                    <Select
                      value={wallFilter}
                      onChange={(e) => {
                        setWallFilter(e.target.value as 'all' | 'national' | 'campus');
                        setPage(0);
                      }}
                      displayEmpty
                      aria-label="Filter posts by wall type"
                      sx={{ fontSize: '0.875rem', fontWeight: 500 }}
                    >
                      <MenuItem value="all">All Walls</MenuItem>
                      <MenuItem value="national">National</MenuItem>
                      <MenuItem value="campus">Campus</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
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
                <TableCell>Type</TableCell>
                <TableCell>Images</TableCell>
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
                  <TableCell colSpan={11} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : !data || data.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} align="center">
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
                    <TableCell>
                      <UserLink userId={post.userId}>{post.profileName}</UserLink>
                    </TableCell>
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
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => handleShowDetails(post)}>
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      {post.hidden ? (
                        <Tooltip title="Unhide Post">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleActionClick(post, 'unhide')}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Hide Post">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleActionClick(post, 'hide')}
                          >
                            <VisibilityOffIcon />
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
                <strong>Type:</strong> {selectedPost.postType === 'poll' ? 'Poll' : 'Standard'}
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
        <DialogTitle>Confirm {confirmAction === 'hide' ? 'Hide' : 'Unhide'} Post</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {confirmAction} the post titled{' '}
            <strong>"{selectedPost?.title}"</strong>?
          </Typography>
          {confirmAction === 'hide' && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              The post will no longer be visible to users.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirm}
            color={confirmAction === 'hide' ? 'error' : 'success'}
            variant="contained"
            disabled={isPending}
          >
            {isPending ? 'Processing...' : confirmAction === 'hide' ? 'Hide' : 'Unhide'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
