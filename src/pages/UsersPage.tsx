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
} from '@mui/material';
import {
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { apiService } from '../services/api';
import type { User } from '../types';
import { format } from 'date-fns';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionType, setActionType] = useState<'block' | 'unblock'>('block');

  useEffect(() => {
    loadUsers();
  }, [page, rowsPerPage]);

  const loadUsers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await apiService.getUsers(page + 1, rowsPerPage);
      setUsers(response.data);
      setTotal(response.pagination.total);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load users');
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

  const handleShowDetails = async (user: User) => {
    try {
      const fullUser = await apiService.getUserById(user.id);
      setSelectedUser(fullUser);
      setDetailsOpen(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load user details');
    }
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
        await apiService.blockUser(selectedUser.id);
      } else {
        await apiService.unblockUser(selectedUser.id);
      }
      setConfirmOpen(false);
      loadUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || `Failed to ${actionType} user`);
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
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
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
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.profileName}</TableCell>
                    <TableCell>{user.schoolDomain}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        size="small"
                        color={user.role === 'ADMIN' ? 'error' : user.role === 'MODERATOR' ? 'warning' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.blocked ? 'Blocked' : 'Active'}
                        size="small"
                        color={user.blocked ? 'error' : 'success'}
                      />
                    </TableCell>
                    <TableCell>
                      {user.reportCount > 0 ? (
                        <Chip label={user.reportCount} size="small" color="warning" />
                      ) : (
                        <Chip label="0" size="small" />
                      )}
                    </TableCell>
                    <TableCell>{format(new Date(user.createdAt), 'MMM d, yyyy')}</TableCell>
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

      {/* User Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="body2" gutterBottom>
                <strong>ID:</strong> {selectedUser.id}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Email:</strong> {selectedUser.email}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Profile Name:</strong> {selectedUser.profileName}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>School Domain:</strong> {selectedUser.schoolDomain}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Role:</strong> {selectedUser.role}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Status:</strong> {selectedUser.blocked ? 'Blocked' : 'Active'}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Verified:</strong> {selectedUser.verified ? 'Yes' : 'No'}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Password Set:</strong> {selectedUser.passwordSet ? 'Yes' : 'No'}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Report Count:</strong> {selectedUser.reportCount}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Joined:</strong> {format(new Date(selectedUser.createdAt), 'PPP')}
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
        <DialogTitle>
          Confirm {actionType === 'block' ? 'Block' : 'Unblock'} User
        </DialogTitle>
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
          >
            {actionType === 'block' ? 'Block' : 'Unblock'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
