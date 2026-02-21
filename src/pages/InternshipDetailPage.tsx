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
import { useInternship, useHideInternship, useUnhideInternship } from '../hooks/useInternships';
import { useUser, useBlockUser } from '../hooks/useUsers';
import { ROUTES, SUCCESS_MESSAGES } from '../config/constants';
import { format } from 'date-fns';

export const InternshipDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [hideDialogOpen, setHideDialogOpen] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const { data: internship, isLoading, error } = useInternship(id || '', !!id);
  const { data: author } = useUser(internship?.userId || '', !!internship?.userId);

  const hideInternshipMutation = useHideInternship();
  const unhideInternshipMutation = useUnhideInternship();
  const blockUserMutation = useBlockUser();

  const handleBack = () => navigate(-1);

  const handleHideUnhide = async () => {
    if (!id || !internship) return;

    try {
      if (internship.hidden) {
        await unhideInternshipMutation.mutateAsync(id);
        setSuccessMessage(SUCCESS_MESSAGES.INTERNSHIP_UNHIDDEN);
      } else {
        await hideInternshipMutation.mutateAsync(id);
        setSuccessMessage(SUCCESS_MESSAGES.INTERNSHIP_HIDDEN);
      }
      setHideDialogOpen(false);
    } catch (err) {
      console.error('Action failed:', err);
      setHideDialogOpen(false);
    }
  };

  const handleBlockUser = async () => {
    if (!internship?.userId) return;

    try {
      await blockUserMutation.mutateAsync(internship.userId);
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

  if (error || !internship) {
    return (
      <Box>
        <Box sx={{ mb: 3 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
            Back
          </Button>
        </Box>
        <Alert severity="error">{error?.message || 'Internship not found'}</Alert>
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
            color={internship.hidden ? 'success' : 'error'}
            startIcon={internship.hidden ? <VisibilityIcon /> : <VisibilityOffIcon />}
            onClick={() => setHideDialogOpen(true)}
            sx={{ mr: 1 }}
          >
            {internship.hidden ? 'Unhide' : 'Hide'}
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
          Internship Details
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            {internship.title}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            {internship.hidden ? (
              <Chip icon={<VisibilityOffIcon />} label="Hidden" color="error" size="small" />
            ) : (
              <Chip icon={<VisibilityIcon />} label="Visible" color="success" size="small" />
            )}
          </Box>

          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 3 }}>
            {internship.description}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                ID
              </Typography>
              <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                {internship.id}
              </Typography>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Company
              </Typography>
              <Typography variant="body2">{internship.company}</Typography>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Location
              </Typography>
              <Typography variant="body2">{internship.location}</Typography>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Author
              </Typography>
              <Typography variant="body2" gutterBottom>
                {internship.profileName}
              </Typography>
              {author && (
                <Button
                  size="small"
                  onClick={() => navigate(ROUTES.USER_DETAIL(internship.userId))}
                >
                  View User Details
                </Button>
              )}
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Comments
              </Typography>
              <Typography variant="h6">{internship.commentCount}</Typography>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Created
              </Typography>
              <Typography variant="body2">
                {format(new Date(internship.createdAt), 'PPpp')}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Paper>

      {/* Hide/Unhide Dialog */}
      <Dialog open={hideDialogOpen} onClose={() => setHideDialogOpen(false)}>
        <DialogTitle>Confirm {internship.hidden ? 'Unhide' : 'Hide'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to {internship.hidden ? 'unhide' : 'hide'} this internship?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHideDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleHideUnhide}
            color={internship.hidden ? 'success' : 'error'}
            variant="contained"
            disabled={hideInternshipMutation.isPending || unhideInternshipMutation.isPending}
          >
            {hideInternshipMutation.isPending || unhideInternshipMutation.isPending
              ? 'Processing...'
              : internship.hidden
                ? 'Unhide'
                : 'Hide'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Block User Dialog */}
      <Dialog open={blockDialogOpen} onClose={() => setBlockDialogOpen(false)}>
        <DialogTitle>Confirm Block User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to block "{internship.profileName}"?
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
