import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  Avatar,
  Alert,
} from '@mui/material';
import {
  VerifiedUser as VerificationIcon,
  Assignment as DocumentIcon,
  CheckCircle as ApprovedIcon,
  Pending as PendingIcon,
  Person as UserIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import api from '../services/api';

interface EFDADashboardStats {
  pendingVerifications: number;
  approvedToday: number;
  rejectedToday: number;
  totalReviewed: number;
}

interface PendingVerification {
  _id: string;
  userName: string;
  userType: 'doctor' | 'pharmacy' | 'patient';
  documentType: string;
  submittedAt: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
}

const EFDADashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [stats, setStats] = useState<EFDADashboardStats>({
    pendingVerifications: 0,
    approvedToday: 0,
    rejectedToday: 0,
    totalReviewed: 0,
  });
  const [pendingVerifications, setPendingVerifications] = useState<PendingVerification[]>([]);

  useEffect(() => {
    fetchEFDAData();
  }, []);

  const fetchEFDAData = async () => {
    try {
      const [statsResponse, verificationsResponse] = await Promise.all([
        api.get('/efda/stats'),
        api.get('/efda/pending-verifications'),
      ]);

      setStats(statsResponse.data);
      setPendingVerifications(verificationsResponse.data);
    } catch (error) {
      console.error('Error fetching EFDA data:', error);
    }
  };

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case 'doctor':
        return 'primary';
      case 'pharmacy':
        return 'secondary';
      case 'patient':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'under_review':
        return 'info';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleReviewVerification = async (verificationId: string, action: 'approve' | 'reject') => {
    try {
      await api.put(`/efda/verifications/${verificationId}/${action}`);
      // Refresh data
      fetchEFDAData();
    } catch (error) {
      console.error(`Error ${action}ing verification:`, error);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          EFDA Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Welcome back, {user?.name}
        </Typography>

        {/* Pending Verifications Alert */}
        {stats.pendingVerifications > 10 && (
          <Alert severity="info" sx={{ mb: 3 }}>
            📋 You have {stats.pendingVerifications} pending verifications to review.
          </Alert>
        )}

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PendingIcon color="warning" sx={{ mr: 1 }} />
                  <Box>
                    <Typography variant="h6">{stats.pendingVerifications}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending Verifications
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ApprovedIcon color="success" sx={{ mr: 1 }} />
                  <Box>
                    <Typography variant="h6">{stats.approvedToday}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Approved Today
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PendingIcon color="error" sx={{ mr: 1 }} />
                  <Box>
                    <Typography variant="h6">{stats.rejectedToday}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Rejected Today
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <VerificationIcon color="primary" sx={{ mr: 1 }} />
                  <Box>
                    <Typography variant="h6">{stats.totalReviewed}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Reviewed
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Pending Verifications */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Pending Verifications
              </Typography>
              <List>
                {pendingVerifications.length > 0 ? (
                  pendingVerifications.map((verification) => (
                    <ListItem key={verification._id} divider>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ width: 32, height: 32 }}>
                              {verification.userName.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1">
                                {verification.userName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {verification.documentType}
                              </Typography>
                            </Box>
                            <Chip
                              label={verification.userType}
                              size="small"
                              color={getUserTypeColor(verification.userType) as any}
                              variant="outlined"
                            />
                            <Chip
                              label={verification.status.replace('_', ' ')}
                              size="small"
                              color={getStatusColor(verification.status) as any}
                              variant="filled"
                            />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                              Submitted: {new Date(verification.submittedAt).toLocaleDateString()}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                onClick={() => handleReviewVerification(verification._id, 'approve')}
                              >
                                Approve
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={() => handleReviewVerification(verification._id, 'reject')}
                              >
                                Reject
                              </Button>
                              <Button size="small" variant="outlined">
                                View Documents
                              </Button>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText
                      primary="No pending verifications"
                      secondary="All verifications have been reviewed"
                    />
                  </ListItem>
                )}
              </List>
            </Paper>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button variant="contained" fullWidth>
                  Review All Pending
                </Button>
                <Button variant="outlined" fullWidth>
                  View Approved Today
                </Button>
                <Button variant="outlined" fullWidth>
                  View Rejected Today
                </Button>
                <Button variant="outlined" fullWidth>
                  Generate Report
                </Button>
                <Button variant="outlined" fullWidth>
                  Update Guidelines
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default EFDADashboard;
