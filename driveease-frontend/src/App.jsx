import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Auth pages
import Login from './pages/Login';
import Signup from './pages/Signup';

// Main pages
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import VehicleDetails from './pages/VehicleDetails';
import CreateBooking from './pages/CreateBooking';
import MyBookings from './pages/MyBookings';
import BookingDetails from './pages/BookingDetails';

// Admin pages
import AdminDashboard from './admin/AdminDashboard';
import ManageVehicles from './admin/ManageVehicles';
import ManageBookings from './admin/ManageBookings';

export default function App() {
  return (
    <div className="app">
      {/* Navbar renders itself only when authenticated */}
      <Navbar />

      <main className="main-content">
        <Routes>
          {/* Public routes */}
          <Route path="/login"  element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Protected user routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/vehicles" element={
            <ProtectedRoute><Vehicles /></ProtectedRoute>
          } />
          <Route path="/vehicles/:id" element={
            <ProtectedRoute><VehicleDetails /></ProtectedRoute>
          } />
          <Route path="/bookings" element={
            <ProtectedRoute><MyBookings /></ProtectedRoute>
          } />
          <Route path="/bookings/:id" element={
            <ProtectedRoute><BookingDetails /></ProtectedRoute>
          } />
          <Route path="/bookings/create/:vehicleId" element={
            <ProtectedRoute><CreateBooking /></ProtectedRoute>
          } />

          {/* Admin routes */}
          <Route path="/admin" element={
            <AdminRoute><AdminDashboard /></AdminRoute>
          } />
          <Route path="/admin/vehicles" element={
            <AdminRoute><ManageVehicles /></AdminRoute>
          } />
          <Route path="/admin/bookings" element={
            <AdminRoute><ManageBookings /></AdminRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}
