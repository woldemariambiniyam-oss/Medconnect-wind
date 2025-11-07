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
  LinearProgress,
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  People as UsersIcon,
  VerifiedUser as VerificationIcon,
  Analytics as AnalyticsIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import api from '../services/api';

interface AdminStats {
  totalUsers: number;
  pendingVerifications: number;
  totalReports: number;
  systemHealth: number;
}

interface RecentActivity {
  _id: string;
  type: 'user_registration' | 'verification' | 'report' | 'system_alert';
  message: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
}

const AdminDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    pendingVerifications: 0,
    totalReports: 0,
    systemHealth: 100,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [statsResponse, activitiesResponse] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/recent-activities'),
      ]);

      setStats(statsResponse.data);
      setRecentActivities(activitiesResponse.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user_registration':
        return 'primary';
      case 'verification':
        return 'success';
      case 'report':
        return 'warning';
      case 'system_alert':
        return 'error';
      default:
        return 'default';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getSystemHealthColor = (health: number) => {
    if (health >= 90) return 'success';
    if (health >= 70) return 'warning';
    return 'error';
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Welcome back, {user?.name}
        </Typography>

        {/* System Health Alert */}
        {stats.systemHealth < 90 && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            ⚠️ System health is at {stats.systemHealth}%. Please check system logs for issues.
          </Alert>
        )}

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <UsersIcon color="primary" sx={{ mr: 1 }} />
                  <Box>
                    <Typography variant="h6">{stats.totalUsers}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Users
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
                  <VerificationIcon color="warning" sx={{ mr: 1 }} />
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
                  <AnalyticsIcon color="secondary" sx={{ mr: 1 }} />
                  <Box>
                    <Typography variant="h6">{stats.totalReports}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Reports
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
                  <SecurityIcon color={getSystemHealthColor(stats.systemHealth) as any} sx={{ mr: 1 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6">{stats.systemHealth}%</Typography>
                    <Typography variant="body2" color="text.secondary">
                      System Health
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={stats.systemHealth}
                      color={getSystemHealthColor(stats.systemHealth) as any}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Activities */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent Activities
              </Typography>
              <List>
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <ListItem key={activity._id} divider>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Chip
                              label={activity.type.replace('_', ' ')}
                              size="small"
                              color={getActivityColor(activity.type) as any}
                              variant="outlined"
                            />
                            <Chip
                              label={activity.severity}
                              size="small"
                              color={getSeverityColor(activity.severity) as any}
                              variant="filled"
                            />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {activity.message}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(activity.timestamp).toLocaleString()}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText
                      primary="No recent activities"
                      secondary="System is running smoothly"
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
                  Manage Users
                </Button>
                <Button variant="outlined" fullWidth>
                  Review Verifications
                </Button>
                <Button variant="outlined" fullWidth>
                  View Reports
                </Button>
                <Button variant="outlined" fullWidth>
                  System Logs
                </Button>
                <Button variant="outlined" fullWidth>
                  Analytics Dashboard
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default AdminDashboard;
