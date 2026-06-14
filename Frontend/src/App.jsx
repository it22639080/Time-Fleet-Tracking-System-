import { Navigate, Route, Routes } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import AuthLayout from './layouts/AuthLayout.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import LoginPage from './pages/Auth/LoginPage.jsx';
import RegisterPage from './pages/Auth/RegisterPage.jsx';
import AdminFleetDashboard from './pages/Admin/AdminFleetDashboard.jsx';
import AdminReportsPage from './pages/Admin/AdminReportsPage.jsx';
import AdminVehicleDetailsPage from './pages/Admin/AdminVehicleDetailsPage.jsx';
import AdminVehiclesPage from './pages/Admin/AdminVehiclesPage.jsx';
import AlertsPage from './pages/Dashboard/AlertsPage.jsx';
import DashboardPage from './pages/Dashboard/DashboardPage.jsx';
import DriverDashboard from './pages/Driver/DriverDashboard.jsx';
import GeofenceManagementPage from './pages/Dashboard/GeofenceManagementPage.jsx';
import MapPage from './pages/Map/MapPage.jsx';
import TripDetailsPage from './pages/Trips/TripDetailsPage.jsx';
import TripHistoryPage from './pages/Trips/TripHistoryPage.jsx';
import UserTrackingPage from './pages/Dashboard/UserTrackingPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

function App() {
  const location = useLocation();

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <Routes location={location}>
            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/dashboard/map" element={<MapPage />} />
                <Route path="/dashboard/alerts" element={<AlertsPage />} />
                <Route path="/dashboard/geofences" element={<GeofenceManagementPage />} />
              </Route>
              <Route path="/trips/history" element={<TripHistoryPage />} />
              <Route path="/trips/:id" element={<TripDetailsPage />} />
            </Route>

            <Route element={<ProtectedRoute roles={['admin']} />}>
              <Route path="/admin/dashboard" element={<AdminFleetDashboard />} />
              <Route path="/admin/reports" element={<AdminReportsPage />} />
              <Route path="/admin/vehicles" element={<AdminVehiclesPage />} />
              <Route path="/admin/vehicles/:id" element={<AdminVehicleDetailsPage />} />
            </Route>

            <Route element={<ProtectedRoute roles={['driver']} />}>
              <Route path="/driver/dashboard" element={<DriverDashboard />} />
            </Route>

            <Route element={<ProtectedRoute roles={['user']} />}>
              <Route path="/track" element={<UserTrackingPage />} />
            </Route>
          </Routes>
        </motion.div>
      </AnimatePresence>

      <Toaster
        position="top-center"
        toastOptions={{
          className: 'border border-white/10 bg-slate-950/95 text-white shadow-2xl',
          error: {
            iconTheme: {
              primary: '#fda4af',
              secondary: '#111827'
            }
          }
        }}
      />
    </>
  );
}

export default App;
