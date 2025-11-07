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
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
  CheckCircle as CompleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface Appointment {
  _id: string;
  patientId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    profileImage?: string;
  };
  date: string;
  time: string;
  type: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  symptoms?: string;
  notes?: string;
  diagnosis?: string;
  prescription?: string;
  createdAt: string;
}

interface AppointmentFormData {
  patientId: string;
  date: Date | null;
  time: Date | null;
  type: string;
  symptoms: string;
  notes: string;
}

const AppointmentsManagement: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [formData, setFormData] = useState<AppointmentFormData>({
    patientId: '',
    date: null,
    time: null,
    type: 'consultation',
    symptoms: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appointmentsResponse, patientsResponse] = await Promise.all([
        api.get('/doctors/appointments'),
        api.get('/doctors/patients'),
      ]);

      setAppointments(appointmentsResponse.data);
      setPatients(patientsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load appointments data');
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

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setDetailDialogOpen(true);
  };

  const handleScheduleAppointment = () => {
    setFormData({
      patientId: '',
      date: null,
      time: null,
      type: 'consultation',
      symptoms: '',
      notes: '',
    });
    setScheduleDialogOpen(true);
  };

  const handleSubmitAppointment = async () => {
    if (!formData.patientId || !formData.date || !formData.time) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const appointmentData = {
        patientId: formData.patientId,
        date: formData.date.toISOString().split('T')[0],
        time: formData.time.toTimeString().split(' ')[0].substring(0, 5),
        type: formData.type,
        symptoms: formData.symptoms,
        notes: formData.notes,
      };

      await api.post('/appointments', appointmentData);
      toast.success('Appointment scheduled successfully');
      setScheduleDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      toast.error('Failed to schedule appointment');
    }
  };

  const handleUpdateStatus = async (appointmentId: string, status: string) => {
    try {
      await api.put(`/appointments/${appointmentId}/status`, { status });
      toast.success(`Appointment ${status} successfully`);
      fetchData();
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Failed to update appointment status');
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      await api.put(`/appointments/${appointmentId}/cancel`);
      toast.success('Appointment cancelled successfully');
      fetchData();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Failed to cancel appointment');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTodayAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return appointments.filter(apt => apt.date === today);
  };

  const getUpcomingAppointments = () => {
    const today = new Date();
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate >= today && apt.status === 'scheduled';
    }).slice(0, 5);
  };

  if (!user) {
    return (
      <Container maxWidth="md">
        <Typography variant="h6" color="text.secondary">
          Please log in to manage appointments.
        </Typography>
      </Container>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Appointments Management
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleScheduleAppointment}
            >
              Schedule New Appointment
            </Button>
          </Box>

          {/* Today's Appointments Summary */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary">
                    Today's Appointments
                  </Typography>
                  <Typography variant="h4">
                    {getTodayAppointments().length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="success.main">
                    Completed Today
                  </Typography>
                  <Typography variant="h4">
                    {getTodayAppointments().filter(apt => apt.status === 'completed').length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="warning.main">
                    Pending
                  </Typography>
                  <Typography variant="h4">
                    {appointments.filter(apt => apt.status === 'scheduled').length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Appointments Table */}
          {loading ? (
            <Typography variant="body1" color="text.secondary">
              Loading appointments...
            </Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Patient</TableCell>
                    <TableCell>Date & Time</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {appointments.map((appointment) => (
                    <TableRow key={appointment._id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar
                            src={appointment.patientId.profileImage}
                            sx={{ width: 32, height: 32, mr: 2 }}
                          >
                            {appointment.patientId.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {appointment.patientId.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {appointment.patientId.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(appointment.date)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {appointment.time}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={appointment.type}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={appointment.status}
                          size="small"
                          color={getStatusColor(appointment.status) as any}
                          variant="filled"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleViewDetails(appointment)}
                          >
                            View
                          </Button>
                          {appointment.status === 'scheduled' && (
                            <>
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                startIcon={<CompleteIcon />}
                                onClick={() => handleUpdateStatus(appointment._id, 'completed')}
                              >
                                Complete
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                startIcon={<CancelIcon />}
                                onClick={() => handleCancelAppointment(appointment._id)}
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Appointment Details Dialog */}
          <Dialog
            open={detailDialogOpen}
            onClose={() => setDetailDialogOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              Appointment Details
              {selectedAppointment && (
                <Typography variant="body2" color="text.secondary">
                  {selectedAppointment.patientId.name} - {formatDate(selectedAppointment.date)}
                </Typography>
              )}
            </DialogTitle>
            <DialogContent>
              {selectedAppointment && (
                <Box sx={{ pt: 2 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Patient Name"
                        value={selectedAppointment.patientId.name}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Patient Email"
                        value={selectedAppointment.patientId.email}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Date"
                        value={formatDate(selectedAppointment.date)}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Time"
                        value={selectedAppointment.time}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Type"
                        value={selectedAppointment.type}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Status"
                        value={selectedAppointment.status}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    {selectedAppointment.symptoms && (
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          label="Symptoms"
                          value={selectedAppointment.symptoms}
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>
                    )}
                    {selectedAppointment.diagnosis && (
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          label="Diagnosis"
                          value={selectedAppointment.diagnosis}
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>
                    )}
                    {selectedAppointment.notes && (
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          label="Notes"
                          value={selectedAppointment.notes}
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
            </DialogActions>
          </Dialog>

          {/* Schedule Appointment Dialog */}
          <Dialog
            open={scheduleDialogOpen}
            onClose={() => setScheduleDialogOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>Schedule New Appointment</DialogTitle>
            <DialogContent>
              <Box sx={{ pt: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Patient</InputLabel>
                      <Select
                        value={formData.patientId}
                        label="Patient"
                        onChange={(e) => setFormData(prev => ({ ...prev, patientId: e.target.value }))}
                      >
                        {patients.map((patient) => (
                          <MenuItem key={patient._id} value={patient._id}>
                            {patient.name} - {patient.email}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Appointment Type</InputLabel>
                      <Select
                        value={formData.type}
                        label="Appointment Type"
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      >
                        <MenuItem value="consultation">Consultation</MenuItem>
                        <MenuItem value="follow-up">Follow-up</MenuItem>
                        <MenuItem value="emergency">Emergency</MenuItem>
                        <MenuItem value="check-up">Check-up</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="Date"
                      value={formData.date}
                      onChange={(newValue) => setFormData(prev => ({ ...prev, date: newValue }))}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TimePicker
                      label="Time"
                      value={formData.time}
                      onChange={(newValue) => setFormData(prev => ({ ...prev, time: newValue }))}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Symptoms (Optional)"
                      value={formData.symptoms}
                      onChange={(e) => setFormData(prev => ({ ...prev, symptoms: e.target.value }))}
                      placeholder="Describe the patient's symptoms..."
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Notes (Optional)"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional notes..."
                    />
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
              <Button
                onClick={handleSubmitAppointment}
                variant="contained"
                disabled={!formData.patientId || !formData.date || !formData.time}
              >
                Schedule Appointment
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Container>
    </LocalizationProvider>
  );
};

export default AppointmentsManagement;
