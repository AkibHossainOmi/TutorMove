import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ChatProvider, useChat } from './contexts/ChatContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import ChatWindow from './components/ChatWindow';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import TutorList from './pages/TutorList';
import TutorProfile from './pages/TutorProfile';
import Profile from './pages/Profile';
import JobList from './pages/JobList';
import JobDetail from './pages/JobDetail';
import Messages from './pages/Messages';
import CreditPurchase from './pages/CreditPurchase';
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
import MapSearch from './pages/MapSearch'; // adjust import if you have

// Additional Policy Pages
const RefundPolicy = () => (
  <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
    <h1>Refund Policy</h1>
    <p>Our refund policy outlines the conditions under which refunds may be issued.</p>
    {/* Add more content as needed */}
  </div>
);

// Chat Integration Component
const ChatIntegration = () => {
  const { isChatOpen, activeConversation, closeChat } = useChat();
  const { user } = useAuth();
  if (!isChatOpen || !activeConversation || !user) return null;
  return (
    <ChatWindow
      conversationId={activeConversation.id}
      currentUser={user}
      onClose={closeChat}
      isOpen={isChatOpen}
    />
  );
};

// Dashboard redirect component
const DashboardRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return <Navigate to={user.user_type === 'teacher' ? '/teacher-dashboard' : '/student-dashboard'} />;
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ChatProvider>
          <Router>
            <Suspense fallback={<LoadingSpinner />}>
              <div className="App" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Navbar />
                <main style={{ flex: 1 }}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    {/* Auth/account related */}
                    <Route path="/verify-email/:uid/:token" element={<VerifyEmail />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />

                    {/* Dashboard logic: redirect based on user type */}
                    <Route path="/dashboard" element={<DashboardRedirect />} />
                    <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
                    <Route path="/student-dashboard" element={<StudentDashboard />} />

                    {/* Profile (Self) */}
                    <Route path="/profile" element={<Profile />} />
                    {/* Public Tutor Profile */}
                    <Route path="/tutors" element={<TutorList />} />
                    <Route path="/tutors/:id" element={<TutorProfile />} />
                    
                    {/* Gigs and Jobs */}
                    <Route path="/gigs/:id" element={<GigDetails />} />
                    <Route path="/jobs" element={<JobList />} />
                    <Route path="/jobs/:id" element={<JobDetail />} />

                    {/* Messages and Credits */}
                    <Route path="/messages" element={<Messages />} />
                    <Route path="/credits" element={<CreditPurchase />} />
                    
                    {/* Payment Status Routes */}
                    <Route path="/:type/payment/success" element={<PaymentSuccess />} />
                    <Route path="/:type/payment/fail" element={<PaymentFail />} />
                    <Route path="/:type/payment/cancel" element={<PaymentCancel />} />
                    
                    {/* Policy Pages */}
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="/refund-policy" element={<RefundPolicy />} />
                    
                    {/* Additional Static Pages */}
                    <Route path="/about" element={<div style={{ padding: '40px 20px', textAlign: 'center' }}><h1>About Us</h1><p>Learn more about our platform.</p></div>} />
                    <Route path="/contact" element={<div style={{ padding: '40px 20px', textAlign: 'center' }}><h1>Contact Us</h1><p>Get in touch with our team.</p></div>} />
                    <Route path="/how-it-works" element={<div style={{ padding: '40px 20px', textAlign: 'center' }}><h1>How It Works</h1><p>Discover how our platform connects teachers and students.</p></div>} />

                    {/* Map Search Routes (if needed) */}
                    <Route path="/map-search" element={<MapSearch mode="gigs" radiusKm={20} />} />
                    <Route path="/job-map" element={<MapSearch mode="jobs" radiusKm={20} />} />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
                <Footer />
                <ChatIntegration />
              </div>
            </Suspense>
          </Router>
        </ChatProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
