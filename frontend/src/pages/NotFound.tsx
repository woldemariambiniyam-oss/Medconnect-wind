import React from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Home as HomeIcon } from '@mui/icons-material';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '60vh',
          justifyContent: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 6,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            maxWidth: 500,
          }}
        >
          <Typography
            component="h1"
            variant="h1"
            sx={{
              fontSize: '6rem',
              fontWeight: 'bold',
              color: 'primary.main',
              mb: 2,
            }}
          >
            404
          </Typography>

          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{ mb: 2 }}
          >
            Page Not Found
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 4, lineHeight: 1.6 }}
          >
            The page you're looking for doesn't exist or has been moved.
            Please check the URL or return to the dashboard.
          </Typography>

          <Button
            variant="contained"
            size="large"
            startIcon={<HomeIcon />}
            onClick={handleGoHome}
            sx={{
              minWidth: 200,
              py: 1.5,
              fontSize: '1.1rem',
            }}
          >
            Go to Dashboard
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default NotFound;
