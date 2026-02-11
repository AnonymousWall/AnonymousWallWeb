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
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
} from '@mui/material';
import { apiService } from '../services/api';
import type { PostReport, CommentReport, ReportsResponse } from '../types';
import { format } from 'date-fns';

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

export const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<ReportsResponse | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [reportType, setReportType] = useState<'all' | 'post' | 'comment'>('all');

  useEffect(() => {
    loadReports();
  }, [page, rowsPerPage, reportType]);

  const loadReports = async () => {
    setIsLoading(true);
    setError('');
    try {
      const type = reportType === 'all' ? undefined : reportType;
      const response = await apiService.getReports(page + 1, rowsPerPage, type);
      setReports(response);
      setTotal(response.pagination.total);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load reports');
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

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Report Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage reported posts and comments
          </Typography>
        </Box>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Filter</InputLabel>
          <Select
            value={reportType}
            label="Filter"
            onChange={(e) => {
              setReportType(e.target.value as 'all' | 'post' | 'comment');
              setPage(0);
            }}
          >
            <MenuItem value="all">All Reports</MenuItem>
            <MenuItem value="post">Post Reports</MenuItem>
            <MenuItem value="comment">Comment Reports</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
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
                      <TableCell>Reason</TableCell>
                      <TableCell>Reported At</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reports?.postReports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No post reports found
                        </TableCell>
                      </TableRow>
                    ) : (
                      reports?.postReports.map((report: PostReport) => (
                        <TableRow key={report.id} hover>
                          <TableCell>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                              {report.postId}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                              {report.reporterUserId}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ maxWidth: 300 }}>
                              {report.reason || 'No reason provided'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {format(new Date(report.createdAt), 'MMM d, yyyy HH:mm')}
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
                      <TableCell>Reason</TableCell>
                      <TableCell>Reported At</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reports?.commentReports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No comment reports found
                        </TableCell>
                      </TableRow>
                    ) : (
                      reports?.commentReports.map((report: CommentReport) => (
                        <TableRow key={report.id} hover>
                          <TableCell>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                              {report.commentId}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                              {report.reporterUserId}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ maxWidth: 300 }}>
                              {report.reason || 'No reason provided'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {format(new Date(report.createdAt), 'MMM d, yyyy HH:mm')}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            <TablePagination
              rowsPerPageOptions={[10, 20, 50, 100]}
              component="div"
              count={total}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>
    </Box>
  );
};
