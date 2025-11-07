import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  Download as DownloadIcon,
  CreditCard as CardIcon,
  AccountBalance as BankIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import api from '../../services/api';
import { toast } from 'react-toastify';

interface Payment {
  _id: string;
  appointmentId?: {
    _id: string;
    doctorId: {
      name: string;
      specialty: string;
    };
    type: string;
    date: string;
  };
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'card' | 'bank_transfer' | 'cash' | 'insurance';
  description: string;
  transactionId?: string;
  createdAt: string;
  paidAt?: string;
}

const PaymentsList: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await api.get('/payments');
      setPayments(response.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      case 'refunded':
        return 'info';
      default:
        return 'default';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'card':
        return <CardIcon />;
      case 'bank_transfer':
        return <BankIcon />;
      case 'cash':
        return <PaymentIcon />;
      case 'insurance':
        return <ReceiptIcon />;
      default:
        return <PaymentIcon />;
    }
  };

  const handleDownloadReceipt = async (paymentId: string) => {
    try {
      const response = await api.get(`/payments/${paymentId}/receipt`, {
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('Receipt downloaded successfully');
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error('Failed to download receipt');
    }
  };

  const handleViewReceipt = (payment: Payment) => {
    setSelectedPayment(payment);
    setReceiptDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  if (!user) {
    return (
      <Container maxWidth="md">
        <Typography variant="h6" color="text.secondary">
          Please log in to view your payment history.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Payment History
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          View and manage your healthcare payments
        </Typography>

        {/* Payment Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PaymentIcon color="primary" sx={{ mr: 1 }} />
                  <Box>
                    <Typography variant="h6">
                      {formatCurrency(
                        payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
                        'USD'
                      )}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Paid
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
                  <ReceiptIcon color="warning" sx={{ mr: 1 }} />
                  <Box>
                    <Typography variant="h6">
                      {payments.filter(p => p.status === 'pending').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending Payments
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
                  <CardIcon color="success" sx={{ mr: 1 }} />
                  <Box>
                    <Typography variant="h6">
                      {payments.filter(p => p.paymentMethod === 'card').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Card Payments
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
                  <BankIcon color="info" sx={{ mr: 1 }} />
                  <Box>
                    <Typography variant="h6">
                      {payments.filter(p => p.status === 'refunded').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Refunds
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Payments Table */}
        {loading ? (
          <Typography variant="body1" color="text.secondary">
            Loading payment history...
          </Typography>
        ) : payments.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <PaymentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No payment history
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your payment transactions will appear here.
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment._id}>
                    <TableCell>
                      {formatDate(payment.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {payment.description}
                        </Typography>
                        {payment.appointmentId && (
                          <Typography variant="caption" color="text.secondary">
                            Dr. {payment.appointmentId.doctorId.name} - {payment.appointmentId.type}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(payment.amount, payment.currency)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getPaymentMethodIcon(payment.paymentMethod)}
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {payment.paymentMethod.replace('_', ' ')}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={payment.status}
                        size="small"
                        color={getStatusColor(payment.status) as any}
                        variant="filled"
                      />
                    </TableCell>
                    <TableCell>
                      {payment.status === 'completed' && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<ReceiptIcon />}
                            onClick={() => handleViewReceipt(payment)}
                          >
                            View
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={() => handleDownloadReceipt(payment._id)}
                          >
                            Download
                          </Button>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Receipt Dialog */}
        <Dialog
          open={receiptDialogOpen}
          onClose={() => setReceiptDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Payment Receipt</DialogTitle>
          <DialogContent>
            {selectedPayment && (
              <Box sx={{ pt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Transaction ID"
                      value={selectedPayment.transactionId || 'N/A'}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Amount"
                      value={formatCurrency(selectedPayment.amount, selectedPayment.currency)}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Status"
                      value={selectedPayment.status}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Payment Method"
                      value={selectedPayment.paymentMethod.replace('_', ' ')}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Date"
                      value={formatDate(selectedPayment.createdAt)}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Description"
                      value={selectedPayment.description}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReceiptDialogOpen(false)}>Close</Button>
            {selectedPayment && (
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={() => handleDownloadReceipt(selectedPayment._id)}
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

export default PaymentsList;
