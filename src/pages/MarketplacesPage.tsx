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
import {
  useMarketplaces,
  useHideMarketplace,
  useUnhideMarketplace,
} from '../hooks/useMarketplaces';
import { PAGINATION_CONFIG, SUCCESS_MESSAGES, ROUTES } from '../config/constants';
import type { MarketplaceItem } from '../types';
import { format } from 'date-fns';
import { UserLink, EntityLink } from '../components/EntityLinks';

export const MarketplacesPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(PAGINATION_CONFIG.DEFAULT_PAGE_SIZE);
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
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
  const { data, isLoading, error } = useMarketplaces(
    page + 1,
    rowsPerPage,
    undefined,
    hidden,
    sortBy,
    sortOrder,
    wall
  );

  const hideMarketplaceMutation = useHideMarketplace();
  const unhideMarketplaceMutation = useUnhideMarketplace();

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

  const handleShowDetails = (item: MarketplaceItem) => {
    setSelectedItem(item);
    setDetailsOpen(true);
  };

  const handleActionClick = (item: MarketplaceItem, action: 'hide' | 'unhide') => {
    setSelectedItem(item);
    setConfirmAction(action);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedItem) return;

    try {
      if (confirmAction === 'hide') {
        await hideMarketplaceMutation.mutateAsync(selectedItem.id);
        setSuccessMessage(SUCCESS_MESSAGES.MARKETPLACE_HIDDEN);
      } else {
        await unhideMarketplaceMutation.mutateAsync(selectedItem.id);
        setSuccessMessage(SUCCESS_MESSAGES.MARKETPLACE_UNHIDDEN);
      }
      setConfirmOpen(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Action failed:', err);
    }
  };

  const isPending = hideMarketplaceMutation.isPending || unhideMarketplaceMutation.isPending;

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Marketplace Moderation
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and moderate marketplace listings
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
                <TableCell>
                  <FormControl size="small" sx={{ minWidth: 100 }}>
                    <Select
                      value={wallFilter}
                      onChange={(e) => {
                        setWallFilter(e.target.value as 'all' | 'national' | 'campus');
                        setPage(0);
                      }}
                      displayEmpty
                      aria-label="Filter marketplace items by wall type"
                      sx={{ fontSize: '0.875rem', fontWeight: 500 }}
                    >
                      <MenuItem value="all">All Walls</MenuItem>
                      <MenuItem value="national">National</MenuItem>
                      <MenuItem value="campus">Campus</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'price'}
                    direction={sortBy === 'price' ? sortOrder : 'asc'}
                    onClick={() => handleSort('price')}
                  >
                    Price
                  </TableSortLabel>
                </TableCell>
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
                    No marketplace items found
                  </TableCell>
                </TableRow>
              ) : (
                data.data.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <EntityLink to={ROUTES.MARKETPLACE_DETAIL(item.id)} sx={{ maxWidth: 200 }}>
                        {item.title}
                      </EntityLink>
                    </TableCell>
                    <TableCell>
                      {item.wall ? (
                        <Chip
                          label={item.wall}
                          size="small"
                          color={item.wall === 'campus' ? 'primary' : 'secondary'}
                        />
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>${item.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <UserLink userId={item.userId}>{item.profileName}</UserLink>
                    </TableCell>
                    <TableCell>{item.commentCount}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.hidden ? 'Hidden' : 'Visible'}
                        size="small"
                        color={item.hidden ? 'error' : 'success'}
                      />
                    </TableCell>
                    <TableCell>{format(new Date(item.createdAt), 'MMM d, yyyy HH:mm')}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => handleShowDetails(item)}>
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      {item.hidden ? (
                        <Tooltip title="Unhide">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleActionClick(item, 'unhide')}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Hide">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleActionClick(item, 'hide')}
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
        <DialogTitle>Marketplace Item Details</DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="body2" gutterBottom>
                <strong>ID:</strong> {selectedItem.id}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Title:</strong> {selectedItem.title}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Price:</strong> ${selectedItem.price.toFixed(2)}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Description:</strong>
              </Typography>
              <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.100' }}>
                <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>
                  {selectedItem.description}
                </Typography>
              </Paper>
              <Typography variant="body2" gutterBottom>
                <strong>Author:</strong> {selectedItem.profileName}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Status:</strong> {selectedItem.hidden ? 'Hidden' : 'Visible'}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Created:</strong>{' '}
                {format(new Date(selectedItem.createdAt), 'MMM d, yyyy HH:mm:ss')}
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
        <DialogTitle>Confirm {confirmAction === 'hide' ? 'Hide' : 'Unhide'} Item</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {confirmAction} <strong>"{selectedItem?.title}"</strong>?
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
