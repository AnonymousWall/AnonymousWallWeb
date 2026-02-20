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
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useUser, useBlockUser, useUnblockUser } from '../hooks/useUsers';
import { SUCCESS_MESSAGES } from '../config/constants';
import { format } from 'date-fns';
import { UserPostsTable } from '../components/UserPostsTable';
import { UserCommentsTable } from '../components/UserCommentsTable';
import { UserInternshipsTable } from '../components/UserInternshipsTable';
import { UserMarketplacesTable } from '../components/UserMarketplacesTable';
import { UserConversationsTable } from '../components/UserConversationsTable';

export const UserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionType, setActionType] = useState<'block' | 'unblock'>('block');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch user details
  const { data: user, isLoading, error } = useUser(id || '', !!id);

  // Mutations
  const blockUserMutation = useBlockUser();
  const unblockUserMutation = useUnblockUser();

  const handleBack = () => {
    navigate(-1);
  };

  const handleBlockUnblock = (type: 'block' | 'unblock') => {
    setActionType(type);
    setConfirmOpen(true);
  };

  const confirmAction = async () => {
    if (!id) return;

    try {
      if (actionType === 'block') {
        await blockUserMutation.mutateAsync(id);
        setSuccessMessage(SUCCESS_MESSAGES.USER_BLOCKED);
      } else {
        await unblockUserMutation.mutateAsync(id);
        setSuccessMessage(SUCCESS_MESSAGES.USER_UNBLOCKED);
      }
      setConfirmOpen(false);
    } catch (err) {
      console.error('Action failed:', err);
      setConfirmOpen(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !user) {
    return (
      <Box>
        <Box sx={{ mb: 3 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
            Back
          </Button>
        </Box>
        <Alert severity="error">{error?.message || 'User not found'}</Alert>
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
          {user.blocked ? (
            <Button
              variant="outlined"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={() => handleBlockUnblock('unblock')}
            >
              Unblock User
            </Button>
          ) : (
            <Button
              variant="outlined"
              color="warning"
              startIcon={<BlockIcon />}
              onClick={() => handleBlockUnblock('block')}
            >
              Block User
            </Button>
          )}
        </Box>
      </Box>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          User Details
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                User ID
              </Typography>
              <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                {user.id}
              </Typography>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Email
              </Typography>
              <Typography variant="body2">{user.email}</Typography>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Profile Name
              </Typography>
              <Typography variant="body2">{user.profileName}</Typography>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                School Domain
              </Typography>
              <Typography variant="body2">{user.schoolDomain}</Typography>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Role
              </Typography>
              <Chip
                label={user.role || 'USER'}
                size="small"
                color={
                  (user.role || 'USER') === 'ADMIN'
                    ? 'error'
                    : (user.role || 'USER') === 'MODERATOR'
                      ? 'warning'
                      : 'default'
                }
              />
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Status
              </Typography>
              {user.blocked ? (
                <Chip label="Blocked" size="small" color="error" />
              ) : (
                <Chip label="Active" size="small" color="success" />
              )}
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Verified
              </Typography>
              <Chip
                label={user.verified ? 'Yes' : 'No'}
                size="small"
                color={user.verified ? 'success' : 'default'}
              />
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Password Set
              </Typography>
              <Chip
                label={user.passwordSet ? 'Yes' : 'No'}
                size="small"
                color={user.passwordSet ? 'success' : 'default'}
              />
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Report Count
              </Typography>
              <Typography variant="h6">{user.reportCount}</Typography>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Joined
              </Typography>
              <Typography variant="body2">{format(new Date(user.createdAt), 'PPpp')}</Typography>
            </CardContent>
          </Card>
        </Box>
      </Paper>

      {/* User Posts Section */}
      {id && <UserPostsTable userId={id} />}

      {/* User Comments Section */}
      {id && <UserCommentsTable userId={id} />}

      {/* User Internships Section */}
      {id && <UserInternshipsTable userId={id} />}

      {/* User Marketplace Items Section */}
      {id && <UserMarketplacesTable userId={id} />}

      {/* User Conversations Section */}
      {id && <UserConversationsTable userId={id} />}

      {/* Block/Unblock Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm {actionType === 'block' ? 'Block' : 'Unblock'} User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {actionType === 'block'
              ? `Are you sure you want to block "${user.email}"? This will prevent them from accessing the platform.`
              : `Are you sure you want to unblock "${user.email}"? This will restore their access to the platform.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmAction}
            color={actionType === 'block' ? 'warning' : 'success'}
            variant="contained"
            disabled={blockUserMutation.isPending || unblockUserMutation.isPending}
          >
            {blockUserMutation.isPending || unblockUserMutation.isPending
              ? `${actionType === 'block' ? 'Blocking' : 'Unblocking'}...`
              : actionType === 'block'
                ? 'Block User'
                : 'Unblock User'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
