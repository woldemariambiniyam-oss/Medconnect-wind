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
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  VerifiedUser as VerifiedIcon,
  Pending as PendingIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Description as DocumentIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import api from '../../services/api';
import { toast } from 'react-toastify';

interface VerificationRequest {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    profileImage?: string;
  };
  entityType: 'doctor' | 'pharmacy' | 'efda';
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  documents: Array<{
    type: string;
    filename: string;
    url: string;
    uploadedAt: string;
  }>;
  additionalInfo: {
    specialization?: string;
    licenseNumber?: string;
    experience?: string;
    pharmacyName?: string;
    address?: string;
    businessLicense?: string;
    operatingHours?: string;
  };
  rejectionReason?: string;
}

const VerificationPanel: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchVerificationRequests();
  }, []);

  const fetchVerificationRequests = async () => {
    try {
      const response = await api.get('/admin/verifications');
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching verification requests:', error);
      toast.error('Failed to load verification requests');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getEntityTypeColor = (entityType: string) => {
    switch (entityType) {
      case 'doctor':
        return 'primary';
      case 'pharmacy':
        return 'secondary';
      case 'efda':
        return 'info';
      default:
        return 'default';
    }
  };

  const handleViewDetails = (request: VerificationRequest) => {
    setSelectedRequest(request);
    setDetailDialogOpen(true);
  };

  const handleReviewRequest = (request: VerificationRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setReviewAction(action);
    setRejectionReason('');
    setReviewDialogOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedRequest) return;

    if (reviewAction === 'reject' && !rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      const reviewData = {
        status: reviewAction,
        ...(reviewAction === 'reject' && { rejectionReason }),
      };

      await api.put(`/admin/verifications/${selectedRequest._id}`, reviewData);
      toast.success(`Verification request ${reviewAction}d successfully`);
      setReviewDialogOpen(false);
      fetchVerificationRequests();
    } catch (error) {
      console.error('Error reviewing verification request:', error);
      toast.error('Failed to review verification request');
    }
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

  const getPendingRequests = () => {
    return requests.filter(r => r.status === 'pending');
  };

  const getApprovedRequests = () => {
    return requests.filter(r => r.status === 'approved');
  };

  const getRejectedRequests = () => {
    return requests.filter(r => r.status === 'rejected');
  };

  const getRequestsByType = (entityType: string) => {
    return requests.filter(r => r.entityType === entityType);
  };

  if (!user) {
    return (
      <Container maxWidth="md">
        <Typography variant="h6" color="text.secondary">
          Please log in to manage verifications.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Verification Panel
          </Typography>
        </Box>

        {/* Alerts */}
        {getPendingRequests().length > 0 && (
          <Alert severity="info" sx={{ mb: 3 }}>
            📋 You have {getPendingRequests().length} verification requests pending review
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
                  {getPendingRequests().length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="success.main">
                  Approved
                </Typography>
                <Typography variant="h4">
                  {getApprovedRequests().length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="error.main">
                  Rejected
                </Typography>
                <Typography variant="h4">
                  {getRejectedRequests().length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary">
                  Doctor Applications
                </Typography>
                <Typography variant="h4">
                  {getRequestsByType('doctor').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Verification Requests Table */}
        {loading ? (
          <Typography variant="body1" color="text.secondary">
            Loading verification requests...
          </Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Applicant</TableCell>
                  <TableCell>Entity Type</TableCell>
                  <TableCell>Documents</TableCell>
                  <TableCell>Submitted</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          src={request.userId.profileImage}
                          sx={{ width: 40, height: 40, mr: 2 }}
                        >
                          {request.userId.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {request.userId.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {request.userId.email}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {request.userId.role}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={request.entityType.charAt(0).toUpperCase() + request.entityType.slice(1)}
                        size="small"
                        color={getEntityTypeColor(request.entityType) as any}
                        variant="filled"
                        icon={request.entityType === 'pharmacy' ? <BusinessIcon /> : <PersonIcon />}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {request.documents.length} document(s)
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(request.submittedAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        size="small"
                        color={getStatusColor(request.status) as any}
                        variant="filled"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleViewDetails(request)}
                        >
                          View
                        </Button>
                        {request.status === 'pending' && (
                          <>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              startIcon={<ApproveIcon />}
                              onClick={() => handleReviewRequest(request, 'approve')}
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<RejectIcon />}
                              onClick={() => handleReviewRequest(request, 'reject')}
                            >
                              Reject
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

        {/* Request Details Dialog */}
        <Dialog
          open={detailDialogOpen}
          onClose={() => setDetailDialogOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            Verification Request Details
            {selectedRequest && (
              <Typography variant="body2" color="text.secondary">
                {selectedRequest.userId.name} - {selectedRequest.entityType.charAt(0).toUpperCase() + selectedRequest.entityType.slice(1)}
              </Typography>
            )}
          </DialogTitle>
          <DialogContent>
            {selectedRequest && (
              <Box sx={{ pt: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Applicant Name"
                      value={selectedRequest.userId.name}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={selectedRequest.userId.email}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={selectedRequest.userId.phone}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Entity Type"
                      value={selectedRequest.entityType.charAt(0).toUpperCase() + selectedRequest.entityType.slice(1)}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Status"
                      value={selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Submitted At"
                      value={formatDate(selectedRequest.submittedAt)}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>

                  {/* Entity-specific information */}
                  {selectedRequest.entityType === 'doctor' && (
                    <>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Specialization"
                          value={selectedRequest.additionalInfo.specialization || 'Not provided'}
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="License Number"
                          value={selectedRequest.additionalInfo.licenseNumber || 'Not provided'}
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Experience"
                          value={selectedRequest.additionalInfo.experience || 'Not provided'}
                          InputProps={{ readOnly: true }}
                          multiline
                          rows={2}
                        />
                      </Grid>
                    </>
                  )}

                  {selectedRequest.entityType === 'pharmacy' && (
                    <>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Pharmacy Name"
                          value={selectedRequest.additionalInfo.pharmacyName || 'Not provided'}
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Address"
                          value={selectedRequest.additionalInfo.address || 'Not provided'}
                          InputProps={{ readOnly: true }}
                          multiline
                          rows={2}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Business License"
                          value={selectedRequest.additionalInfo.businessLicense || 'Not provided'}
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Operating Hours"
                          value={selectedRequest.additionalInfo.operatingHours || 'Not provided'}
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>
                    </>
                  )}

                  {/* Documents */}
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Submitted Documents
                    </Typography>
                    <List>
                      {selectedRequest.documents.map((doc, index) => (
                        <React.Fragment key={index}>
                          <ListItem>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <DocumentIcon />
                                  <Typography variant="subtitle2">
                                    {doc.type}: {doc.filename}
                                  </Typography>
                                </Box>
                              }
                              secondary={`Uploaded on ${formatDate(doc.uploadedAt)}`}
                            />
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => window.open(doc.url, '_blank')}
                            >
                              View Document
                            </Button>
                          </ListItem>
                          {index < selectedRequest.documents.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </Grid>

                  {selectedRequest.rejectionReason && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Rejection Reason"
                        value={selectedRequest.rejectionReason}
                        InputProps={{ readOnly: true }}
                        multiline
                        rows={2}
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

        {/* Review Dialog */}
        <Dialog
          open={reviewDialogOpen}
          onClose={() => setReviewDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {reviewAction === 'approve' ? 'Approve' : 'Reject'} Verification Request
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Typography variant="body1" gutterBottom>
                Are you sure you want to {reviewAction} this verification request?
                {selectedRequest && (
                  <strong> {selectedRequest.userId.name} - {selectedRequest.entityType}</strong>
                )}
              </Typography>

              {reviewAction === 'reject' && (
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Reason for Rejection"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a detailed reason for rejection..."
                  required
                  sx={{ mt: 2 }}
                />
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSubmitReview}
              variant="contained"
              color={reviewAction === 'approve' ? 'success' : 'error'}
              disabled={reviewAction === 'reject' && !rejectionReason.trim()}
            >
              {reviewAction === 'approve' ? 'Approve' : 'Reject'} Request
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default VerificationPanel;
