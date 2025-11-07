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
} from '@mui/material';
import {
  LocalHospital as DoctorIcon,
  Event as AppointmentIcon,
  Receipt as PrescriptionIcon,
  Payment as PaymentIcon,
  Notifications as NotificationIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store/store';
import api from '../services/api';

interface DashboardStats {
  appointments: number;
  prescriptions: number;
  payments: number;
  notifications: number;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  date: string;
  status?: string;
}

const Dashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    appointments: 0,
    prescriptions: 0,
    payments: 0,
    notifications: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats based on user role
      let statsResponse;
      let activitiesResponse;

      switch (user?.role) {
        case 'patient':
          statsResponse = await api.get('/patients/stats');
          activitiesResponse = await api.get('/patients/activities');
          break;
        case 'doctor':
          statsResponse = await api.get('/doctors/stats');
          activitiesResponse = await api.get('/doctors/activities');
          break;
        case 'pharmacy':
          statsResponse = await api.get('/pharmacies/stats');
          activitiesResponse = await api.get('/pharmacies/activities');
          break;
        case 'admin':
        case 'efda':
          statsResponse = await api.get('/admin/stats');
          activitiesResponse = await api.get('/admin/activities');
          break;
        default:
          return;
      }

      setStats(statsResponse.data);
      setRecentActivities(activitiesResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const getRoleSpecificContent = () => {
    switch (user?.role) {
      case 'patient':
        return {
          title: 'Patient Dashboard',
          description: 'Manage your healthcare appointments and prescriptions',
          quickActions: [
            { label: 'Book Appointment', action: () => navigate('/doctors') },
            { label: 'View Prescriptions', action: () => navigate('/prescriptions') },
            { label: 'Make Payment', action: () => navigate('/payments') },
          ],
        };
      case 'doctor':
        return {
          title: 'Doctor Dashboard',
          description: 'Manage your appointments and patient care',
          quickActions: [
            { label: 'View Appointments', action: () => navigate('/appointments') },
            { label: 'Write Prescription', action: () => navigate('/prescriptions') },
            { label: 'View Patients', action: () => navigate('/patients') },
          ],
        };
      case 'pharmacy':
        return {
          title: 'Pharmacy Dashboard',
          description: 'Manage inventory and fulfill prescriptions',
          quickActions: [
            { label: 'Manage Inventory', action: () => navigate('/medicines') },
            { label: 'View Prescriptions', action: () => navigate('/prescriptions') },
          ],
        };
      case 'admin':
      case 'efda':
        return {
          title: 'Admin Dashboard',
          description: 'Manage users and system operations',
          quickActions: [
            { label: 'Manage Users', action: () => navigate('/users') },
            { label: 'Verify Entities', action: () => navigate('/verifications') },
          ],
        };
      default:
        return {
          title: 'Dashboard',
          description: 'Welcome to Medconnect-wind',
          quickActions: [],
        };
    }
  };

  const content = getRoleSpecificContent();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {content.title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {content.description}
        </Typography>
      </Box>

      {/* Quick Actions */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {content.quickActions.map((action, index) => (
            <Button
              key={index}
              variant="contained"
              onClick={action.action}
              sx={{ minWidth: 150 }}
            >
              {action.label}
            </Button>
          ))}
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AppointmentIcon color="primary" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h6">{stats.appointments}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Appointments
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
                <PrescriptionIcon color="secondary" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h6">{stats.prescriptions}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Prescriptions
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
                <PaymentIcon color="success" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h6">{stats.payments}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Payments
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
                <NotificationIcon color="warning" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h6">{stats.notifications}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Notifications
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activities */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activities
            </Typography>
            <List>
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <ListItem key={activity.id} divider>
                    <ListItemText
                      primary={activity.description}
                      secondary={new Date(activity.date).toLocaleDateString()}
                    />
                    {activity.status && (
                      <Chip
                        label={activity.status}
                        color={activity.status === 'completed' ? 'success' : 'default'}
                        size="small"
                      />
                    )}
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="No recent activities" />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
