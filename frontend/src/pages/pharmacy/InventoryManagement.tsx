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
  Alert,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import api from '../../services/api';
import { toast } from 'react-toastify';

interface Medicine {
  _id: string;
  name: string;
  genericName?: string;
  category: string;
  manufacturer: string;
  batchNumber: string;
  expiryDate: string;
  stockQuantity: number;
  minStockLevel: number;
  unitPrice: number;
  sellingPrice: number;
  description?: string;
  requiresPrescription: boolean;
  status: 'active' | 'expired' | 'out_of_stock';
}

interface MedicineFormData {
  name: string;
  genericName: string;
  category: string;
  manufacturer: string;
  batchNumber: string;
  expiryDate: string;
  stockQuantity: number;
  minStockLevel: number;
  unitPrice: number;
  sellingPrice: number;
  description: string;
  requiresPrescription: boolean;
}

const InventoryManagement: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<MedicineFormData>({
    name: '',
    genericName: '',
    category: '',
    manufacturer: '',
    batchNumber: '',
    expiryDate: '',
    stockQuantity: 0,
    minStockLevel: 10,
    unitPrice: 0,
    sellingPrice: 0,
    description: '',
    requiresPrescription: true,
  });

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const response = await api.get('/pharmacy/medicines');
      setMedicines(response.data);
    } catch (error) {
      console.error('Error fetching medicines:', error);
      toast.error('Failed to load medicines');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (medicine: Medicine) => {
    if (medicine.stockQuantity === 0) return 'error';
    if (medicine.stockQuantity <= medicine.minStockLevel) return 'warning';
    if (new Date(medicine.expiryDate) < new Date()) return 'error';
    return 'success';
  };

  const getStatusText = (medicine: Medicine) => {
    if (medicine.stockQuantity === 0) return 'Out of Stock';
    if (medicine.stockQuantity <= medicine.minStockLevel) return 'Low Stock';
    if (new Date(medicine.expiryDate) < new Date()) return 'Expired';
    return 'In Stock';
  };

  const handleViewDetails = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setDetailDialogOpen(true);
  };

  const handleCreateMedicine = () => {
    setFormData({
      name: '',
      genericName: '',
      category: '',
      manufacturer: '',
      batchNumber: '',
      expiryDate: '',
      stockQuantity: 0,
      minStockLevel: 10,
      unitPrice: 0,
      sellingPrice: 0,
      description: '',
      requiresPrescription: true,
    });
    setCreateDialogOpen(true);
  };

  const handleEditMedicine = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setFormData({
      name: medicine.name,
      genericName: medicine.genericName || '',
      category: medicine.category,
      manufacturer: medicine.manufacturer,
      batchNumber: medicine.batchNumber,
      expiryDate: medicine.expiryDate.split('T')[0],
      stockQuantity: medicine.stockQuantity,
      minStockLevel: medicine.minStockLevel,
      unitPrice: medicine.unitPrice,
      sellingPrice: medicine.sellingPrice,
      description: medicine.description || '',
      requiresPrescription: medicine.requiresPrescription,
    });
    setEditDialogOpen(true);
  };

  const handleSubmitMedicine = async () => {
    if (!formData.name || !formData.category || !formData.manufacturer || !formData.expiryDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (createDialogOpen) {
        await api.post('/pharmacy/medicines', formData);
        toast.success('Medicine added successfully');
      } else if (editDialogOpen && selectedMedicine) {
        await api.put(`/pharmacy/medicines/${selectedMedicine._id}`, formData);
        toast.success('Medicine updated successfully');
      }

      setCreateDialogOpen(false);
      setEditDialogOpen(false);
      fetchMedicines();
    } catch (error) {
      console.error('Error saving medicine:', error);
      toast.error('Failed to save medicine');
    }
  };

  const handleDeleteMedicine = async (medicineId: string) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        await api.delete(`/pharmacy/medicines/${medicineId}`);
        toast.success('Medicine deleted successfully');
        fetchMedicines();
      } catch (error) {
        console.error('Error deleting medicine:', error);
        toast.error('Failed to delete medicine');
      }
    }
  };

  const handleUpdateStock = async (medicineId: string, newQuantity: number) => {
    try {
      await api.put(`/pharmacy/medicines/${medicineId}/stock`, { stockQuantity: newQuantity });
      toast.success('Stock updated successfully');
      fetchMedicines();
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('Failed to update stock');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getLowStockMedicines = () => {
    return medicines.filter(med => med.stockQuantity <= med.minStockLevel);
  };

  const getExpiredMedicines = () => {
    return medicines.filter(med => new Date(med.expiryDate) < new Date());
  };

  const getOutOfStockMedicines = () => {
    return medicines.filter(med => med.stockQuantity === 0);
  };

  if (!user) {
    return (
      <Container maxWidth="md">
        <Typography variant="h6" color="text.secondary">
          Please log in to manage inventory.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Inventory Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateMedicine}
          >
            Add Medicine
          </Button>
        </Box>

        {/* Alerts */}
        {getLowStockMedicines().length > 0 && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            ⚠️ {getLowStockMedicines().length} medicines are running low on stock
          </Alert>
        )}

        {getExpiredMedicines().length > 0 && (
          <Alert severity="error" sx={{ mb: 3 }}>
            🚨 {getExpiredMedicines().length} medicines have expired
          </Alert>
        )}

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary">
                  Total Medicines
                </Typography>
                <Typography variant="h4">
                  {medicines.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="warning.main">
                  Low Stock
                </Typography>
                <Typography variant="h4">
                  {getLowStockMedicines().length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="error.main">
                  Out of Stock
                </Typography>
                <Typography variant="h4">
                  {getOutOfStockMedicines().length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="error.main">
                  Expired
                </Typography>
                <Typography variant="h4">
                  {getExpiredMedicines().length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Medicines Table */}
        {loading ? (
          <Typography variant="body1" color="text.secondary">
            Loading medicines...
          </Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Medicine</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Expiry Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {medicines.map((medicine) => (
                  <TableRow key={medicine._id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {medicine.name}
                        </Typography>
                        {medicine.genericName && (
                          <Typography variant="caption" color="text.secondary">
                            {medicine.genericName}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary">
                          {medicine.manufacturer}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={medicine.category}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {medicine.stockQuantity} units
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Min: {medicine.minStockLevel}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(medicine.expiryDate)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(medicine)}
                        size="small"
                        color={getStatusColor(medicine) as any}
                        variant="filled"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleViewDetails(medicine)}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleEditMedicine(medicine)}
                        >
                          Edit
                        </Button>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteMedicine(medicine._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Medicine Details Dialog */}
        <Dialog
          open={detailDialogOpen}
          onClose={() => setDetailDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Medicine Details
            {selectedMedicine && (
              <Typography variant="body2" color="text.secondary">
                {selectedMedicine.name}
              </Typography>
            )}
          </DialogTitle>
          <DialogContent>
            {selectedMedicine && (
              <Box sx={{ pt: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Medicine Name"
                      value={selectedMedicine.name}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Generic Name"
                      value={selectedMedicine.genericName || 'N/A'}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Category"
                      value={selectedMedicine.category}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Manufacturer"
                      value={selectedMedicine.manufacturer}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Batch Number"
                      value={selectedMedicine.batchNumber}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Expiry Date"
                      value={formatDate(selectedMedicine.expiryDate)}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Stock Quantity"
                      value={selectedMedicine.stockQuantity}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Minimum Stock Level"
                      value={selectedMedicine.minStockLevel}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Unit Price"
                      value={`$${selectedMedicine.unitPrice.toFixed(2)}`}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Selling Price"
                      value={`$${selectedMedicine.sellingPrice.toFixed(2)}`}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Description"
                      value={selectedMedicine.description || 'No description available'}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Requires Prescription"
                      value={selectedMedicine.requiresPrescription ? 'Yes' : 'No'}
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

        {/* Create/Edit Medicine Dialog */}
        <Dialog
          open={createDialogOpen || editDialogOpen}
          onClose={() => {
            setCreateDialogOpen(false);
            setEditDialogOpen(false);
          }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {createDialogOpen ? 'Add New Medicine' : 'Edit Medicine'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Medicine Name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Generic Name"
                    value={formData.genericName}
                    onChange={(e) => setFormData(prev => ({ ...prev, genericName: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={formData.category}
                      label="Category"
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    >
                      <MenuItem value="analgesics">Analgesics</MenuItem>
                      <MenuItem value="antibiotics">Antibiotics</MenuItem>
                      <MenuItem value="antihistamines">Antihistamines</MenuItem>
                      <MenuItem value="cardiovascular">Cardiovascular</MenuItem>
                      <MenuItem value="dermatological">Dermatological</MenuItem>
                      <MenuItem value="gastrointestinal">Gastrointestinal</MenuItem>
                      <MenuItem value="respiratory">Respiratory</MenuItem>
                      <MenuItem value="vitamins">Vitamins & Supplements</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Manufacturer"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData(prev => ({ ...prev, manufacturer: e.target.value }))}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Batch Number"
                    value={formData.batchNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, batchNumber: e.target.value }))}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Expiry Date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Stock Quantity"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, stockQuantity: parseInt(e.target.value) || 0 }))}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Minimum Stock Level"
                    value={formData.minStockLevel}
                    onChange={(e) => setFormData(prev => ({ ...prev, minStockLevel: parseInt(e.target.value) || 10 }))}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Unit Price ($)"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
                    inputProps={{ step: "0.01" }}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Selling Price ($)"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, sellingPrice: parseFloat(e.target.value) || 0 }))}
                    inputProps={{ step: "0.01" }}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Requires Prescription</InputLabel>
                    <Select
                      value={formData.requiresPrescription}
                      label="Requires Prescription"
                      onChange={(e) => setFormData(prev => ({ ...prev, requiresPrescription: e.target.value === 'true' }))}
                    >
                      <MenuItem value="true">Yes</MenuItem>
                      <MenuItem value="false">No</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setCreateDialogOpen(false);
              setEditDialogOpen(false);
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitMedicine}
              variant="contained"
              disabled={!formData.name || !formData.category || !formData.manufacturer || !formData.expiryDate}
            >
              {createDialogOpen ? 'Add Medicine' : 'Update Medicine'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default InventoryManagement;
