import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Avatar,
  Chip,
  Alert,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  MedicalServices as MedicalIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import api from '../../services/api';
import { toast } from 'react-toastify';

interface Doctor {
  _id: string;
  name: string;
  specialty: string;
  experience: number;
  rating: number;
  location: string;
  consultationFee: number;
  availability: string[];
  profileImage?: string;
}

interface AppointmentForm {
  date: string;
  time: string;
  type: string;
  symptoms: string;
  notes: string;
}

const BookAppointment: React.FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<AppointmentForm>({
    date: '',
    time: '',
    type: 'consultation',
    symptoms: '',
    notes: '',
  });

  useEffect(() => {
    if (doctorId) {
      fetchDoctor();
    }
  }, [doctorId]);

  const fetchDoctor = async () => {
    try {
      const response = await api.get(`/doctors/${doctorId}`);
      setDoctor(response.data);
    } catch (error) {
      console.error('Error fetching doctor:', error);
      toast.error('Failed to load doctor information');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof AppointmentForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please log in to book an appointment');
      return;
    }

    if (!form.date || !form.time) {
      toast.error('Please select date and time');
      return;
    }

    setSubmitting(true);
    try {
      const appointmentData = {
        doctorId,
        patientId: user.id,
        ...form,
        status: 'scheduled',
      };

      await api.post('/appointments', appointmentData);
      toast.success('Appointment booked successfully!');
      navigate('/appointments');
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error('Failed to book appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getAvailableTimes = () => {
    // Mock available times - in real app, this would come from doctor's schedule
    return [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
    ];
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30); // Allow booking up to 30 days in advance
    return maxDate.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Typography variant="body1" color="text.secondary">
          Loading doctor information...
        </Typography>
      </Container>
    );
  }

  if (!doctor) {
    return (
      <Container maxWidth="md">
        <Alert severity="error">
          Doctor not found. Please go back and select a different doctor.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Book Appointment
        </Typography>

        {/* Doctor Info Card */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                src={doctor.profileImage}
                sx={{ width: 80, height: 80, mr: 3 }}
              >
                {doctor.name.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h5" component="h2">
                  Dr. {doctor.name}
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  {doctor.specialty}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {doctor.experience} years experience • ⭐ {doctor.rating} rating
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  📍 {doctor.location} • 💰 ${doctor.consultationFee} / consultation
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              <Typography variant="body2" sx={{ mr: 1, fontWeight: 'bold' }}>
                Available:
              </Typography>
              {doctor.availability.map((day) => (
                <Chip
                  key={day}
                  label={day}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Appointment Form */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Appointment Details
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Appointment Date"
                  type="date"
                  value={form.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{
                    min: getMinDate(),
                    max: getMaxDate(),
                  }}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Time</InputLabel>
                  <Select
                    value={form.time}
                    label="Time"
                    onChange={(e) => handleInputChange('time', e.target.value)}
                    required
                  >
                    {getAvailableTimes().map((time) => (
                      <MenuItem key={time} value={time}>
                        {time}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Appointment Type</InputLabel>
                  <Select
                    value={form.type}
                    label="Appointment Type"
                    onChange={(e) => handleInputChange('type', e.target.value)}
                  >
                    <MenuItem value="consultation">Consultation</MenuItem>
                    <MenuItem value="follow-up">Follow-up</MenuItem>
                    <MenuItem value="emergency">Emergency</MenuItem>
                    <MenuItem value="check-up">Check-up</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Symptoms (Optional)"
                  multiline
                  rows={2}
                  value={form.symptoms}
                  onChange={(e) => handleInputChange('symptoms', e.target.value)}
                  placeholder="Describe your symptoms..."
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Additional Notes (Optional)"
                  multiline
                  rows={3}
                  value={form.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Any additional information for the doctor..."
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/doctors')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                sx={{ minWidth: 150 }}
              >
                {submitting ? 'Booking...' : 'Book Appointment'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default BookAppointment;
