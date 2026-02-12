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
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Tooltip,
  TextField,
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import {
  useSchoolDomains,
  useAddSchoolDomain,
  useDeleteSchoolDomain,
} from '../hooks/useSchoolDomains';
import { SUCCESS_MESSAGES } from '../config/constants';
import type { SchoolDomain } from '../types';

export const SchoolsPage: React.FC = () => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<SchoolDomain | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const [newSchoolName, setNewSchoolName] = useState('');
  const [formError, setFormError] = useState('');

  // Fetch school domains
  const { data: schoolDomains, isLoading, error } = useSchoolDomains();

  // Mutations
  const addSchoolDomainMutation = useAddSchoolDomain();
  const deleteSchoolDomainMutation = useDeleteSchoolDomain();

  const handleDeleteClick = (school: SchoolDomain) => {
    setSelectedSchool(school);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedSchool) return;

    try {
      await deleteSchoolDomainMutation.mutateAsync(selectedSchool.id);
      setSuccessMessage(SUCCESS_MESSAGES.SCHOOL_DOMAIN_DELETED);
      setConfirmOpen(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleAddDialogOpen = () => {
    setNewDomain('');
    setNewSchoolName('');
    setFormError('');
    setAddDialogOpen(true);
  };

  const handleAddSchool = async () => {
    // Validate inputs
    if (!newDomain.trim() || !newSchoolName.trim()) {
      setFormError('Both domain and school name are required');
      return;
    }

    // Basic domain validation
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(newDomain.trim())) {
      setFormError('Please enter a valid domain (e.g., example.edu)');
      return;
    }

    try {
      await addSchoolDomainMutation.mutateAsync({
        domain: newDomain.trim(),
        schoolName: newSchoolName.trim(),
      });
      setSuccessMessage(SUCCESS_MESSAGES.SCHOOL_DOMAIN_ADDED);
      setAddDialogOpen(false);
      setNewDomain('');
      setNewSchoolName('');
      setFormError('');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Add failed:', err);
      setFormError('Failed to add school domain. It may already exist.');
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            School Domain Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage approved school email domains for user registration
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddDialogOpen}
        >
          Add School
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <strong>Error loading school domains:</strong> {error.message}
          <br />
          <small>Check browser console for more details</small>
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
                <TableCell>Domain</TableCell>
                <TableCell>School Name</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : !schoolDomains || schoolDomains.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    {!schoolDomains ? (
                      <>
                        No data received from server
                        <br />
                        <small>Check browser console for details</small>
                      </>
                    ) : (
                      <>
                        No school domains found
                        <br />
                        <small>Add your first school domain to get started</small>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                schoolDomains.map((school) => (
                  <TableRow key={school.id}>
                    <TableCell>{school.domain}</TableCell>
                    <TableCell>{school.schoolName}</TableCell>
                    <TableCell>{new Date(school.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Delete School Domain">
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteClick(school)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add School Domain Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add School Domain</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Domain"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="example.edu"
              fullWidth
              error={!!formError && !newDomain.trim()}
              helperText="Enter the email domain (e.g., harvard.edu, mit.edu)"
            />
            <TextField
              label="School Name"
              value={newSchoolName}
              onChange={(e) => setNewSchoolName(e.target.value)}
              placeholder="Example University"
              fullWidth
              error={!!formError && !newSchoolName.trim()}
              helperText="Enter the full school name"
            />
            {formError && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {formError}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAddSchool}
            variant="contained"
            color="primary"
            disabled={addSchoolDomainMutation.isPending}
          >
            {addSchoolDomainMutation.isPending ? 'Adding...' : 'Add School'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the school domain{' '}
            <strong>{selectedSchool?.domain}</strong> ({selectedSchool?.schoolName})?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            This will prevent new registrations from this domain but won't affect existing users.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={deleteSchoolDomainMutation.isPending}
          >
            {deleteSchoolDomainMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
