import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Block as BlockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { useComment, useHideComment, useUnhideComment } from '../hooks/useComments';
import { useUser, useBlockUser } from '../hooks/useUsers';
import { getParentLabel, getParentRoute } from '../components/EntityLinks';
import { ROUTES, SUCCESS_MESSAGES } from '../config/constants';
import { format } from 'date-fns';

export const CommentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [hideDialogOpen, setHideDialogOpen] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const { data: comment, isLoading, error } = useComment(id || '', !!id);
  const { data: author } = useUser(comment?.userId || '', !!comment?.userId);

  const hideCommentMutation = useHideComment();
  const unhideCommentMutation = useUnhideComment();
  const blockUserMutation = useBlockUser();

  const handleBack = () => {
    navigate(-1);
  };

  const handleViewUser = () => {
    if (comment?.userId) {
      navigate(ROUTES.USER_DETAIL(comment.userId));
    }
  };

  const handleViewParent = () => {
    if (!comment?.postId) return;
    navigate(getParentRoute(comment.postId, comment.parentType));
  };

  const handleHideUnhide = async () => {
    if (!id || !comment) return;

    try {
      if (comment.hidden) {
        await unhideCommentMutation.mutateAsync(id);
        setSuccessMessage(SUCCESS_MESSAGES.COMMENT_UNHIDDEN);
      } else {
        await hideCommentMutation.mutateAsync(id);
        setSuccessMessage(SUCCESS_MESSAGES.COMMENT_HIDDEN);
      }
      setHideDialogOpen(false);
    } catch (err) {
      console.error('Action failed:', err);
      setHideDialogOpen(false);
    }
  };

  const handleBlockUser = async () => {
    if (!comment?.userId) return;

    try {
      await blockUserMutation.mutateAsync(comment.userId);
      setSuccessMessage(SUCCESS_MESSAGES.USER_BLOCKED);
      setBlockDialogOpen(false);
    } catch (err) {
      console.error('Block failed:', err);
      setBlockDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !comment) {
    return (
      <Box>
        <Box sx={{ mb: 3 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
            Back
          </Button>
        </Box>
        <Alert severity="error">{error?.message || 'Comment not found'}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          Back
        </Button>
        <Box>
          <Button
            variant="outlined"
            color={comment.hidden ? 'success' : 'error'}
            startIcon={comment.hidden ? <VisibilityIcon /> : <VisibilityOffIcon />}
            onClick={() => setHideDialogOpen(true)}
            sx={{ mr: 1 }}
          >
            {comment.hidden ? 'Unhide Comment' : 'Hide Comment'}
          </Button>
          <Button
            variant="outlined"
            color="warning"
            startIcon={<BlockIcon />}
            onClick={() => setBlockDialogOpen(true)}
          >
            Block Author
          </Button>
        </Box>
      </Box>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Comment Details
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            {comment.hidden ? (
              <Chip icon={<VisibilityOffIcon />} label="Hidden" color="error" size="small" />
            ) : (
              <Chip icon={<VisibilityIcon />} label="Visible" color="success" size="small" />
            )}
          </Box>

          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 3 }}>
            {comment.text}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Comment ID
              </Typography>
              <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                {comment.id}
              </Typography>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Parent Type
              </Typography>
              <Typography variant="body2" gutterBottom>
                {comment.parentType}
              </Typography>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Parent ID
              </Typography>
              <Typography variant="body2" sx={{ wordBreak: 'break-all', mb: 1 }}>
                {comment.postId}
              </Typography>
              <Button size="small" onClick={handleViewParent}>
                View {getParentLabel(comment.parentType)}
              </Button>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Author
              </Typography>
              <Typography variant="body2" gutterBottom>
                {comment.profileName}
              </Typography>
              {author && (
                <Button size="small" onClick={handleViewUser}>
                  View User Details
                </Button>
              )}
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Author ID
              </Typography>
              <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                {comment.userId}
              </Typography>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ gridColumn: 'span 2' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Created
              </Typography>
              <Typography variant="body2">{format(new Date(comment.createdAt), 'PPpp')}</Typography>
            </CardContent>
          </Card>
        </Box>
      </Paper>

      {/* Hide/Unhide Confirmation Dialog */}
      <Dialog open={hideDialogOpen} onClose={() => setHideDialogOpen(false)}>
        <DialogTitle>Confirm {comment.hidden ? 'Unhide' : 'Hide'} Comment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to {comment.hidden ? 'unhide' : 'hide'} this comment?
            {!comment.hidden && ' The comment will no longer be visible to users.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHideDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleHideUnhide}
            color={comment.hidden ? 'success' : 'error'}
            variant="contained"
            disabled={hideCommentMutation.isPending || unhideCommentMutation.isPending}
          >
            {hideCommentMutation.isPending || unhideCommentMutation.isPending
              ? 'Processing...'
              : comment.hidden
                ? 'Unhide'
                : 'Hide'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Block User Confirmation Dialog */}
      <Dialog open={blockDialogOpen} onClose={() => setBlockDialogOpen(false)}>
        <DialogTitle>Confirm Block User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to block the author "{comment.profileName}"? This will prevent
            them from accessing the platform.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBlockDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleBlockUser}
            color="warning"
            variant="contained"
            disabled={blockUserMutation.isPending}
          >
            {blockUserMutation.isPending ? 'Blocking...' : 'Block User'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
