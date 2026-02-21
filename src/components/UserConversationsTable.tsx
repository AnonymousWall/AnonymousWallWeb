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
  IconButton,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import { Visibility as VisibilityIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUserConversations } from '../hooks/useUsers';
import { PAGINATION_CONFIG, ROUTES } from '../config/constants';
import { format } from 'date-fns';

interface UserConversationsTableProps {
  userId: string;
}

export const UserConversationsTable: React.FC<UserConversationsTableProps> = ({ userId }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(PAGINATION_CONFIG.DEFAULT_PAGE_SIZE);
  const navigate = useNavigate();

  const { data, isLoading, error } = useUserConversations(userId, page + 1, rowsPerPage, !!userId);

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
        User Conversations
      </Typography>
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Participants</TableCell>
                <TableCell>Last Message At</TableCell>
                <TableCell>Messages</TableCell>
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
                data.data.map((conv) => (
                  <TableRow key={conv.conversationId} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 150, wordBreak: 'break-all' }}>
                        {conv.conversationId}
                      </Typography>
                    </TableCell>
                    <TableCell>{(conv.participantIds ?? []).length} participants</TableCell>
                    <TableCell>
                      {conv.lastMessageAt
                        ? format(new Date(conv.lastMessageAt), 'MMM d, yyyy HH:mm')
                        : 'No messages yet'}
                    </TableCell>
                    <TableCell>{conv.messageCount ?? 0} messages</TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Messages">
                        <IconButton
                          size="small"
                          onClick={() => navigate(ROUTES.CONVERSATION_DETAIL(conv.conversationId))}
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
