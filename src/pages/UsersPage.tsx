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
} from '@mui/material';
import {
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useUsers, useUser, useBlockUser, useUnblockUser } from '../hooks/useUsers';
import { PAGINATION_CONFIG, SUCCESS_MESSAGES } from '../config/constants';
import type { User } from '../types';
import { format } from 'date-fns';

export const UsersPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(PAGINATION_CONFIG.DEFAULT_PAGE_SIZE);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionType, setActionType] = useState<'block' | 'unblock'>('block');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch users with pagination
  const { data, isLoading, error } = useUsers(page + 1, rowsPerPage);

  // Debug logging
  React.useEffect(() => {
    console.log('UsersPage state:', { isLoading, error: error?.message, data });
  }, [isLoading, error, data]);

  // Fetch individual user details
  const { data: userDetails } = useUser(selectedUserId || '', !!selectedUserId);

  // Mutations
  const blockUserMutation = useBlockUser();
  const unblockUserMutation = useUnblockUser();

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleShowDetails = (user: User) => {
    setSelectedUserId(user.id);
    setSelectedUser(user);
    setDetailsOpen(true);
  };

  const handleBlockUnblock = (user: User, type: 'block' | 'unblock') => {
    setSelectedUser(user);
    setActionType(type);
    setConfirmOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedUser) return;

    try {
      if (actionType === 'block') {
        await blockUserMutation.mutateAsync(selectedUser.id);
        setSuccessMessage(SUCCESS_MESSAGES.USER_BLOCKED);
      } else {
        await unblockUserMutation.mutateAsync(selectedUser.id);
        setSuccessMessage(SUCCESS_MESSAGES.USER_UNBLOCKED);
      }
      setConfirmOpen(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      // Error is handled by mutation
      console.error('Action failed:', err);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            User Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage users, view details, and block/unblock accounts
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <strong>Error loading users:</strong> {error.message}
          <br />
          <small>Check browser console for more details</small>
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
                <TableCell>Email</TableCell>
                <TableCell>Profile Name</TableCell>
                <TableCell>School</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Reports</TableCell>
                <TableCell>Joined</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : !data || data.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    {!data ? (
                      <>
                        No data received from server
                        <br />
                        <small>Check browser console for details</small>
                      </>
                    ) : (
                      'No users found'
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                data.data.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.profileName}</TableCell>
                    <TableCell>{user.schoolDomain}</TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>
                      {user.blocked ? (
                        <Chip label="Blocked" size="small" color="error" />
                      ) : (
                        <Chip label="Active" size="small" color="success" />
                      )}
                    </TableCell>
                    <TableCell>
                      {user.reportCount > 0 ? (
                        <Chip label={user.reportCount} size="small" color="warning" />
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{format(new Date(user.createdAt), 'MMM dd, yyyy')}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => handleShowDetails(user)}>
                          <InfoIcon />
                        </IconButton>
                      </Tooltip>
                      {user.blocked ? (
                        <Tooltip title="Unblock User">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleBlockUnblock(user, 'unblock')}
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Block User">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleBlockUnblock(user, 'block')}
                          >
                            <BlockIcon />
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

      {/* User Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          {userDetails && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Email:</strong> {userDetails.email}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Profile Name:</strong> {userDetails.profileName}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>School Domain:</strong> {userDetails.schoolDomain}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Role:</strong> {userDetails.role || 'USER'}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Status:</strong> {userDetails.blocked ? 'Blocked' : 'Active'}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Verified:</strong> {userDetails.verified ? 'Yes' : 'No'}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Password Set:</strong> {userDetails.passwordSet ? 'Yes' : 'No'}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Report Count:</strong> {userDetails.reportCount}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Created At:</strong>{' '}
                {format(new Date(userDetails.createdAt), 'MMM dd, yyyy HH:mm')}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Action Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm {actionType === 'block' ? 'Block' : 'Unblock'} User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {actionType} user <strong>{selectedUser?.email}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmAction}
            color={actionType === 'block' ? 'error' : 'success'}
            variant="contained"
            disabled={blockUserMutation.isPending || unblockUserMutation.isPending}
          >
            {blockUserMutation.isPending || unblockUserMutation.isPending
              ? 'Processing...'
              : actionType === 'block'
                ? 'Block'
                : 'Unblock'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
