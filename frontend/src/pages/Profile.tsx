import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Avatar,
  Divider,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { showSuccessToast, showErrorToast, showInfoToast } from '../components/NotificationToast';
import api from '../services/api';

interface ProfileData {
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  verified: boolean;
  profileImage?: string;
}

const Profile: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    email: '',
    phoneNumber: '',
    role: '',
    verified: false,
  });
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phoneNumber: (user as any).phoneNumber || '',
        role: user.role || '',
        verified: user.verified || false,
        profileImage: (user as any).profileImage || '',
      });
    }
  }, [user]);

  const handleInputChange = (field: keyof ProfileData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setProfileData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleUpdateProfile = async () => {
    setUpdating(true);
    try {
      const response = await api.put('/auth/profile', {
        name: profileData.name,
        phoneNumber: profileData.phoneNumber,
      });

      showSuccessToast('Profile updated successfully!');
    } catch (error: any) {
      showErrorToast(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    // TODO: Implement password change functionality
    showInfoToast('Password change functionality coming soon!');
  };

  if (!user) {
    return (
      <Container maxWidth="md">
        <Typography variant="h6" color="text.secondary">
          Please log in to view your profile.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Profile Settings
        </Typography>

        <Grid container spacing={4}>
          {/* Profile Picture and Basic Info */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '3rem',
                }}
              >
                {profileData.name.charAt(0).toUpperCase()}
              </Avatar>

              <Typography variant="h6" gutterBottom>
                {profileData.name}
              </Typography>

              <Typography variant="body2" color="text.secondary" gutterBottom>
                {profileData.email}
              </Typography>

              <Box sx={{ mt: 2 }}>
                {profileData.verified ? (
                  <Alert severity="success" sx={{ fontSize: '0.875rem' }}>
                    ✓ Verified Account
                  </Alert>
                ) : (
                  <Alert severity="warning" sx={{ fontSize: '0.875rem' }}>
                    Account not verified
                  </Alert>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Profile Form */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>

              <Box component="form" sx={{ mt: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={profileData.name}
                      onChange={handleInputChange('name')}
                      variant="outlined"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={profileData.email}
                      disabled
                      variant="outlined"
                      helperText="Email cannot be changed"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={profileData.phoneNumber}
                      onChange={handleInputChange('phoneNumber')}
                      variant="outlined"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Role</InputLabel>
                      <Select
                        value={profileData.role}
                        onChange={(e) => setProfileData(prev => ({ ...prev, role: e.target.value }))}
                        label="Role"
                        disabled
                      >
                        <MenuItem value="patient">Patient</MenuItem>
                        <MenuItem value="doctor">Doctor</MenuItem>
                        <MenuItem value="pharmacy">Pharmacy</MenuItem>
                        <MenuItem value="efda">EFDA</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleUpdateProfile}
                    disabled={updating}
                  >
                    {updating ? 'Updating...' : 'Update Profile'}
                  </Button>

                  <Button
                    variant="outlined"
                    onClick={handleChangePassword}
                  >
                    Change Password
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Profile;
