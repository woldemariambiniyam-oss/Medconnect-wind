import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  LocalHospital as DoctorIcon,
  LocalPharmacy as PharmacyIcon,
  Payment as PaymentIcon,
  Notifications as NotificationsIcon,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { RootState } from '../store/store';
import { logout } from '../store/authSlice';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
  ];

  // Add role-specific menu items
  if (user?.role === 'patient') {
    menuItems.push(
      { text: 'Doctors', icon: <DoctorIcon />, path: '/doctors' },
      { text: 'Appointments', icon: <DoctorIcon />, path: '/appointments' },
      { text: 'Prescriptions', icon: <DoctorIcon />, path: '/prescriptions' },
      { text: 'Payments', icon: <PaymentIcon />, path: '/payments' }
    );
  } else if (user?.role === 'doctor') {
    menuItems.push(
      { text: 'Appointments', icon: <DoctorIcon />, path: '/appointments' },
      { text: 'Prescriptions', icon: <DoctorIcon />, path: '/prescriptions' },
      { text: 'Patients', icon: <PersonIcon />, path: '/patients' }
    );
  } else if (user?.role === 'pharmacy') {
    menuItems.push(
      { text: 'Medicines', icon: <PharmacyIcon />, path: '/medicines' },
      { text: 'Prescriptions', icon: <DoctorIcon />, path: '/prescriptions' }
    );
  } else if (user?.role === 'efda' || user?.role === 'admin') {
    menuItems.push(
      { text: 'Verifications', icon: <PersonIcon />, path: '/verifications' },
      { text: 'Users', icon: <PersonIcon />, path: '/users' }
    );
  }

  menuItems.push({ text: 'Notifications', icon: <NotificationsIcon />, path: '/notifications' });

  const drawer = (
    <Box sx={{ width: 250 }}>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Medconnect-wind
        </Typography>
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => {
              navigate(item.path);
              if (isMobile) setDrawerOpen(false);
            }}
            selected={location.pathname === item.path}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        <ListItem button onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleDrawer}
            sx={{ mr: 2, ...(isMobile ? {} : { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Medconnect-wind
          </Typography>
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body1" sx={{ mr: 2 }}>
                Welcome, {user.name}
              </Typography>
              {!isMobile && (
                <Button color="inherit" onClick={handleLogout}>
                  Logout
                </Button>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: 240 }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? drawerOpen : true}
          onClose={toggleDrawer}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: 240,
              top: 64,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - 240px)` },
          mt: 8,
        }}
      >
        <Container maxWidth="lg">
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
