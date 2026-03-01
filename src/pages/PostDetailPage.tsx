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
  LinearProgress,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Block as BlockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Poll as PollIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { usePost, useHidePost, useUnhidePost, usePostPoll, usePostImages } from '../hooks/usePosts';
import { useUser, useBlockUser } from '../hooks/useUsers';
import { ROUTES, SUCCESS_MESSAGES } from '../config/constants';
import { format } from 'date-fns';

export const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [hideDialogOpen, setHideDialogOpen] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const { data: post, isLoading, error } = usePost(id || '', !!id);
  const { data: author } = useUser(post?.userId || '', !!post?.userId);
  const { data: pollData } = usePostPoll(id || '', !!id && post?.postType === 'poll');
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const { data: imagesData } = usePostImages(id || '', !!id);
  const imageUrls = imagesData?.imageUrls ?? [];

  const hidePostMutation = useHidePost();
  const unhidePostMutation = useUnhidePost();
  const blockUserMutation = useBlockUser();

  const handleBack = () => {
    navigate(-1);
  };

  const handleViewUser = () => {
    if (post?.userId) {
      navigate(ROUTES.USER_DETAIL(post.userId));
    }
  };

  const handleHideUnhide = async () => {
    if (!id || !post) return;

    try {
      if (post.hidden) {
        await unhidePostMutation.mutateAsync(id);
        setSuccessMessage(SUCCESS_MESSAGES.POST_UNHIDDEN);
      } else {
        await hidePostMutation.mutateAsync(id);
        setSuccessMessage(SUCCESS_MESSAGES.POST_HIDDEN);
      }
      setHideDialogOpen(false);
    } catch (err) {
      console.error('Action failed:', err);
      setHideDialogOpen(false);
    }
  };

  const handleBlockUser = async () => {
    if (!post?.userId) return;

    try {
      await blockUserMutation.mutateAsync(post.userId);
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

  if (error || !post) {
    return (
      <Box>
        <Box sx={{ mb: 3 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
            Back
          </Button>
        </Box>
        <Alert severity="error">{error?.message || 'Post not found'}</Alert>
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
            color={post.hidden ? 'success' : 'error'}
            startIcon={post.hidden ? <VisibilityIcon /> : <VisibilityOffIcon />}
            onClick={() => setHideDialogOpen(true)}
            sx={{ mr: 1 }}
          >
            {post.hidden ? 'Unhide Post' : 'Hide Post'}
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
          Post Details
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            {post.title}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Chip
              label={post.wall === 'national' ? 'National Wall' : 'Campus Wall'}
              color={post.wall === 'national' ? 'primary' : 'secondary'}
              size="small"
            />
            <Chip
              icon={post.postType === 'poll' ? <PollIcon /> : undefined}
              label={post.postType === 'poll' ? 'Poll' : 'Standard'}
              color={post.postType === 'poll' ? 'info' : 'default'}
              size="small"
            />
            {post.hidden ? (
              <Chip icon={<VisibilityOffIcon />} label="Hidden" color="error" size="small" />
            ) : (
              <Chip icon={<VisibilityIcon />} label="Visible" color="success" size="small" />
            )}
          </Box>

          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 3 }}>
            {post.content}
          </Typography>

          {imageUrls.length > 0 && (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: 2,
                mb: 3,
              }}
            >
              {imageUrls.map((url) => (
                <Box
                  key={url}
                  component="img"
                  src={url}
                  alt="Post image"
                  onClick={() => setLightboxUrl(url)}
                  sx={{
                    width: '100%',
                    height: 200,
                    objectFit: 'cover',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s',
                    '&:hover': { opacity: 0.85 },
                  }}
                />
              ))}
            </Box>
          )}

          {post.postType === 'poll' && pollData && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Poll Results
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Total votes: {pollData.totalVotes}
              </Typography>
              {pollData.options.map((option) => (
                <Box key={option.id} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">{option.optionText}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {option.voteCount} votes ({option.percentage.toFixed(1)}%)
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={option.percentage}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              ))}
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Post Type
              </Typography>
              <Chip
                icon={post.postType === 'poll' ? <PollIcon /> : undefined}
                label={post.postType === 'poll' ? 'Poll' : 'Standard'}
                color={post.postType === 'poll' ? 'info' : 'default'}
                size="small"
              />
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Post ID
              </Typography>
              <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                {post.id}
              </Typography>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Author
              </Typography>
              <Typography variant="body2" gutterBottom>
                {post.profileName}
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
                {post.userId}
              </Typography>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                School
              </Typography>
              <Typography variant="body2">{post.schoolDomain || 'N/A'}</Typography>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Likes
              </Typography>
              <Typography variant="h6">{post.likeCount}</Typography>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Comments
              </Typography>
              <Typography variant="h6">{post.commentCount}</Typography>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Created
              </Typography>
              <Typography variant="body2">{format(new Date(post.createdAt), 'PPpp')}</Typography>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Last Updated
              </Typography>
              <Typography variant="body2">{format(new Date(post.updatedAt), 'PPpp')}</Typography>
            </CardContent>
          </Card>
        </Box>
      </Paper>

      {/* Image Lightbox */}
      <Dialog
        open={lightboxUrl !== null}
        onClose={() => setLightboxUrl(null)}
        maxWidth={false}
        PaperProps={{
          sx: {
            bgcolor: 'black',
            boxShadow: 'none',
            m: 1,
          },
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <IconButton
            onClick={() => setLightboxUrl(null)}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 1,
              bgcolor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' },
            }}
          >
            <CloseIcon />
          </IconButton>
          {lightboxUrl && (
            <Box
              component="img"
              src={lightboxUrl}
              alt="Full size"
              sx={{
                display: 'block',
                maxWidth: '90vw',
                maxHeight: '90vh',
                objectFit: 'contain',
              }}
            />
          )}
        </Box>
      </Dialog>

      {/* Hide/Unhide Confirmation Dialog */}
      <Dialog open={hideDialogOpen} onClose={() => setHideDialogOpen(false)}>
        <DialogTitle>Confirm {post.hidden ? 'Unhide' : 'Hide'} Post</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to {post.hidden ? 'unhide' : 'hide'} this post?
            {!post.hidden && ' The post will no longer be visible to users.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHideDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleHideUnhide}
            color={post.hidden ? 'success' : 'error'}
            variant="contained"
            disabled={hidePostMutation.isPending || unhidePostMutation.isPending}
          >
            {hidePostMutation.isPending || unhidePostMutation.isPending
              ? 'Processing...'
              : post.hidden
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
            Are you sure you want to block the author "{post.profileName}"? This will prevent them
            from accessing the platform.
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
