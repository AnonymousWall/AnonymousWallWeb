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
import { useUserInternships } from '../hooks/useUsers';
import { PAGINATION_CONFIG, ROUTES } from '../config/constants';
import { format } from 'date-fns';
import { EntityLink } from './EntityLinks';

interface UserInternshipsTableProps {
  userId: string;
}

export const UserInternshipsTable: React.FC<UserInternshipsTableProps> = ({ userId }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(PAGINATION_CONFIG.DEFAULT_PAGE_SIZE);

  const { data, isLoading, error } = useUserInternships(userId, page + 1, rowsPerPage, !!userId);

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
        User Internships
      </Typography>
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Comments</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
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
