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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Alert,
} from '@mui/material';
import {
  BugReport as ErrorIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Security as SecurityIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import api from '../../services/api';
import { toast } from 'react-toastify';

interface SystemLog {
  _id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info' | 'debug' | 'security';
  category: 'auth' | 'api' | 'database' | 'payment' | 'system' | 'user_action';
  message: string;
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

const SystemLogs: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    level: '',
    category: '',
    dateFrom: '',
    dateTo: '',
    search: '',
  });

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const fetchLogs = async () => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await api.get(`/admin/logs?${queryParams.toString()}`);
      setLogs(response.data);
    } catch (error) {
      console.error('Error fetching system logs:', error);
      toast.error('Failed to load system logs');
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      case 'debug':
        return 'default';
      case 'security':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <ErrorIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'info':
        return <InfoIcon />;
      case 'security':
        return <SecurityIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'auth':
        return 'primary';
      case 'api':
        return 'secondary';
      case 'database':
        return 'warning';
      case 'payment':
        return 'success';
      case 'system':
        return 'error';
      case 'user_action':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      level: '',
      category: '',
      dateFrom: '',
      dateTo: '',
      search: '',
    });
  };

  const getLogsByLevel = (level: string) => {
    return logs.filter(log => log.level === level);
  };

  const getRecentErrors = () => {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return logs.filter(log =>
      log.level === 'error' &&
      new Date(log.timestamp) > last24Hours
    );
  };

  const getSecurityEvents = () => {
    return logs.filter(log => log.level === 'security');
  };

  if (!user) {
    return (
      <Container maxWidth="md">
        <Typography variant="h6" color="text.secondary">
          Please log in to view system logs.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            System Logs
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchLogs}
          >
            Refresh
          </Button>
        </Box>

        {/* Alerts */}
        {getRecentErrors().length > 0 && (
          <Alert severity="error" sx={{ mb: 3 }}>
            🚨 {getRecentErrors().length} errors in the last 24 hours
          </Alert>
        )}

        {getSecurityEvents().length > 0 && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            🔒 {getSecurityEvents().length} security events detected
          </Alert>
        )}

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="error.main">
                  Errors
                </Typography>
                <Typography variant="h4">
                  {getLogsByLevel('error').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="warning.main">
                  Warnings
                </Typography>
                <Typography variant="h4">
                  {getLogsByLevel('warning').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="info.main">
                  Info
                </Typography>
                <Typography variant="h4">
                  {getLogsByLevel('info').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="secondary.main">
                  Security
                </Typography>
                <Typography variant="h4">
                  {getLogsByLevel('security').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Level</InputLabel>
                <Select
                  value={filters.level}
                  label="Level"
                  onChange={(e) => handleFilterChange('level', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="error">Error</MenuItem>
                  <MenuItem value="warning">Warning</MenuItem>
                  <MenuItem value="info">Info</MenuItem>
                  <MenuItem value="debug">Debug</MenuItem>
                  <MenuItem value="security">Security</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filters.category}
                  label="Category"
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="auth">Auth</MenuItem>
                  <MenuItem value="api">API</MenuItem>
                  <MenuItem value="database">Database</MenuItem>
                  <MenuItem value="payment">Payment</MenuItem>
                  <MenuItem value="system">System</MenuItem>
                  <MenuItem value="user_action">User Action</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                type="date"
                label="From Date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                type="date"
                label="To Date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="Search"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search logs..."
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={clearFilters}
                sx={{ height: '56px' }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Logs Table */}
        {loading ? (
          <Typography variant="body1" color="text.secondary">
            Loading system logs...
          </Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Level</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>IP Address</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(log.timestamp)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getLevelIcon(log.level)}
                        label={log.level.charAt(0).toUpperCase() + log.level.slice(1)}
                        size="small"
                        color={getLevelColor(log.level) as any}
                        variant="filled"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.category.replace('_', ' ').toUpperCase()}
                        size="small"
                        color={getCategoryColor(log.category) as any}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {log.message}
                      </Typography>
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <Typography variant="caption" color="text.secondary">
                          Metadata: {JSON.stringify(log.metadata)}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {log.userEmail ? (
                        <Typography variant="body2">
                          {log.userEmail}
                        </Typography>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          System
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {log.ipAddress || 'N/A'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {logs.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No logs found matching the current filters.
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default SystemLogs;
