import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  TablePagination,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useConversationMessages } from '../hooks/useConversations';
import { PAGINATION_CONFIG } from '../config/constants';
import { format } from 'date-fns';

export const ConversationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(PAGINATION_CONFIG.DEFAULT_PAGE_SIZE);

  const { data, isLoading, error } = useConversationMessages(id || '', page + 1, rowsPerPage, !!id);

  const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Back
        </Button>
      </Box>

      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Conversation Messages
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, wordBreak: 'break-all' }}>
        Conversation ID: {id}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message}
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : !data || data.data.length === 0 ? (
        <Paper sx={{ p: 3 }}>
          <Typography color="text.secondary">No messages found</Typography>
        </Paper>
      ) : (
        <Paper sx={{ p: 2 }}>
          {data.data.map((message, index) => (
            <Box key={message.id}>
              <Card variant="outlined" sx={{ mb: 1 }}>
                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Sender: {message.senderId}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {message.content}
                      </Typography>
                    </Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: 2, flexShrink: 0 }}
                    >
                      {format(new Date(message.createdAt), 'MMM d, yyyy HH:mm')}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
              {index < data.data.length - 1 && <Divider sx={{ my: 0.5 }} />}
            </Box>
          ))}
          <TablePagination
            rowsPerPageOptions={PAGINATION_CONFIG.PAGE_SIZE_OPTIONS}
            component="div"
            count={data.pagination.total}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}
    </Box>
  );
};
