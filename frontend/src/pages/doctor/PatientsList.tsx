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
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  MedicalServices as MedicalIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import api from '../../services/api';
import { toast } from 'react-toastify';

interface Patient {
  _id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  bloodType?: string;
  allergies?: string[];
  medicalHistory?: string[];
  lastVisit?: string;
  nextAppointment?: string;
  totalAppointments: number;
  profileImage?: string;
}

const PatientsList: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [patients, searchTerm]);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/doctors/patients');
      setPatients(response.data);
      setFilteredPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const filterPatients = () => {
    if (!searchTerm) {
      setFilteredPatients(patients);
      return;
    }

    const filtered = patients.filter(patient =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm)
    );
    setFilteredPatients(filtered);
  };

  const handleViewDetails = (patient: Patient) => {
    setSelectedPatient(patient);
    setDetailDialogOpen(true);
  };

  const handleScheduleAppointment = (patientId: string) => {
    // In a real app, this would navigate to appointment scheduling
    toast.info('Appointment scheduling would be implemented here');
  };

  const handleViewMedicalHistory = (patientId: string) => {
    // In a real app, this would open medical history view
    toast.info('Medical history view would be implemented here');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  if (!user) {
    return (
      <Container maxWidth="md">
        <Typography variant="h6" color="text.secondary">
          Please log in to view your patients.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Patients
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Manage your patient records and appointments
        </Typography>

        {/* Search */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <TextField
            fullWidth
            label="Search patients"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Paper>

        {/* Patients Table */}
        {loading ? (
          <Typography variant="body1" color="text.secondary">
            Loading patients...
          </Typography>
        ) : filteredPatients.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No patients found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? 'Try adjusting your search criteria' : 'Your patients will appear here'}
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Patient</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Age/Gender</TableCell>
                  <TableCell>Last Visit</TableCell>
                  <TableCell>Appointments</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow key={patient._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          src={patient.profileImage}
                          sx={{ width: 40, height: 40, mr: 2 }}
                        >
                          {patient.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight="bold">
                            {patient.name}
                          </Typography>
                          {patient.bloodType && (
                            <Chip
                              label={patient.bloodType}
                              size="small"
                              variant="outlined"
                              color="error"
                            />
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <EmailIcon sx={{ mr: 0.5, fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">{patient.email}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PhoneIcon sx={{ mr: 0.5, fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">{patient.phone}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {calculateAge(patient.dateOfBirth)} years
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {patient.gender}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {patient.lastVisit ? (
                        <Typography variant="body2">
                          {formatDate(patient.lastVisit)}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No visits yet
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {patient.totalAppointments}
                      </Typography>
                      {patient.nextAppointment && (
                        <Typography variant="caption" color="primary">
                          Next: {formatDate(patient.nextAppointment)}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleViewDetails(patient)}
                        >
                          Details
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleScheduleAppointment(patient._id)}
                        >
                          Schedule
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Patient Details Dialog */}
        <Dialog
          open={detailDialogOpen}
          onClose={() => setDetailDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Patient Details
            {selectedPatient && (
              <Typography variant="body2" color="text.secondary">
                {selectedPatient.name}
              </Typography>
            )}
          </DialogTitle>
          <DialogContent>
            {selectedPatient && (
              <Box sx={{ pt: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Avatar
                      src={selectedPatient.profileImage}
                      sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
                    >
                      {selectedPatient.name.charAt(0)}
                    </Avatar>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6">{selectedPatient.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {calculateAge(selectedPatient.dateOfBirth)} years • {selectedPatient.gender}
                      </Typography>
                      {selectedPatient.bloodType && (
                        <Chip
                          label={`Blood Type: ${selectedPatient.bloodType}`}
                          sx={{ mt: 1 }}
                          color="error"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={8}>
                    <Typography variant="h6" gutterBottom>
                      Contact Information
                    </Typography>
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">{selectedPatient.email}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">{selectedPatient.phone}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          DOB: {formatDate(selectedPatient.dateOfBirth)}
                        </Typography>
                      </Box>
                    </Box>

                    {selectedPatient.allergies && selectedPatient.allergies.length > 0 && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom color="error">
                          Allergies
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {selectedPatient.allergies.map((allergy, index) => (
                            <Chip
                              key={index}
                              label={allergy}
                              color="error"
                              variant="outlined"
                              size="small"
                            />
                          ))}
                        </Box>
                      </Box>
                    )}

                    {selectedPatient.medicalHistory && selectedPatient.medicalHistory.length > 0 && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                          Medical History
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {selectedPatient.medicalHistory.map((condition, index) => (
                            <Chip
                              key={index}
                              label={condition}
                              color="primary"
                              variant="outlined"
                              size="small"
                            />
                          ))}
                        </Box>
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                      <Button
                        variant="contained"
                        onClick={() => handleScheduleAppointment(selectedPatient._id)}
                      >
                        Schedule Appointment
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => handleViewMedicalHistory(selectedPatient._id)}
                      >
                        View Medical History
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default PatientsList;
