import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Person as PersonIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as ActivateIcon,
  AdminPanelSettings as AdminIcon,
  LocalHospital as DoctorIcon,
  LocalPharmacy as PharmacyIcon,
  PersonOutline as PatientIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import api from '../../services/api';
import { toast } from 'react-toastify';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'patient' | 'doctor' | 'pharmacy' | 'admin' | 'efda';
  isActive: boolean;
  isVerified: boolean;
  profileImage?: string;
  createdAt: string;
  lastLogin?: string;
  specialization?: string;
  licenseNumber?: string;
  pharmacyName?: string;
  address?: string;
}

interface UserFormData {
  name: string;
  email: string;
  phone: string;
  role: string;
  specialization?: string;
  licenseNumber?: string;
  pharmacyName?: string;
  address?: string;
}

const UserManagement: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    phone: '',
    role: 'patient',
    specialization: '',
    licenseNumber: '',
    pharmacyName: '',
    address: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'doctor':
        return 'primary';
      case 'pharmacy':
        return 'secondary';
      case 'efda':
        return 'warning';
      case 'patient':
        return 'default';
      default:
        return 'default';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <AdminIcon />;
      case 'doctor':
        return <DoctorIcon />;
      case 'pharmacy':
        return <PharmacyIcon />;
      case 'patient':
        return <PatientIcon />;
      default:
        return <PersonIcon />;
    }
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setDetailDialogOpen(true);
  };

  const handleCreateUser = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'patient',
      specialization: '',
      licenseNumber: '',
      pharmacyName: '',
      address: '',
    });
    setCreateDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      specialization: user.specialization || '',
      licenseNumber: user.licenseNumber || '',
      pharmacyName: user.pharmacyName || '',
      address: user.address || '',
    });
    setEditDialogOpen(true);
  };

  const handleSubmitUser = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (createDialogOpen) {
        await api.post('/admin/users', formData);
        toast.success('User created successfully');
      } else if (editDialogOpen && selectedUser) {
        await api.put(`/admin/users/${selectedUser._id}`, formData);
        toast.success('User updated successfully');
      }

      setCreateDialogOpen(false);
      setEditDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Failed to save user');
    }
  };

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { isActive });
      toast.success(`User ${isActive ? 'activated' : 'deactivated'} successfully`);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await api.delete(`/admin/users/${userId}`);
        toast.success('User deleted successfully');
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getUsersByRole = (role: string) => {
    return users.filter(u => u.role === role);
  };

  const getActiveUsers = () => {
    return users.filter(u => u.isActive);
  };

  const getVerifiedUsers = () => {
    return users.filter(u => u.isVerified);
  };

  if (!user) {
    return (
      <Container maxWidth="md">
        <Typography variant="h6" color="text.secondary">
          Please log in to manage users.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            User Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateUser}
          >
            Add User
          </Button>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary">
                  Total Users
                </Typography>
                <Typography variant="h4">
                  {users.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="success.main">
                  Active Users
                </Typography>
                <Typography variant="h4">
                  {getActiveUsers().length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="info.main">
                  Verified Users
                </Typography>
                <Typography variant="h4">
                  {getVerifiedUsers().length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="warning.main">
                  Doctors
                </Typography>
                <Typography variant="h4">
                  {getUsersByRole('doctor').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Users Table */}
        {loading ? (
          <Typography variant="body1" color="text.secondary">
            Loading users...
          </Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Verification</TableCell>
                  <TableCell>Last Login</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          src={user.profileImage}
                          sx={{ width: 40, height: 40, mr: 2 }}
                        >
                          {user.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {user.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.email}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.phone}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getRoleIcon(user.role)}
                        label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        size="small"
                        color={getRoleColor(user.role) as any}
                        variant="filled"
                      />
                      {user.role === 'doctor' && user.specialization && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          {user.specialization}
                        </Typography>
                      )}
                      {user.role === 'pharmacy' && user.pharmacyName && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          {user.pharmacyName}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={user.isActive}
                            onChange={(e) => handleToggleUserStatus(user._id, e.target.checked)}
                            color="primary"
                          />
                        }
                        label={user.isActive ? 'Active' : 'Inactive'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.isVerified ? 'Verified' : 'Unverified'}
                        size="small"
                        color={user.isVerified ? 'success' : 'warning'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleViewDetails(user)}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleEditUser(user)}
                        >
                          Edit
                        </Button>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteUser(user._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* User Details Dialog */}
        <Dialog
          open={detailDialogOpen}
          onClose={() => setDetailDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            User Details
            {selectedUser && (
              <Typography variant="body2" color="text.secondary">
                {selectedUser.name} - {selectedUser.email}
              </Typography>
            )}
          </DialogTitle>
          <DialogContent>
            {selectedUser && (
              <Box sx={{ pt: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Name"
                      value={selectedUser.name}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={selectedUser.email}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={selectedUser.phone}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Role"
                      value={selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Status"
                      value={selectedUser.isActive ? 'Active' : 'Inactive'}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Verification"
                      value={selectedUser.isVerified ? 'Verified' : 'Unverified'}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>

                  {selectedUser.role === 'doctor' && (
                    <>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Specialization"
                          value={selectedUser.specialization || 'Not specified'}
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="License Number"
                          value={selectedUser.licenseNumber || 'Not specified'}
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>
                    </>
                  )}

                  {selectedUser.role === 'pharmacy' && (
                    <>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Pharmacy Name"
                          value={selectedUser.pharmacyName || 'Not specified'}
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Address"
                          value={selectedUser.address || 'Not specified'}
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>
                    </>
                  )}

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Created At"
                      value={formatDate(selectedUser.createdAt)}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Last Login"
                      value={selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : 'Never'}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Create/Edit User Dialog */}
        <Dialog
          open={createDialogOpen || editDialogOpen}
          onClose={() => {
            setCreateDialogOpen(false);
            setEditDialogOpen(false);
          }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {createDialogOpen ? 'Create New User' : 'Edit User'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={formData.role}
                      label="Role"
                      onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    >
                      <MenuItem value="patient">Patient</MenuItem>
                      <MenuItem value="doctor">Doctor</MenuItem>
                      <MenuItem value="pharmacy">Pharmacy</MenuItem>
                      <MenuItem value="efda">EFDA</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {formData.role === 'doctor' && (
                  <>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Specialization"
                        value={formData.specialization}
                        onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                        placeholder="e.g., Cardiology, Pediatrics"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="License Number"
                        value={formData.licenseNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, licenseNumber: e.target.value }))}
                      />
                    </Grid>
                  </>
                )}

                {formData.role === 'pharmacy' && (
                  <>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Pharmacy Name"
                        value={formData.pharmacyName}
                        onChange={(e) => setFormData(prev => ({ ...prev, pharmacyName: e.target.value }))}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Address"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        multiline
                        rows={2}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setCreateDialogOpen(false);
              setEditDialogOpen(false);
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitUser}
              variant="contained"
              disabled={!formData.name || !formData.email || !formData.phone}
            >
              {createDialogOpen ? 'Create User' : 'Update User'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default UserManagement;
