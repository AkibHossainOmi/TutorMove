import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import TutorList from './pages/TutorList';
import TutorProfile from './pages/TutorProfile';
import Profile from './pages/Profile';
import JobList from './pages/JobList';
import JobDetail from './pages/JobDetail';
import Messages from './pages/Messages';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import GigDetails from './pages/GigDetails';

// Payment status components
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFail from './pages/PaymentFail';
import PaymentCancel from './pages/PaymentCancel';

// Email/Password Auth
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';


// Map Search (if needed)
import ProtectedRoute from './contexts/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import TutorMapSearch from './components/MapSearch';
import BuyCreditPage from './pages/BuyCreditPage';
import TutorGigPage from './pages/TutorGigPage';


// Additional Policy Pages
const RefundPolicy = () => (
  <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
    <h1>Refund Policy</h1>
    <p>Our refund policy outlines the conditions under which refunds may be issued.</p>
    {/* Add more content as needed */}
  </div>
);

function App() {
  return (
    <div className="font-roboto min-h-screen flex flex-col"> {/* Applying font-roboto and flex layout */}
      <BrowserRouter>
        <Routes>
          {/* Public Routes - Accessible to all users */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email/:uid/:token" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          {/* Fallback for unmatched public routes, redirects to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />

          {/* Protected Routes - Accessible only after authentication, handled by ProtectedRoute */}
          <Route element={<ProtectedRoute />}>
            {/* Dashboard routes - A generic /dashboard path that redirects to a specific dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* User Profile and Tutor Listings */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/tutors" element={<TutorList />} />
            <Route path="/tutors/:tutorId" element={<TutorProfile />} />
            <Route path="/buy-credits" element={<BuyCreditPage />} />

            {/* Gigs and Job Listings */}
            <Route path="/tutor/gig/:id" element={<TutorGigPage />} />
            <Route path="/gigs/:id" element={<GigDetails />} />
            <Route path="/jobs" element={<JobList />} />
            <Route path="/jobs/:id" element={<JobDetail />} />

            

            {/* Messaging and Credit Management */}
            <Route path="/messages" element={<Messages />} />

            {/* Payment Status Pages */}
            <Route path="/payments/success/" element={<PaymentSuccess />} />
            <Route path="/payments/fail/" element={<PaymentFail />} />
            <Route path="/payments/cancel" element={<PaymentCancel />} />

            {/* Map Search functionality */}
            <Route path="/map-search" element={<TutorMapSearch mode="gigs" radiusKm={20} />} />
            <Route path="/job-map" element={<TutorMapSearch mode="jobs" radiusKm={20} />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
