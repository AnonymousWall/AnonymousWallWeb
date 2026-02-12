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
import { useComments, useDeleteComment } from '../hooks/useComments';
import { PAGINATION_CONFIG, SUCCESS_MESSAGES } from '../config/constants';
import type { Comment } from '../types';

export const CommentsPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(PAGINATION_CONFIG.DEFAULT_PAGE_SIZE);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [hiddenFilter, setHiddenFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch comments with pagination and filter
  const hidden = hiddenFilter === 'all' ? undefined : hiddenFilter === 'hidden';
  const { data, isLoading, error } = useComments(page + 1, rowsPerPage, hidden);

  // Delete comment mutation
  const deleteCommentMutation = useDeleteComment();

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleShowDetails = (comment: Comment) => {
    setSelectedComment(comment);
    setDetailsOpen(true);
  };

  const handleDeleteClick = (comment: Comment) => {
    setSelectedComment(comment);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedComment) return;

    try {
      await deleteCommentMutation.mutateAsync(selectedComment.id);
      setSuccessMessage(SUCCESS_MESSAGES.COMMENT_DELETED);
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
            Comment Moderation
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and moderate comments
          </Typography>
        </Box>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Filter</InputLabel>
          <Select
            value={hiddenFilter}
            label="Filter"
            onChange={(e) => {
              setHiddenFilter(e.target.value as 'all' | 'visible' | 'hidden');
              setPage(0);
            }}
          >
            <MenuItem value="all">All Comments</MenuItem>
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
                <TableCell>Comment Text</TableCell>
                <TableCell>Author</TableCell>
                <TableCell>Post ID</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : !data || data.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No comments found
                  </TableCell>
                </TableRow>
              ) : (
                data.data.map((comment) => (
                  <TableRow key={comment.id} hover>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                        {comment.text}
                      </Typography>
                    </TableCell>
                    <TableCell>{comment.profileName}</TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                        {comment.postId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={comment.hidden ? 'Hidden' : 'Visible'}
                        size="small"
                        color={comment.hidden ? 'error' : 'success'}
                      />
                    </TableCell>
                    <TableCell>{comment.createdAt}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => handleShowDetails(comment)}>
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      {!comment.hidden && (
                        <Tooltip title="Delete Comment">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(comment)}
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

      {/* Comment Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Comment Details</DialogTitle>
        <DialogContent>
          {selectedComment && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="body2" gutterBottom>
                <strong>ID:</strong> {selectedComment.id}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Comment Text:</strong>
              </Typography>
              <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.100' }}>
                <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>
                  {selectedComment.text}
                </Typography>
              </Paper>
              <Typography variant="body2" gutterBottom>
                <strong>Author:</strong> {selectedComment.profileName}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Author ID:</strong> {selectedComment.userId}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Post ID:</strong> {selectedComment.postId}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Status:</strong> {selectedComment.hidden ? 'Hidden' : 'Visible'}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Created:</strong> {selectedComment.createdAt}
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
        <DialogTitle>Confirm Delete Comment</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this comment?</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This will soft-delete the comment and it will no longer be visible to users.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={deleteCommentMutation.isPending}
          >
            {deleteCommentMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
