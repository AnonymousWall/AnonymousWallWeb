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
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Link,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useReports } from '../hooks/useReports';
import { PAGINATION_CONFIG, ROUTES } from '../config/constants';
import type { PostReport, CommentReport } from '../types';
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

// Shared link styling for clickable IDs
const clickableLinkStyle = {
  textDecoration: 'none',
  cursor: 'pointer',
  '&:hover': { textDecoration: 'underline' },
  maxWidth: 200,
  display: 'block',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

export const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(PAGINATION_CONFIG.DEFAULT_PAGE_SIZE);
  const [tabValue, setTabValue] = useState(0);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch reports with pagination and sorting
  const {
    data: reports,
    isLoading,
    error,
  } = useReports(page + 1, rowsPerPage, undefined, sortBy, sortOrder);

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
      // When switching to a new field, use desc for dates and asc for others
      setSortOrder(field === 'createdAt' ? 'desc' : 'asc');
    }
    setSortBy(field);
    setPage(0);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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
                      <TableCell>
                        <TableSortLabel
                          active={sortBy === 'createdAt'}
                          direction={sortBy === 'createdAt' ? sortOrder : 'asc'}
                          onClick={() => handleSort('createdAt')}
                        >
                          Reported At
                        </TableSortLabel>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {!reports || reports.postReports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No post reports found
                        </TableCell>
                      </TableRow>
                    ) : (
                      reports.postReports.map((report: PostReport) => (
                        <TableRow key={report.id} hover>
                          <TableCell>
                            <Link
                              component="button"
                              variant="body2"
                              onClick={() => navigate(ROUTES.POST_DETAIL(report.postId))}
                              sx={clickableLinkStyle}
                            >
                              {report.postId}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Link
                              component="button"
                              variant="body2"
                              onClick={() => navigate(ROUTES.USER_DETAIL(report.reporterUserId))}
                              sx={clickableLinkStyle}
                            >
                              {report.reporterUserId}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Link
                              component="button"
                              variant="body2"
                              onClick={() => navigate(ROUTES.USER_DETAIL(report.reportedUserId))}
                              sx={clickableLinkStyle}
                            >
                              {report.reportedUserId}
                            </Link>
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
                      <TableCell>Reported User ID</TableCell>
                      <TableCell>Reason</TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={sortBy === 'createdAt'}
                          direction={sortBy === 'createdAt' ? sortOrder : 'asc'}
                          onClick={() => handleSort('createdAt')}
                        >
                          Reported At
                        </TableSortLabel>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {!reports || reports.commentReports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No comment reports found
                        </TableCell>
                      </TableRow>
                    ) : (
                      reports.commentReports.map((report: CommentReport) => (
                        <TableRow key={report.id} hover>
                          <TableCell>
                            <Link
                              component="button"
                              variant="body2"
                              onClick={() => navigate(ROUTES.COMMENT_DETAIL(report.commentId))}
                              sx={clickableLinkStyle}
                            >
                              {report.commentId}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Link
                              component="button"
                              variant="body2"
                              onClick={() => navigate(ROUTES.USER_DETAIL(report.reporterUserId))}
                              sx={clickableLinkStyle}
                            >
                              {report.reporterUserId}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Link
                              component="button"
                              variant="body2"
                              onClick={() => navigate(ROUTES.USER_DETAIL(report.reportedUserId))}
                              sx={clickableLinkStyle}
                            >
                              {report.reportedUserId}
                            </Link>
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
