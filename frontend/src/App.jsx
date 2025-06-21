import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { BookingProvider } from './contexts/BookingContext';

// Components
import NavigationBar from './components/NavigationBar';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ResetPassword from './pages/ResetPasswordNew';
import BookingPage from './pages/BookingPage';
import MyAppointments from './pages/MyAppointments';
import TherapistDashboard from './pages/TherapistDashboard';
import AccountRouter from './pages/AccountRouter';

function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="min-h-screen bg-secondary-50">
            <NavigationBar />
            <main>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/booking" element={
                  <ProtectedRoute allowedRoles={['client', 'admin']}>
                    <BookingPage />
                  </ProtectedRoute>
                } />
                <Route path="/my-appointments" element={
                  <ProtectedRoute>
                    <MyAppointments />
                  </ProtectedRoute>
                } />
                <Route path="/therapist-dashboard" element={
                  <ProtectedRoute allowedRoles={['therapist']}>
                    <TherapistDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/account/*" element={
                  <ProtectedRoute>
                    <AccountRouter />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </div>
        </Router>
      </BookingProvider>
    </AuthProvider>
  );
}

export default App; 