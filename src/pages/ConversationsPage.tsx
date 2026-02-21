import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  IconButton,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import { Visibility as VisibilityIcon } from '@mui/icons-material';
import { useConversations } from '../hooks/useConversations';
import { PAGINATION_CONFIG, ROUTES } from '../config/constants';
import { format } from 'date-fns';

export const ConversationsPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(PAGINATION_CONFIG.DEFAULT_PAGE_SIZE);
  const navigate = useNavigate();

  const { data, isLoading, error } = useConversations(page + 1, rowsPerPage);

  const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Conversations
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View all user conversations
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message}
        </Alert>
      )}

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Participants</TableCell>
                <TableCell>Last Message At</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : !data || data.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No conversations found
                  </TableCell>
                </TableRow>
              ) : (
                data.data.map((conversation) => (
                  <TableRow key={conversation.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200, wordBreak: 'break-all' }}>
                        {conversation.id}
                      </Typography>
                    </TableCell>
                    <TableCell>{(conversation.participantIds ?? []).length} participants</TableCell>
                    <TableCell>
                      {conversation.lastMessageAt
                        ? format(new Date(conversation.lastMessageAt), 'MMM d, yyyy HH:mm')
                        : 'No messages yet'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(conversation.createdAt), 'MMM d, yyyy HH:mm')}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Messages">
                        <IconButton
                          size="small"
                          onClick={() => navigate(ROUTES.CONVERSATION_DETAIL(conversation.id))}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
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
