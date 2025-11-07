import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  Chip,
  Rating,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  LocalPharmacy as PharmacyIcon,
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  AccessTime as TimeIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import api from '../../services/api';

interface Pharmacy {
  _id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  rating: number;
  reviewCount: number;
  operatingHours: {
    [key: string]: string;
  };
  services: string[];
  isOpen: boolean;
  distance?: number; // in km
  profileImage?: string;
}

const PharmaciesList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [filteredPharmacies, setFilteredPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');

  useEffect(() => {
    fetchPharmacies();
  }, []);

  useEffect(() => {
    filterPharmacies();
  }, [pharmacies, searchTerm, locationFilter, serviceFilter]);

  const fetchPharmacies = async () => {
    try {
      const response = await api.get('/pharmacies');
      setPharmacies(response.data);
      setFilteredPharmacies(response.data);
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPharmacies = () => {
    let filtered = pharmacies;

    if (searchTerm) {
      filtered = filtered.filter(pharmacy =>
        pharmacy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pharmacy.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (locationFilter) {
      filtered = filtered.filter(pharmacy => pharmacy.address.includes(locationFilter));
    }

    if (serviceFilter) {
      filtered = filtered.filter(pharmacy => pharmacy.services.includes(serviceFilter));
    }

    setFilteredPharmacies(filtered);
  };

  const handleViewDetails = (pharmacyId: string) => {
    navigate(`/pharmacy/${pharmacyId}`);
  };

  const getUniqueValues = (key: keyof Pharmacy) => {
    if (key === 'services') {
      const allServices = pharmacies.flatMap(pharmacy => pharmacy.services);
      return [...new Set(allServices)];
    }
    return [...new Set(pharmacies.map(pharmacy => pharmacy[key]))];
  };

  const getTodayHours = (operatingHours: { [key: string]: string }) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return operatingHours[today] || 'Closed';
  };

  const isCurrentlyOpen = (operatingHours: { [key: string]: string }) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const hours = operatingHours[today];
    if (!hours || hours === 'Closed') return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [start, end] = hours.split(' - ').map(time => {
      const [hourStr, minuteStr] = time.split(':');
      return parseInt(hourStr) * 60 + parseInt(minuteStr);
    });

    return currentTime >= start && currentTime <= end;
  };

  if (!user) {
    return (
      <Container maxWidth="md">
        <Typography variant="h6" color="text.secondary">
          Please log in to view pharmacies.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Find a Pharmacy
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Locate pharmacies near you for prescription services
        </Typography>

        {/* Search and Filters */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search pharmacies"
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
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Location</InputLabel>
                <Select
                  value={locationFilter}
                  label="Location"
                  onChange={(e) => setLocationFilter(e.target.value)}
                >
                  <MenuItem value="">All Locations</MenuItem>
                  {getUniqueValues('address').map((address) => (
                    <MenuItem key={address as string} value={address as string}>
                      {address as string}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Service</InputLabel>
                <Select
                  value={serviceFilter}
                  label="Service"
                  onChange={(e) => setServiceFilter(e.target.value)}
                >
                  <MenuItem value="">All Services</MenuItem>
                  {getUniqueValues('services').map((service) => (
                    <MenuItem key={service as string} value={service as string}>
                      {service as string}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Pharmacies Grid */}
        {loading ? (
          <Typography variant="body1" color="text.secondary">
            Loading pharmacies...
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {filteredPharmacies.map((pharmacy) => (
              <Grid item xs={12} md={6} lg={4} key={pharmacy._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        src={pharmacy.profileImage}
                        sx={{ width: 60, height: 60, mr: 2 }}
                      >
                        <PharmacyIcon />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" component="h2">
                          {pharmacy.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={isCurrentlyOpen(pharmacy.operatingHours) ? 'Open' : 'Closed'}
                            size="small"
                            color={isCurrentlyOpen(pharmacy.operatingHours) ? 'success' : 'error'}
                            variant="filled"
                          />
                          {pharmacy.distance && (
                            <Typography variant="body2" color="text.secondary">
                              {pharmacy.distance} km away
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <StarIcon sx={{ color: 'gold', mr: 0.5, fontSize: 16 }} />
                        <Rating value={pharmacy.rating} readOnly size="small" />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          ({pharmacy.reviewCount} reviews)
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationIcon sx={{ mr: 0.5, fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {pharmacy.address}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <TimeIcon sx={{ mr: 0.5, fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          Today: {getTodayHours(pharmacy.operatingHours)}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PhoneIcon sx={{ mr: 0.5, fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {pharmacy.phone}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {pharmacy.services.slice(0, 3).map((service) => (
                        <Chip
                          key={service}
                          label={service}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      ))}
                      {pharmacy.services.length > 3 && (
                        <Chip
                          label={`+${pharmacy.services.length - 3} more`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </CardContent>

                  <CardActions>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => handleViewDetails(pharmacy._id)}
                    >
                      View Details & Order
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {filteredPharmacies.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No pharmacies found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search criteria
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default PharmaciesList;
