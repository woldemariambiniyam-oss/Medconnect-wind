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
} from '@mui/material';
import {
  Event as AppointmentIcon,
  Receipt as PrescriptionIcon,
  Person as PatientIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import api from '../services/api';

interface DoctorStats {
  totalAppointments: number;
  todayAppointments: number;
  totalPrescriptions: number;
  totalPatients: number;
}

interface TodayAppointment {
  _id: string;
  patientName: string;
  time: string;
  type: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

const DoctorDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [stats, setStats] = useState<DoctorStats>({
    totalAppointments: 0,
    todayAppointments: 0,
    totalPrescriptions: 0,
    totalPatients: 0,
  });
  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([]);

  useEffect(() => {
    fetchDoctorData();
  }, []);

  const fetchDoctorData = async () => {
    try {
      const [statsResponse, appointmentsResponse] = await Promise.all([
        api.get('/doctors/stats'),
        api.get('/doctors/today-appointments'),
      ]);

      setStats(statsResponse.data);
      setTodayAppointments(appointmentsResponse.data);
    } catch (error) {
      console.error('Error fetching doctor data:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Doctor Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Welcome back, Dr. {user?.name}
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AppointmentIcon color="primary" sx={{ mr: 1 }} />
                  <Box>
                    <Typography variant="h6">{stats.totalAppointments}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Appointments
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
                  <AppointmentIcon color="warning" sx={{ mr: 1 }} />
                  <Box>
                    <Typography variant="h6">{stats.todayAppointments}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Today's Appointments
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
                    <Typography variant="h6">{stats.totalPrescriptions}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Prescriptions Issued
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
                  <PatientIcon color="success" sx={{ mr: 1 }} />
                  <Box>
                    <Typography variant="h6">{stats.totalPatients}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Patients
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Today's Appointments */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Today's Appointments
              </Typography>
              <List>
                {todayAppointments.length > 0 ? (
                  todayAppointments.map((appointment) => (
                    <ListItem key={appointment._id} divider>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ width: 32, height: 32 }}>
                              {appointment.patientName.charAt(0)}
                            </Avatar>
                            <Typography variant="subtitle1">
                              {appointment.patientName}
                            </Typography>
                            <Chip
                              label={appointment.status}
                              size="small"
                              color={getStatusColor(appointment.status) as any}
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              {appointment.time} - {appointment.type}
                            </Typography>
                            <Button size="small" variant="outlined">
                              View Details
                            </Button>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText
                      primary="No appointments scheduled for today"
                      secondary="Take some time to review patient records or update prescriptions"
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
                  Schedule New Appointment
                </Button>
                <Button variant="outlined" fullWidth>
                  Write Prescription
                </Button>
                <Button variant="outlined" fullWidth>
                  View Patient Records
                </Button>
                <Button variant="outlined" fullWidth>
                  Update Availability
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default DoctorDashboard;
