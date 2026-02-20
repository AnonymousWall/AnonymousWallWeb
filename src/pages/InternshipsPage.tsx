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
} from '@mui/icons-material';
import { useInternships, useHideInternship, useUnhideInternship } from '../hooks/useInternships';
import { PAGINATION_CONFIG, SUCCESS_MESSAGES } from '../config/constants';
import type { Internship } from '../types';
import { format } from 'date-fns';
import { UserLink } from '../components/EntityLinks';
import { EntityLink } from '../components/EntityLinks';
import { ROUTES } from '../config/constants';

export const InternshipsPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(PAGINATION_CONFIG.DEFAULT_PAGE_SIZE);
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'hide' | 'unhide'>('hide');
  const [hiddenFilter, setHiddenFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [successMessage, setSuccessMessage] = useState('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const hidden = hiddenFilter === 'all' ? undefined : hiddenFilter === 'hidden';
  const { data, isLoading, error } = useInternships(
    page + 1,
    rowsPerPage,
    undefined,
    hidden,
    sortBy,
    sortOrder
  );

  const hideInternshipMutation = useHideInternship();
  const unhideInternshipMutation = useUnhideInternship();

  const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);

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

  const handleShowDetails = (internship: Internship) => {
    setSelectedInternship(internship);
    setDetailsOpen(true);
  };

  const handleActionClick = (internship: Internship, action: 'hide' | 'unhide') => {
    setSelectedInternship(internship);
    setConfirmAction(action);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedInternship) return;

    try {
      if (confirmAction === 'hide') {
        await hideInternshipMutation.mutateAsync(selectedInternship.id);
        setSuccessMessage(SUCCESS_MESSAGES.INTERNSHIP_HIDDEN);
      } else {
        await unhideInternshipMutation.mutateAsync(selectedInternship.id);
        setSuccessMessage(SUCCESS_MESSAGES.INTERNSHIP_UNHIDDEN);
      }
      setConfirmOpen(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Action failed:', err);
    }
  };

  const isPending = hideInternshipMutation.isPending || unhideInternshipMutation.isPending;

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Internship Moderation
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and moderate internship listings
          </Typography>
        </Box>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Filter</InputLabel>
          <Select
            value={hiddenFilter}
            label="Filter"
            onChange={(e) => setHiddenFilter(e.target.value as 'all' | 'visible' | 'hidden')}
          >
            <MenuItem value="all">All</MenuItem>
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
                <TableCell>Company</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Author</TableCell>
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
                  <TableCell colSpan={8} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : !data || data.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No internships found
                  </TableCell>
                </TableRow>
              ) : (
                data.data.map((internship) => (
                  <TableRow key={internship.id} hover>
                    <TableCell>
                      <EntityLink
                        to={ROUTES.INTERNSHIP_DETAIL(internship.id)}
                        sx={{ maxWidth: 200 }}
                      >
                        {internship.title}
                      </EntityLink>
                    </TableCell>
                    <TableCell>{internship.company}</TableCell>
                    <TableCell>{internship.location}</TableCell>
                    <TableCell>
                      <UserLink userId={internship.userId}>{internship.profileName}</UserLink>
                    </TableCell>
                    <TableCell>{internship.commentCount}</TableCell>
                    <TableCell>
                      <Chip
                        label={internship.hidden ? 'Hidden' : 'Visible'}
                        size="small"
                        color={internship.hidden ? 'error' : 'success'}
                      />
                    </TableCell>
                    <TableCell>
                      {format(new Date(internship.createdAt), 'MMM d, yyyy HH:mm')}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => handleShowDetails(internship)}>
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      {internship.hidden ? (
                        <Tooltip title="Unhide">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleActionClick(internship, 'unhide')}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Hide">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleActionClick(internship, 'hide')}
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

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Internship Details</DialogTitle>
        <DialogContent>
          {selectedInternship && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="body2" gutterBottom>
                <strong>ID:</strong> {selectedInternship.id}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Title:</strong> {selectedInternship.title}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Company:</strong> {selectedInternship.company}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Location:</strong> {selectedInternship.location}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Description:</strong>
              </Typography>
              <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.100' }}>
                <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>
                  {selectedInternship.description}
                </Typography>
              </Paper>
              <Typography variant="body2" gutterBottom>
                <strong>Author:</strong> {selectedInternship.profileName}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Author ID:</strong> {selectedInternship.userId}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Comments:</strong> {selectedInternship.commentCount}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Status:</strong> {selectedInternship.hidden ? 'Hidden' : 'Visible'}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Created:</strong>{' '}
                {format(new Date(selectedInternship.createdAt), 'MMM d, yyyy HH:mm:ss')}
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
        <DialogTitle>Confirm {confirmAction === 'hide' ? 'Hide' : 'Unhide'} Internship</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {confirmAction} <strong>"{selectedInternship?.title}"</strong>?
          </Typography>
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
