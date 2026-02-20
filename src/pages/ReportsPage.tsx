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
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Tooltip,
} from '@mui/material';
import { CheckCircle as ResolveIcon, Cancel as RejectIcon } from '@mui/icons-material';
import { useReports, useResolveReport, useRejectReport } from '../hooks/useReports';
import { PAGINATION_CONFIG, SUCCESS_MESSAGES } from '../config/constants';
import type { PostReport, CommentReport } from '../types';
import { format } from 'date-fns';
import { UserLink, PostLink, CommentLink } from '../components/EntityLinks';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const statusColor = (status?: string) => {
  if (status === 'RESOLVED') return 'success';
  if (status === 'REJECTED') return 'error';
  return 'warning';
};

export const ReportsPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(PAGINATION_CONFIG.DEFAULT_PAGE_SIZE);
  const [tabValue, setTabValue] = useState(0);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [successMessage, setSuccessMessage] = useState('');

  const {
    data: reports,
    isLoading,
    error,
  } = useReports(page + 1, rowsPerPage, undefined, sortBy, sortOrder);

  const resolveReportMutation = useResolveReport();
  const rejectReportMutation = useRejectReport();

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

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

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleResolve = async (id: string, type: 'POST' | 'COMMENT') => {
    try {
      await resolveReportMutation.mutateAsync({ id, type });
      setSuccessMessage(SUCCESS_MESSAGES.REPORT_RESOLVED);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Resolve failed:', err);
    }
  };

  const handleReject = async (id: string, type: 'POST' | 'COMMENT') => {
    try {
      await rejectReportMutation.mutateAsync({ id, type });
      setSuccessMessage(SUCCESS_MESSAGES.REPORT_REJECTED);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Reject failed:', err);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Report Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage reported posts and comments
        </Typography>
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
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label={`Post Reports (${reports?.postReports.length || 0})`} />
            <Tab label={`Comment Reports (${reports?.commentReports.length || 0})`} />
          </Tabs>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TabPanel value={tabValue} index={0}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Post ID</TableCell>
                      <TableCell>Reporter ID</TableCell>
                      <TableCell>Reported User ID</TableCell>
                      <TableCell>Reason</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={sortBy === 'createdAt'}
                          direction={sortBy === 'createdAt' ? sortOrder : 'asc'}
                          onClick={() => handleSort('createdAt')}
                        >
                          Reported At
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {!reports || reports.postReports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          No post reports found
                        </TableCell>
                      </TableRow>
                    ) : (
                      reports.postReports.map((report: PostReport) => (
                        <TableRow key={report.id} hover>
                          <TableCell>
                            <PostLink postId={report.postId}>{report.postId}</PostLink>
                          </TableCell>
                          <TableCell>
                            <UserLink userId={report.reporterUserId}>
                              {report.reporterUserId}
                            </UserLink>
                          </TableCell>
                          <TableCell>
                            <UserLink userId={report.reportedUserId}>
                              {report.reportedUserId}
                            </UserLink>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ maxWidth: 300 }}>
                              {report.reason || 'No reason provided'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={report.status || 'PENDING'}
                              size="small"
                              color={statusColor(report.status)}
                            />
                          </TableCell>
                          <TableCell>
                            {format(new Date(report.createdAt), 'MMM d, yyyy HH:mm')}
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Resolve">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleResolve(report.id, 'POST')}
                                disabled={
                                  resolveReportMutation.isPending || rejectReportMutation.isPending
                                }
                              >
                                <ResolveIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleReject(report.id, 'POST')}
                                disabled={
                                  resolveReportMutation.isPending || rejectReportMutation.isPending
                                }
                              >
                                <RejectIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Comment ID</TableCell>
                      <TableCell>Reporter ID</TableCell>
                      <TableCell>Reported User ID</TableCell>
                      <TableCell>Reason</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={sortBy === 'createdAt'}
                          direction={sortBy === 'createdAt' ? sortOrder : 'asc'}
                          onClick={() => handleSort('createdAt')}
                        >
                          Reported At
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {!reports || reports.commentReports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          No comment reports found
                        </TableCell>
                      </TableRow>
                    ) : (
                      reports.commentReports.map((report: CommentReport) => (
                        <TableRow key={report.id} hover>
                          <TableCell>
                            <CommentLink commentId={report.commentId}>
                              {report.commentId}
                            </CommentLink>
                          </TableCell>
                          <TableCell>
                            <UserLink userId={report.reporterUserId}>
                              {report.reporterUserId}
                            </UserLink>
                          </TableCell>
                          <TableCell>
                            <UserLink userId={report.reportedUserId}>
                              {report.reportedUserId}
                            </UserLink>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ maxWidth: 300 }}>
                              {report.reason || 'No reason provided'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={report.status || 'PENDING'}
                              size="small"
                              color={statusColor(report.status)}
                            />
                          </TableCell>
                          <TableCell>
                            {format(new Date(report.createdAt), 'MMM d, yyyy HH:mm')}
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Resolve">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleResolve(report.id, 'COMMENT')}
                                disabled={
                                  resolveReportMutation.isPending || rejectReportMutation.isPending
                                }
                              >
                                <ResolveIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleReject(report.id, 'COMMENT')}
                                disabled={
                                  resolveReportMutation.isPending || rejectReportMutation.isPending
                                }
                              >
                                <RejectIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            {reports && (
              <TablePagination
                rowsPerPageOptions={PAGINATION_CONFIG.PAGE_SIZE_OPTIONS}
                component="div"
                count={reports.pagination.total}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            )}
          </>
        )}
      </Paper>
    </Box>
  );
};
