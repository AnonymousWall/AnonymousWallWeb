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
import { useMarketplace, useHideMarketplace, useUnhideMarketplace } from '../hooks/useMarketplaces';
import { useUser, useBlockUser } from '../hooks/useUsers';
import { ROUTES, SUCCESS_MESSAGES } from '../config/constants';
import { format } from 'date-fns';

export const MarketplaceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [hideDialogOpen, setHideDialogOpen] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const { data: item, isLoading, error } = useMarketplace(id || '', !!id);
  const { data: author } = useUser(item?.userId || '', !!item?.userId);

  const hideMarketplaceMutation = useHideMarketplace();
  const unhideMarketplaceMutation = useUnhideMarketplace();
  const blockUserMutation = useBlockUser();

  const handleBack = () => navigate(-1);

  const handleHideUnhide = async () => {
    if (!id || !item) return;

    try {
      if (item.hidden) {
        await unhideMarketplaceMutation.mutateAsync(id);
        setSuccessMessage(SUCCESS_MESSAGES.MARKETPLACE_UNHIDDEN);
      } else {
        await hideMarketplaceMutation.mutateAsync(id);
        setSuccessMessage(SUCCESS_MESSAGES.MARKETPLACE_HIDDEN);
      }
      setHideDialogOpen(false);
    } catch (err) {
      console.error('Action failed:', err);
      setHideDialogOpen(false);
    }
  };

  const handleBlockUser = async () => {
    if (!item?.userId) return;

    try {
      await blockUserMutation.mutateAsync(item.userId);
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

  if (error || !item) {
    return (
      <Box>
        <Box sx={{ mb: 3 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
            Back
          </Button>
        </Box>
        <Alert severity="error">{error?.message || 'Marketplace item not found'}</Alert>
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
            color={item.hidden ? 'success' : 'error'}
            startIcon={item.hidden ? <VisibilityIcon /> : <VisibilityOffIcon />}
            onClick={() => setHideDialogOpen(true)}
            sx={{ mr: 1 }}
          >
            {item.hidden ? 'Unhide' : 'Hide'}
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
          Marketplace Item Details
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            {item.title}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            {item.hidden ? (
              <Chip icon={<VisibilityOffIcon />} label="Hidden" color="error" size="small" />
            ) : (
              <Chip icon={<VisibilityIcon />} label="Visible" color="success" size="small" />
            )}
          </Box>

          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 3 }}>
            {item.description}
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
                {item.id}
              </Typography>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Price
              </Typography>
              <Typography variant="h6">${item.price.toFixed(2)}</Typography>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Author
              </Typography>
              <Typography variant="body2" gutterBottom>
                {item.profileName}
              </Typography>
              {author && (
                <Button size="small" onClick={() => navigate(ROUTES.USER_DETAIL(item.userId))}>
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
              <Typography variant="h6">{item.commentCount}</Typography>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Created
              </Typography>
              <Typography variant="body2">{format(new Date(item.createdAt), 'PPpp')}</Typography>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Last Updated
              </Typography>
              <Typography variant="body2">{format(new Date(item.updatedAt), 'PPpp')}</Typography>
            </CardContent>
          </Card>
        </Box>
      </Paper>

      {/* Hide/Unhide Dialog */}
      <Dialog open={hideDialogOpen} onClose={() => setHideDialogOpen(false)}>
        <DialogTitle>Confirm {item.hidden ? 'Unhide' : 'Hide'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to {item.hidden ? 'unhide' : 'hide'} this marketplace item?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHideDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleHideUnhide}
            color={item.hidden ? 'success' : 'error'}
            variant="contained"
            disabled={hideMarketplaceMutation.isPending || unhideMarketplaceMutation.isPending}
          >
            {hideMarketplaceMutation.isPending || unhideMarketplaceMutation.isPending
              ? 'Processing...'
              : item.hidden
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
            Are you sure you want to block "{item.profileName}"?
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
