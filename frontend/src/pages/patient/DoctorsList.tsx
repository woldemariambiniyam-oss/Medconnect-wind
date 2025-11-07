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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import api from '../../services/api';

interface Doctor {
  _id: string;
  name: string;
  specialty: string;
  experience: number;
  rating: number;
  reviewCount: number;
  location: string;
  availability: string[];
  consultationFee: number;
  profileImage?: string;
}

const DoctorsList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [doctors, searchTerm, specialtyFilter, locationFilter]);

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/doctors');
      setDoctors(response.data);
      setFilteredDoctors(response.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDoctors = () => {
    let filtered = doctors;

    if (searchTerm) {
      filtered = filtered.filter(doctor =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (specialtyFilter) {
      filtered = filtered.filter(doctor => doctor.specialty === specialtyFilter);
    }

    if (locationFilter) {
      filtered = filtered.filter(doctor => doctor.location === locationFilter);
    }

    setFilteredDoctors(filtered);
  };

  const handleBookAppointment = (doctorId: string) => {
    navigate(`/book-appointment/${doctorId}`);
  };

  const getUniqueValues = (key: keyof Doctor) => {
    return [...new Set(doctors.map(doctor => doctor[key]))];
  };

  if (!user) {
    return (
      <Container maxWidth="md">
        <Typography variant="h6" color="text.secondary">
          Please log in to view doctors.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Find a Doctor
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Book appointments with qualified healthcare professionals
        </Typography>

        {/* Search and Filters */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search doctors"
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
                <InputLabel>Specialty</InputLabel>
                <Select
                  value={specialtyFilter}
                  label="Specialty"
                  onChange={(e) => setSpecialtyFilter(e.target.value)}
                >
                  <MenuItem value="">All Specialties</MenuItem>
                  {getUniqueValues('specialty').map((specialty) => (
                    <MenuItem key={specialty as string} value={specialty as string}>
                      {specialty}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
                  {getUniqueValues('location').map((location) => (
                    <MenuItem key={location as string} value={location as string}>
                      {location}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Doctors Grid */}
        {loading ? (
          <Typography variant="body1" color="text.secondary">
            Loading doctors...
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {filteredDoctors.map((doctor) => (
              <Grid item xs={12} md={6} lg={4} key={doctor._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        src={doctor.profileImage}
                        sx={{ width: 60, height: 60, mr: 2 }}
                      >
                        {doctor.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" component="h2">
                          Dr. {doctor.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {doctor.specialty}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <StarIcon sx={{ color: 'gold', mr: 0.5, fontSize: 16 }} />
                        <Rating value={doctor.rating} readOnly size="small" />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          ({doctor.reviewCount} reviews)
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationIcon sx={{ mr: 0.5, fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {doctor.location}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <ScheduleIcon sx={{ mr: 0.5, fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {doctor.experience} years experience
                        </Typography>
                      </Box>

                      <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                        ${doctor.consultationFee} / consultation
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {doctor.availability.slice(0, 3).map((day) => (
                        <Chip
                          key={day}
                          label={day}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      ))}
                      {doctor.availability.length > 3 && (
                        <Chip
                          label={`+${doctor.availability.length - 3} more`}
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
                      onClick={() => handleBookAppointment(doctor._id)}
                    >
                      Book Appointment
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {filteredDoctors.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No doctors found
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

export default DoctorsList;
