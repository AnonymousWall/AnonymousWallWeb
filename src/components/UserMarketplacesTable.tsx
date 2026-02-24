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
  CircularProgress,
  Alert,
} from '@mui/material';
import { useUserMarketplaces } from '../hooks/useUsers';
import { PAGINATION_CONFIG, ROUTES, QUERY_KEYS } from '../config/constants';
import { format } from 'date-fns';
import { EntityLink } from './EntityLinks';
import { ImageViewerButton } from './ImageViewerButton';
import { marketplaceService } from '../api/marketplaceService';

interface UserMarketplacesTableProps {
  userId: string;
}

export const UserMarketplacesTable: React.FC<UserMarketplacesTableProps> = ({ userId }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(PAGINATION_CONFIG.DEFAULT_PAGE_SIZE);

  const { data, isLoading, error } = useUserMarketplaces(userId, page + 1, rowsPerPage, !!userId);

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error.message}
      </Alert>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        User Marketplace Items
      </Typography>
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Comments</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Images</TableCell>
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
                    <TableCell>${item.price.toFixed(2)}</TableCell>
                    <TableCell>{item.commentCount}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.hidden ? 'Hidden' : 'Visible'}
                        size="small"
                        color={item.hidden ? 'error' : 'success'}
                      />
                    </TableCell>
                    <TableCell>{format(new Date(item.createdAt), 'MMM d, yyyy HH:mm')}</TableCell>
                    <TableCell>
                      <ImageViewerButton
                        entityId={item.id}
                        fetchImages={(id) => marketplaceService.getMarketplaceImages(id)}
                        queryKey={QUERY_KEYS.MARKETPLACE_IMAGES}
                        dialogTitle="Marketplace Item Images"
                      />
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
            onPageChange={(_e, p) => setPage(p)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        )}
      </Paper>
    </Box>
  );
};
