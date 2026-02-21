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
  CircularProgress,
  Alert,
} from '@mui/material';
import { useUserComments } from '../hooks/useUsers';
import { PAGINATION_CONFIG } from '../config/constants';
import { format } from 'date-fns';
import { ParentEntityLink, CommentLink } from './EntityLinks';

interface UserCommentsTableProps {
  userId: string;
}

export const UserCommentsTable: React.FC<UserCommentsTableProps> = ({ userId }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(PAGINATION_CONFIG.DEFAULT_PAGE_SIZE);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch user comments with pagination and sorting
  const { data, isLoading, error } = useUserComments(
    userId,
    page + 1,
    rowsPerPage,
    sortBy,
    sortOrder,
    !!userId
  );

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      // Toggle order if clicking the same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // When switching to a new field, use desc for dates
      setSortOrder('desc');
    }
    setSortBy(field);
    setPage(0);
  };

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
        User Comments
      </Typography>
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Comment Text</TableCell>
                <TableCell>Parent</TableCell>
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
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : !data || data.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No comments found
                  </TableCell>
                </TableRow>
              ) : (
                data.data.map((comment) => (
                  <TableRow key={comment.id} hover>
                    <TableCell>
                      <CommentLink commentId={comment.id} sx={{ maxWidth: 300 }}>
                        {comment.text}
                      </CommentLink>
                    </TableCell>
                    <TableCell>
                      <ParentEntityLink
                        parentId={comment.postId}
                        parentType={comment.parentType}
                        sx={{ maxWidth: 150 }}
                      >
                        {comment.postId}
                      </ParentEntityLink>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={comment.hidden ? 'Hidden' : 'Visible'}
                        size="small"
                        color={comment.hidden ? 'error' : 'success'}
                      />
                    </TableCell>
                    <TableCell>
                      {format(new Date(comment.createdAt), 'MMM d, yyyy HH:mm')}
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
    </Box>
  );
};
