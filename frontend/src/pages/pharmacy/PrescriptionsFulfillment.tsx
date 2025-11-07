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
  Alert,
} from '@mui/material';
import {
  Receipt as PrescriptionIcon,
  CheckCircle as FulfillIcon,
  Cancel as RejectIcon,
  Person as PersonIcon,
  LocalShipping as DeliverIcon,
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
  doctorId: {
    _id: string;
    name: string;
    specialization: string;
  };
  medicines: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
    quantity: number;
    available: boolean;
  }>;
  diagnosis: string;
  notes?: string;
  issuedDate: string;
  status: 'pending' | 'approved' | 'fulfilled' | 'rejected' | 'partially_fulfilled';
  totalCost: number;
  fulfilledDate?: string;
}

const PrescriptionsFulfillment: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [fulfillDialogOpen, setFulfillDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const response = await api.get('/pharmacy/prescriptions');
      setPrescriptions(response.data);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      toast.error('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'info';
      case 'fulfilled':
        return 'success';
      case 'rejected':
        return 'error';
      case 'partially_fulfilled':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleViewDetails = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setDetailDialogOpen(true);
  };

  const handleApprovePrescription = async (prescriptionId: string) => {
    try {
      await api.put(`/pharmacy/prescriptions/${prescriptionId}/approve`);
      toast.success('Prescription approved successfully');
      fetchPrescriptions();
    } catch (error) {
      console.error('Error approving prescription:', error);
      toast.error('Failed to approve prescription');
    }
  };

  const handleRejectPrescription = async (prescriptionId: string) => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      await api.put(`/pharmacy/prescriptions/${prescriptionId}/reject`, { reason: rejectReason });
      toast.success('Prescription rejected');
      setFulfillDialogOpen(false);
      setRejectReason('');
      fetchPrescriptions();
    } catch (error) {
      console.error('Error rejecting prescription:', error);
      toast.error('Failed to reject prescription');
    }
  };

  const handleFulfillPrescription = async (prescriptionId: string) => {
    try {
      await api.put(`/pharmacy/prescriptions/${prescriptionId}/fulfill`);
      toast.success('Prescription fulfilled successfully');
      fetchPrescriptions();
    } catch (error) {
      console.error('Error fulfilling prescription:', error);
      toast.error('Failed to fulfill prescription');
    }
  };

  const handlePartialFulfill = (prescriptionId: string) => {
    // This would open a dialog to select which medicines to fulfill
    toast.info('Partial fulfillment feature coming soon');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPendingPrescriptions = () => {
    return prescriptions.filter(p => p.status === 'pending');
  };

  const getApprovedPrescriptions = () => {
    return prescriptions.filter(p => p.status === 'approved');
  };

  const getFulfilledToday = () => {
    const today = new Date().toDateString();
    return prescriptions.filter(p =>
      p.status === 'fulfilled' &&
      p.fulfilledDate &&
      new Date(p.fulfilledDate).toDateString() === today
    );
  };

  const checkMedicineAvailability = (medicines: Prescription['medicines']) => {
    return medicines.every(med => med.available);
  };

  if (!user) {
    return (
      <Container maxWidth="md">
        <Typography variant="h6" color="text.secondary">
          Please log in to manage prescription fulfillment.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Prescription Fulfillment
          </Typography>
        </Box>

        {/* Alerts */}
        {getPendingPrescriptions().length > 0 && (
          <Alert severity="info" sx={{ mb: 3 }}>
            📋 You have {getPendingPrescriptions().length} prescriptions waiting for review
          </Alert>
        )}

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="warning.main">
                  Pending Review
                </Typography>
                <Typography variant="h4">
                  {getPendingPrescriptions().length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="info.main">
                  Approved
                </Typography>
                <Typography variant="h4">
                  {getApprovedPrescriptions().length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="success.main">
                  Fulfilled Today
                </Typography>
                <Typography variant="h4">
                  {getFulfilledToday().length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary">
                  Total Revenue Today
                </Typography>
                <Typography variant="h4">
                  ${getFulfilledToday().reduce((sum, p) => sum + p.totalCost, 0).toFixed(2)}
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
                  <TableCell>Doctor</TableCell>
                  <TableCell>Medicines</TableCell>
                  <TableCell>Issued Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Total Cost</TableCell>
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
                      <Typography variant="body2" fontWeight="bold">
                        Dr. {prescription.doctorId.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {prescription.doctorId.specialization}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {prescription.medicines.length} medicine(s)
                      </Typography>
                      {!checkMedicineAvailability(prescription.medicines) && (
                        <Typography variant="caption" color="error">
                          Some medicines unavailable
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(prescription.issuedDate)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={prescription.status.replace('_', ' ')}
                        size="small"
                        color={getStatusColor(prescription.status) as any}
                        variant="filled"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        ${prescription.totalCost.toFixed(2)}
                      </Typography>
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
                        {prescription.status === 'pending' && (
                          <>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              startIcon={<FulfillIcon />}
                              onClick={() => handleApprovePrescription(prescription._id)}
                              disabled={!checkMedicineAvailability(prescription.medicines)}
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<RejectIcon />}
                              onClick={() => {
                                setSelectedPrescription(prescription);
                                setFulfillDialogOpen(true);
                              }}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {prescription.status === 'approved' && (
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            startIcon={<DeliverIcon />}
                            onClick={() => handleFulfillPrescription(prescription._id)}
                          >
                            Fulfill
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
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Doctor"
                      value={`Dr. ${selectedPrescription.doctorId.name}`}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Specialization"
                      value={selectedPrescription.doctorId.specialization}
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
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Typography variant="subtitle1" fontWeight="bold">
                                    {medicine.name}
                                  </Typography>
                                  <Chip
                                    label={medicine.available ? 'Available' : 'Unavailable'}
                                    size="small"
                                    color={medicine.available ? 'success' : 'error'}
                                    variant="outlined"
                                  />
                                </Box>
                              }
                              secondary={
                                <Box>
                                  <Typography variant="body2">
                                    <strong>Dosage:</strong> {medicine.dosage} | <strong>Quantity:</strong> {medicine.quantity}
                                  </Typography>
                                  <Typography variant="body2">
                                    <strong>Frequency:</strong> {medicine.frequency} | <strong>Duration:</strong> {medicine.duration}
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

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Total Cost"
                      value={`$${selectedPrescription.totalCost.toFixed(2)}`}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Status"
                      value={selectedPrescription.status.replace('_', ' ')}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Reject Prescription Dialog */}
        <Dialog
          open={fulfillDialogOpen}
          onClose={() => setFulfillDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Reject Prescription</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Typography variant="body1" gutterBottom>
                Please provide a reason for rejecting this prescription:
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Reason for Rejection"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g., Medicine not available, invalid prescription, etc."
                required
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFulfillDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={() => selectedPrescription && handleRejectPrescription(selectedPrescription._id)}
              variant="contained"
              color="error"
              disabled={!rejectReason.trim()}
            >
              Reject Prescription
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default PrescriptionsFulfillment;
