import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  Alert,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import api from '../../services/api';
import { toast } from 'react-toastify';

interface Appointment {
  _id: string;
  doctorId: {
    _id: string;
    name: string;
    specialty: string;
    profileImage?: string;
  };
  date: string;
  time: string;
  type: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  symptoms?: string;
  notes?: string;
  prescription?: string;
  diagnosis?: string;
  createdAt: string;
}

interface ReviewData {
  rating: number;
  comment: string;
}

const AppointmentsList: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewData, setReviewData] = useState<ReviewData>({ rating: 0, comment: '' });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments');
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
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
      case 'no-show':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      await api.put(`/appointments/${appointmentId}/cancel`);
      toast.success('Appointment cancelled successfully');
      fetchAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Failed to cancel appointment');
    }
  };

  const handleRescheduleAppointment = async (appointmentId: string) => {
    // In a real app, this would open a reschedule dialog
    toast.info('Reschedule functionality would be implemented here');
  };

  const handleLeaveReview = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setReviewDialogOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedAppointment) return;

    try {
      await api.post(`/appointments/${selectedAppointment._id}/review`, reviewData);
      toast.success('Review submitted successfully');
      setReviewDialogOpen(false);
      setReviewData({ rating: 0, comment: '' });
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    }
  };

  const canCancelAppointment = (appointment: Appointment) => {
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
    const now = new Date();
    const hoursDifference = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return appointment.status === 'scheduled' && hoursDifference > 24; // Can cancel if more than 24 hours away
  };

  const canLeaveReview = (appointment: Appointment) => {
    return appointment.status === 'completed' && !appointment.prescription; // Assuming review is for completed appointments
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!user) {
    return (
      <Container maxWidth="md">
        <Typography variant="h6" color="text.secondary">
          Please log in to view your appointments.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Appointments
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Manage your healthcare appointments
        </Typography>

        {loading ? (
          <Typography variant="body1" color="text.secondary">
            Loading appointments...
          </Typography>
        ) : appointments.length === 0 ? (
          <Alert severity="info">
            You don't have any appointments yet. <Button onClick={() => window.location.href = '/doctors'}>Find a Doctor</Button>
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {appointments.map((appointment) => (
              <Grid item xs={12} md={6} lg={4} key={appointment._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        src={appointment.doctorId.profileImage}
                        sx={{ width: 50, height: 50, mr: 2 }}
                      >
                        {appointment.doctorId.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" component="h2">
                          Dr. {appointment.doctorId.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {appointment.doctorId.specialty}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CalendarIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {formatDate(appointment.date)}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <TimeIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {appointment.time}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PersonIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {appointment.type}
                        </Typography>
                      </Box>
                    </Box>

                    <Chip
                      label={appointment.status}
                      size="small"
                      color={getStatusColor(appointment.status) as any}
                      variant="filled"
                    />

                    {appointment.symptoms && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        <strong>Symptoms:</strong> {appointment.symptoms}
                      </Typography>
                    )}

                    {appointment.diagnosis && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        <strong>Diagnosis:</strong> {appointment.diagnosis}
                      </Typography>
                    )}
                  </CardContent>

                  <CardActions sx={{ justifyContent: 'space-between' }}>
                    <Box>
                      {canCancelAppointment(appointment) && (
                        <Button
                          size="small"
                          color="error"
                          startIcon={<CancelIcon />}
                          onClick={() => handleCancelAppointment(appointment._id)}
                        >
                          Cancel
                        </Button>
                      )}
                      {appointment.status === 'scheduled' && (
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => handleRescheduleAppointment(appointment._id)}
                        >
                          Reschedule
                        </Button>
                      )}
                    </Box>

                    {canLeaveReview(appointment) && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<StarIcon />}
                        onClick={() => handleLeaveReview(appointment)}
                      >
                        Review
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Review Dialog */}
        <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Leave a Review</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Typography variant="body1" gutterBottom>
                How was your experience with Dr. {selectedAppointment?.doctorId.name}?
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" sx={{ mr: 2 }}>
                  Rating:
                </Typography>
                <Rating
                  value={reviewData.rating}
                  onChange={(_, newValue) => setReviewData(prev => ({ ...prev, rating: newValue || 0 }))}
                  size="large"
                />
              </Box>

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Your Review"
                value={reviewData.comment}
                onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Share your experience..."
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSubmitReview}
              variant="contained"
              disabled={reviewData.rating === 0}
            >
              Submit Review
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default AppointmentsList;
