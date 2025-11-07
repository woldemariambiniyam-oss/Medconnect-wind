import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Receipt as PrescriptionIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import api from '../../services/api';
import { toast } from 'react-toastify';

interface Prescription {
  _id: string;
  doctorId: {
    _id: string;
    name: string;
    specialty: string;
    profileImage?: string;
  };
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

const PrescriptionsList: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const response = await api.get('/prescriptions');
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

  const handleDownloadPrescription = async (prescriptionId: string) => {
    try {
      const response = await api.get(`/prescriptions/${prescriptionId}/download`, {
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `prescription-${prescriptionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('Prescription downloaded successfully');
    } catch (error) {
      console.error('Error downloading prescription:', error);
      toast.error('Failed to download prescription');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!user) {
    return (
      <Container maxWidth="md">
        <Typography variant="h6" color="text.secondary">
          Please log in to view your prescriptions.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Prescriptions
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          View and manage your medical prescriptions
        </Typography>

        {loading ? (
          <Typography variant="body1" color="text.secondary">
            Loading prescriptions...
          </Typography>
        ) : prescriptions.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <PrescriptionIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No prescriptions yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your prescriptions will appear here after doctor consultations.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {prescriptions.map((prescription) => (
              <Grid item xs={12} md={6} lg={4} key={prescription._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        src={prescription.doctorId.profileImage}
                        sx={{ width: 50, height: 50, mr: 2 }}
                      >
                        {prescription.doctorId.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" component="h2">
                          Dr. {prescription.doctorId.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {prescription.doctorId.specialty}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CalendarIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          Issued: {formatDate(prescription.issuedDate)}
                        </Typography>
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <strong>Diagnosis:</strong> {prescription.diagnosis}
                      </Typography>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <strong>Medicines:</strong> {prescription.medicines.length} item(s)
                      </Typography>
                    </Box>

                    <Chip
                      label={prescription.status}
                      size="small"
                      color={getStatusColor(prescription.status) as any}
                      variant="filled"
                    />
                  </CardContent>

                  <CardContent sx={{ pt: 0 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<ViewIcon />}
                        onClick={() => handleViewDetails(prescription)}
                      >
                        View Details
                      </Button>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleDownloadPrescription(prescription._id)}
                      >
                        Download
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
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
                Issued by Dr. {selectedPrescription.doctorId.name} on {formatDate(selectedPrescription.issuedDate)}
              </Typography>
            )}
          </DialogTitle>
          <DialogContent>
            {selectedPrescription && (
              <Box sx={{ pt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Diagnosis
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  {selectedPrescription.diagnosis}
                </Typography>

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

                {selectedPrescription.notes && (
                  <>
                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                      Additional Notes
                    </Typography>
                    <Typography variant="body1">
                      {selectedPrescription.notes}
                    </Typography>
                  </>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
            {selectedPrescription && (
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={() => handleDownloadPrescription(selectedPrescription._id)}
              >
                Download PDF
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default PrescriptionsList;
