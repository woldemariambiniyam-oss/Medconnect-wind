import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import 'react-toastify/dist/ReactToastify.css';
import { store } from './store/store';

// Components
import Layout from './components/Layout';
import TailwindLayout from './components/TailwindLayout';
import NotificationToast from './components/NotificationToast';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TailwindPatient from './pages/TailwindPatient';

// Role-based pages (to be created)
import DoctorDashboard from './pages/DoctorDashboard';
import PharmacyDashboard from './pages/PharmacyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import EFDADashboard from './pages/EFDADashboard';

// Patient pages
import DoctorsList from './pages/patient/DoctorsList';
import BookAppointment from './pages/patient/BookAppointment';
import AppointmentsList from './pages/patient/AppointmentsList';
import PrescriptionsList from './pages/patient/PrescriptionsList';
import PaymentsList from './pages/patient/PaymentsList';
import PharmaciesList from './pages/patient/PharmaciesList';

// Doctor pages
import AppointmentsManagement from './pages/doctor/AppointmentsManagement';
import PrescriptionsManagement from './pages/doctor/PrescriptionsManagement';
import PatientsList from './pages/doctor/PatientsList';

// Pharmacy pages
import InventoryManagement from './pages/pharmacy/InventoryManagement';
import PrescriptionsFulfillment from './pages/pharmacy/PrescriptionsFulfillment';

// Admin pages
import UserManagement from './pages/admin/UserManagement';
import VerificationPanel from './pages/admin/VerificationPanel';
import SystemLogs from './pages/admin/SystemLogs';

// Shared pages
import Profile from './pages/Profile';
import NotificationsCenter from './pages/NotificationsCenter';
import NotFound from './pages/NotFound';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" />;
};

const RoleBasedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles: string[];
}> = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user.role;

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <NotificationToast />
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route
              path="/*"
              element={
                <PrivateRoute>
                  <Routes>
                    {/* Dashboard routes based on role */}
                    <Route
                      path="/dashboard"
                      element={
                        <Layout>
                          <Dashboard />
                        </Layout>
                      }
                    />

                    {/* Patient routes */}
                    <Route
                      path="/doctors"
                      element={
                        <RoleBasedRoute allowedRoles={['patient']}>
                          <Layout>
                            <DoctorsList />
                          </Layout>
                        </RoleBasedRoute>
                      }
                    />
                    <Route
                      path="/book-appointment/:doctorId?"
                      element={
                        <RoleBasedRoute allowedRoles={['patient']}>
                          <Layout>
                            <BookAppointment />
                          </Layout>
                        </RoleBasedRoute>
                      }
                    />
                    <Route
                      path="/appointments"
                      element={
                        <RoleBasedRoute allowedRoles={['patient', 'doctor']}>
                          <Layout>
                            <AppointmentsList />
                          </Layout>
                        </RoleBasedRoute>
                      }
                    />
                    <Route
                      path="/prescriptions"
                      element={
                        <RoleBasedRoute allowedRoles={['patient', 'doctor', 'pharmacy']}>
                          <Layout>
                            <PrescriptionsList />
                          </Layout>
                        </RoleBasedRoute>
                      }
                    />
                    <Route
                      path="/payments"
                      element={
                        <RoleBasedRoute allowedRoles={['patient']}>
                          <Layout>
                            <PaymentsList />
                          </Layout>
                        </RoleBasedRoute>
                      }
                    />
                    <Route
                      path="/pharmacies"
                      element={
                        <RoleBasedRoute allowedRoles={['patient']}>
                          <Layout>
                            <PharmaciesList />
                          </Layout>
                        </RoleBasedRoute>
                      }
                    />

                    {/* Doctor routes */}
                    <Route
                      path="/doctor-dashboard"
                      element={
                        <RoleBasedRoute allowedRoles={['doctor']}>
                          <Layout>
                            <DoctorDashboard />
                          </Layout>
                        </RoleBasedRoute>
                      }
                    />
                    <Route
                      path="/manage-appointments"
                      element={
                        <RoleBasedRoute allowedRoles={['doctor']}>
                          <Layout>
                            <AppointmentsManagement />
                          </Layout>
                        </RoleBasedRoute>
                      }
                    />
                    <Route
                      path="/manage-prescriptions"
                      element={
                        <RoleBasedRoute allowedRoles={['doctor']}>
                          <Layout>
                            <PrescriptionsManagement />
                          </Layout>
                        </RoleBasedRoute>
                      }
                    />
                    <Route
                      path="/patients"
                      element={
                        <RoleBasedRoute allowedRoles={['doctor']}>
                          <Layout>
                            <PatientsList />
                          </Layout>
                        </RoleBasedRoute>
                      }
                    />

                    {/* Pharmacy routes */}
                    <Route
                      path="/pharmacy-dashboard"
                      element={
                        <RoleBasedRoute allowedRoles={['pharmacy']}>
                          <Layout>
                            <PharmacyDashboard />
                          </Layout>
                        </RoleBasedRoute>
                      }
                    />
                    <Route
                      path="/inventory"
                      element={
                        <RoleBasedRoute allowedRoles={['pharmacy']}>
                          <Layout>
                            <InventoryManagement />
                          </Layout>
                        </RoleBasedRoute>
                      }
                    />
                    <Route
                      path="/fulfill-prescriptions"
                      element={
                        <RoleBasedRoute allowedRoles={['pharmacy']}>
                          <Layout>
                            <PrescriptionsFulfillment />
                          </Layout>
                        </RoleBasedRoute>
                      }
                    />

                    {/* Admin/EFDA routes */}
                    <Route
                      path="/admin-dashboard"
                      element={
                        <RoleBasedRoute allowedRoles={['admin', 'efda']}>
                          <Layout>
                            <AdminDashboard />
                          </Layout>
                        </RoleBasedRoute>
                      }
                    />
                    <Route
                      path="/efda-dashboard"
                      element={
                        <RoleBasedRoute allowedRoles={['efda']}>
                          <Layout>
                            <EFDADashboard />
                          </Layout>
                        </RoleBasedRoute>
                      }
                    />
                    <Route
                      path="/users"
                      element={
                        <RoleBasedRoute allowedRoles={['admin']}>
                          <Layout>
                            <UserManagement />
                          </Layout>
                        </RoleBasedRoute>
                      }
                    />
                    <Route
                      path="/verifications"
                      element={
                        <RoleBasedRoute allowedRoles={['admin', 'efda']}>
                          <Layout>
                            <VerificationPanel />
                          </Layout>
                        </RoleBasedRoute>
                      }
                    />
                    <Route
                      path="/logs"
                      element={
                        <RoleBasedRoute allowedRoles={['admin']}>
                          <Layout>
                            <SystemLogs />
                          </Layout>
                        </RoleBasedRoute>
                      }
                    />

                    {/* Shared routes */}
                    <Route
                      path="/profile"
                      element={
                        <Layout>
                          <Profile />
                        </Layout>
                      }
                    />
                    <Route
                      path="/notifications"
                      element={
                        <Layout>
                          <NotificationsCenter />
                        </Layout>
                      }
                    />

                    {/* Demo routes */}
                    <Route
                      path="/tw-patient"
                      element={
                        <TailwindLayout>
                          <TailwindPatient />
                        </TailwindLayout>
                      }
                    />

                    {/* Default redirect */}
                    <Route path="/" element={<Navigate to="/dashboard" />} />

                    {/* 404 route */}
                    <Route
                      path="*"
                      element={
                        <Layout>
                          <NotFound />
                        </Layout>
                      }
                    />
                  </Routes>
                </PrivateRoute>
              }
            />
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
