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
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Receipt as PrescriptionIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import api from '../../services/api';
import { toast } from 'react-toastify';

interface Prescription {
  _id: string;
  patientId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    profileImage?: string;
  };
  appointmentId?: string;
  medicines: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }>;
  diagnosis: string;
  notes?: string;
  issuedDate: string;
  status: 'active' | 'completed' | 'cancelled';
}

interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface PrescriptionFormData {
  patientId: string;
  appointmentId?: string;
  diagnosis: string;
  notes: string;
  medicines: Medicine[];
}

const PrescriptionsManagement: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState<PrescriptionFormData>({
    patientId: '',
    appointmentId: '',
    diagnosis: '',
    notes: '',
    medicines: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prescriptionsResponse, patientsResponse, appointmentsResponse] = await Promise.all([
        api.get('/doctors/prescriptions'),
        api.get('/doctors/patients'),
        api.get('/doctors/appointments?status=completed'),
      ]);

      setPrescriptions(prescriptionsResponse.data);
      setPatients(patientsResponse.data);
      setAppointments(appointmentsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load prescriptions data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleViewDetails = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setDetailDialogOpen(true);
  };

  const handleCreatePrescription = () => {
    setFormData({
      patientId: '',
      appointmentId: '',
      diagnosis: '',
      notes: '',
      medicines: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    });
    setCreateDialogOpen(true);
  };

  const handleAddMedicine = () => {
    setFormData(prev => ({
      ...prev,
      medicines: [...prev.medicines, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    }));
  };

  const handleRemoveMedicine = (index: number) => {
    setFormData(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index),
    }));
  };

  const handleMedicineChange = (index: number, field: keyof Medicine, value: string) => {
    setFormData(prev => ({
      ...prev,
      medicines: prev.medicines.map((medicine, i) =>
        i === index ? { ...medicine, [field]: value } : medicine
      ),
    }));
  };

  const handleSubmitPrescription = async () => {
    if (!formData.patientId || !formData.diagnosis || formData.medicines.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate medicines
    const invalidMedicines = formData.medicines.filter(med => !med.name || !med.dosage || !med.frequency || !med.duration);
    if (invalidMedicines.length > 0) {
      toast.error('Please fill in all medicine details');
      return;
    }

    try {
      const prescriptionData = {
        patientId: formData.patientId,
        appointmentId: formData.appointmentId || undefined,
        diagnosis: formData.diagnosis,
        notes: formData.notes,
        medicines: formData.medicines,
      };

      await api.post('/prescriptions', prescriptionData);
      toast.success('Prescription created successfully');
      setCreateDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error creating prescription:', error);
      toast.error('Failed to create prescription');
    }
  };

  const handleUpdateStatus = async (prescriptionId: string, status: string) => {
    try {
      await api.put(`/prescriptions/${prescriptionId}/status`, { status });
      toast.success(`Prescription ${status} successfully`);
      fetchData();
    } catch (error) {
      console.error('Error updating prescription status:', error);
      toast.error('Failed to update prescription status');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!user) {
    return (
      <Container maxWidth="md">
        <Typography variant="h6" color="text.secondary">
          Please log in to manage prescriptions.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Prescriptions Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreatePrescription}
          >
            Write Prescription
          </Button>
        </Box>

        {/* Prescriptions Summary */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary">
                  Total Prescriptions
                </Typography>
                <Typography variant="h4">
                  {prescriptions.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="success.main">
                  Active Prescriptions
                </Typography>
                <Typography variant="h4">
                  {prescriptions.filter(p => p.status === 'active').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="warning.main">
                  This Month
                </Typography>
                <Typography variant="h4">
                  {prescriptions.filter(p => {
                    const thisMonth = new Date().getMonth();
                    const prescriptionMonth = new Date(p.issuedDate).getMonth();
                    return prescriptionMonth === thisMonth;
                  }).length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Prescriptions Table */}
        {loading ? (
          <Typography variant="body1" color="text.secondary">
            Loading prescriptions...
          </Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Patient</TableCell>
                  <TableCell>Diagnosis</TableCell>
                  <TableCell>Medicines</TableCell>
                  <TableCell>Issued Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {prescriptions.map((prescription) => (
                  <TableRow key={prescription._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          src={prescription.patientId.profileImage}
                          sx={{ width: 32, height: 32, mr: 2 }}
                        >
                          {prescription.patientId.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {prescription.patientId.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {prescription.patientId.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {prescription.diagnosis}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {prescription.medicines.length} medicine(s)
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(prescription.issuedDate)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={prescription.status}
                        size="small"
                        color={getStatusColor(prescription.status) as any}
                        variant="filled"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleViewDetails(prescription)}
                        >
                          View
                        </Button>
                        {prescription.status === 'active' && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            onClick={() => handleUpdateStatus(prescription._id, 'completed')}
                          >
                            Complete
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Prescription Details Dialog */}
        <Dialog
          open={detailDialogOpen}
          onClose={() => setDetailDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Prescription Details
            {selectedPrescription && (
              <Typography variant="body2" color="text.secondary">
                {selectedPrescription.patientId.name} - {formatDate(selectedPrescription.issuedDate)}
              </Typography>
            )}
          </DialogTitle>
          <DialogContent>
            {selectedPrescription && (
              <Box sx={{ pt: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Patient Name"
                      value={selectedPrescription.patientId.name}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Patient Email"
                      value={selectedPrescription.patientId.email}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Diagnosis"
                      value={selectedPrescription.diagnosis}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Prescribed Medicines
                    </Typography>
                    <List>
                      {selectedPrescription.medicines.map((medicine, index) => (
                        <React.Fragment key={index}>
                          <ListItem>
                            <ListItemText
                              primary={
                                <Typography variant="subtitle1" fontWeight="bold">
                                  {medicine.name}
                                </Typography>
                              }
                              secondary={
                                <Box>
                                  <Typography variant="body2">
                                    <strong>Dosage:</strong> {medicine.dosage}
                                  </Typography>
                                  <Typography variant="body2">
                                    <strong>Frequency:</strong> {medicine.frequency}
                                  </Typography>
                                  <Typography variant="body2">
                                    <strong>Duration:</strong> {medicine.duration}
                                  </Typography>
                                  {medicine.instructions && (
                                    <Typography variant="body2">
                                      <strong>Instructions:</strong> {medicine.instructions}
                                    </Typography>
                                  )}
                                </Box>
                              }
                            />
                          </ListItem>
                          {index < selectedPrescription.medicines.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </Grid>

                  {selectedPrescription.notes && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label="Additional Notes"
                        value={selectedPrescription.notes}
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

        {/* Create Prescription Dialog */}
        <Dialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>Write New Prescription</DialogTitle>
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
                    <InputLabel>Related Appointment (Optional)</InputLabel>
                    <Select
                      value={formData.appointmentId}
                      label="Related Appointment (Optional)"
                      onChange={(e) => setFormData(prev => ({ ...prev, appointmentId: e.target.value }))}
                    >
                      <MenuItem value="">None</MenuItem>
                      {appointments.map((appointment) => (
                        <MenuItem key={appointment._id} value={appointment._id}>
                          {appointment.patientId.name} - {appointment.date} {appointment.time}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Diagnosis"
                    value={formData.diagnosis}
                    onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
                    placeholder="Enter diagnosis..."
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Medicines
                  </Typography>
                  {formData.medicines.map((medicine, index) => (
                    <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Medicine Name"
                            value={medicine.name}
                            onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                            required
                          />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <TextField
                            fullWidth
                            label="Dosage"
                            value={medicine.dosage}
                            onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                            placeholder="e.g., 500mg"
                            required
                          />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <FormControl fullWidth>
                            <InputLabel>Frequency</InputLabel>
                            <Select
                              value={medicine.frequency}
                              label="Frequency"
                              onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                            >
                              <MenuItem value="once daily">Once daily</MenuItem>
                              <MenuItem value="twice daily">Twice daily</MenuItem>
                              <MenuItem value="three times daily">Three times daily</MenuItem>
                              <MenuItem value="four times daily">Four times daily</MenuItem>
                              <MenuItem value="as needed">As needed</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <TextField
                            fullWidth
                            label="Duration"
                            value={medicine.duration}
                            onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                            placeholder="e.g., 7 days"
                            required
                          />
                        </Grid>
                        <Grid item xs={12} md={8}>
                          <TextField
                            fullWidth
                            label="Instructions"
                            value={medicine.instructions}
                            onChange={(e) => handleMedicineChange(index, 'instructions', e.target.value)}
                            placeholder="e.g., Take with food"
                          />
                        </Grid>
                        <Grid item xs={12} md={1}>
                          <IconButton
                            color="error"
                            onClick={() => handleRemoveMedicine(index)}
                            disabled={formData.medicines.length === 1}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleAddMedicine}
                    sx={{ mb: 2 }}
                  >
                    Add Another Medicine
                  </Button>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Additional Notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional instructions or notes..."
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSubmitPrescription}
              variant="contained"
              disabled={!formData.patientId || !formData.diagnosis || formData.medicines.length === 0}
            >
              Create Prescription
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default PrescriptionsManagement;
