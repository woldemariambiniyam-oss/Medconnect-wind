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
} from '@mui/material';
import {
  LocalPharmacy as PharmacyIcon,
  Inventory as InventoryIcon,
  Receipt as PrescriptionIcon,
  ShoppingCart as OrderIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import api from '../services/api';

interface PharmacyStats {
  totalMedicines: number;
  lowStockItems: number;
  pendingPrescriptions: number;
  todayOrders: number;
}

interface PendingPrescription {
  _id: string;
  patientName: string;
  doctorName: string;
  medicines: string[];
  status: 'pending' | 'ready' | 'completed';
  createdAt: string;
}

const PharmacyDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [stats, setStats] = useState<PharmacyStats>({
    totalMedicines: 0,
    lowStockItems: 0,
    pendingPrescriptions: 0,
    todayOrders: 0,
  });
  const [pendingPrescriptions, setPendingPrescriptions] = useState<PendingPrescription[]>([]);

  useEffect(() => {
    fetchPharmacyData();
  }, []);

  const fetchPharmacyData = async () => {
    try {
      const [statsResponse, prescriptionsResponse] = await Promise.all([
        api.get('/pharmacy/stats'),
        api.get('/pharmacy/pending-prescriptions'),
      ]);

      setStats(statsResponse.data);
      setPendingPrescriptions(prescriptionsResponse.data);
    } catch (error) {
      console.error('Error fetching pharmacy data:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'ready':
        return 'success';
      case 'completed':
        return 'default';
      default:
        return 'default';
    }
  };

  const handleFulfillPrescription = async (prescriptionId: string) => {
    try {
      await api.put(`/pharmacy/prescriptions/${prescriptionId}/fulfill`);
      // Refresh data
      fetchPharmacyData();
    } catch (error) {
      console.error('Error fulfilling prescription:', error);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Pharmacy Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Welcome back, {user?.name}
        </Typography>

        {/* Low Stock Alert */}
        {stats.lowStockItems > 0 && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            ⚠️ {stats.lowStockItems} medicines are running low on stock. Please restock soon.
          </Alert>
        )}

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <InventoryIcon color="primary" sx={{ mr: 1 }} />
                  <Box>
                    <Typography variant="h6">{stats.totalMedicines}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Medicines
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
                  <InventoryIcon color="error" sx={{ mr: 1 }} />
                  <Box>
                    <Typography variant="h6">{stats.lowStockItems}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Low Stock Items
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
                  <PrescriptionIcon color="warning" sx={{ mr: 1 }} />
                  <Box>
                    <Typography variant="h6">{stats.pendingPrescriptions}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending Prescriptions
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
                  <OrderIcon color="success" sx={{ mr: 1 }} />
                  <Box>
                    <Typography variant="h6">{stats.todayOrders}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Today's Orders
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Pending Prescriptions */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Pending Prescriptions
              </Typography>
              <List>
                {pendingPrescriptions.length > 0 ? (
                  pendingPrescriptions.map((prescription) => (
                    <ListItem key={prescription._id} divider>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ width: 32, height: 32 }}>
                              {prescription.patientName.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1">
                                {prescription.patientName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Dr. {prescription.doctorName}
                              </Typography>
                            </Box>
                            <Chip
                              label={prescription.status}
                              size="small"
                              color={getStatusColor(prescription.status) as any}
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              Medicines: {prescription.medicines.join(', ')}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(prescription.createdAt).toLocaleDateString()}
                              </Typography>
                              {prescription.status === 'pending' && (
                                <Button
                                  size="small"
                                  variant="contained"
                                  onClick={() => handleFulfillPrescription(prescription._id)}
                                >
                                  Fulfill
                                </Button>
                              )}
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText
                      primary="No pending prescriptions"
                      secondary="All prescriptions have been fulfilled"
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
                  Add New Medicine
                </Button>
                <Button variant="outlined" fullWidth>
                  Update Inventory
                </Button>
                <Button variant="outlined" fullWidth>
                  View Low Stock Items
                </Button>
                <Button variant="outlined" fullWidth>
                  Process Orders
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default PharmacyDashboard;
