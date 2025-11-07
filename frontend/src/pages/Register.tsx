import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Link,
  SelectChangeEvent,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../store/store';
import { useNavigate } from 'react-router-dom';
import { register, clearError } from '../store/authSlice';
import { RootState } from '../store/store';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    phoneNumber: '',
  });

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target as { name: string; value: string };
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleRoleChange = (event: SelectChangeEvent) => {
    setFormData({
      ...formData,
      role: event.target.value as string,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return;
    }

    try {
      const { confirmPassword, ...registerData } = formData;
      await dispatch(register(registerData)).unwrap();
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by the slice
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Sign Up
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
            Join Medconnect-wind Healthcare Platform
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Full Name"
              name="name"
              autoComplete="name"
              autoFocus
              value={formData.name}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                id="role"
                name="role"
                value={formData.role}
                label="Role"
                onChange={handleRoleChange}
              >
                <MenuItem value="patient">Patient</MenuItem>
                <MenuItem value="doctor">Doctor</MenuItem>
                <MenuItem value="pharmacy">Pharmacy</MenuItem>
              </Select>
            </FormControl>
            <TextField
              margin="normal"
              fullWidth
              id="phoneNumber"
              label="Phone Number"
              name="phoneNumber"
              autoComplete="tel"
              value={formData.phoneNumber}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={formData.password !== formData.confirmPassword && formData.confirmPassword !== ''}
              helperText={
                formData.password !== formData.confirmPassword && formData.confirmPassword !== ''
                  ? 'Passwords do not match'
                  : ''
              }
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading || formData.password !== formData.confirmPassword}
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link href="/login" variant="body2">
                {'Already have an account? Sign In'}
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
