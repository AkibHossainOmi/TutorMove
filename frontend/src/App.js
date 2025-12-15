import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
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
import ReferralHandler from './components/ReferralHandler';

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
import TutorGigPage from './pages/TutorGigPage';
import BuyPremiumPage from './components/BuyPremiumPage';
import About from './pages/About';
import HowItWorks from './pages/HowItWorks';
import Contact from './pages/Contact';
import TeacherGuide from './pages/TeacherGuide';
import FAQ from './pages/FAQ';
import PostRequirement from './pages/PostRequirement';
import BuyCreditsAndPremiumPage from './pages/BuyCreditPage';
import StudentProfilePage from './pages/StudentProfile';
import UserProfile from './pages/UserProfile';
import QnAPage from './pages/qna/QnAPage';
import CreateQuestionPage from './pages/qna/CreateQuestionPage';
import QuestionDetailsPage from './pages/qna/QuestionDetailsPage';
import TutorApplicationPage from './pages/TutorApplicationPage';


function App() {
  return (
    <AuthProvider>
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
            <Route path="/tutors" element={<TutorList />} />
            <Route path="/jobs" element={<JobList />} />
            <Route path="/refer/:username" element={<ReferralHandler />} />
            {/* Fallback for unmatched public routes, redirects to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />

          {/* Protected Routes - Accessible only after authentication, handled by ProtectedRoute */}
          <Route element={<ProtectedRoute />}>
            {/* Dashboard routes - A generic /dashboard path that redirects to a specific dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* User Profile and Tutor Listings */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:username" element={<UserProfile />} />
            <Route path="/tutors/:tutorId" element={<TutorProfile />} />
            <Route path="/students/:studentId" element={<StudentProfilePage />} />
            <Route path="/buy-points" element={<BuyCreditsAndPremiumPage />} />
            <Route path="/buy-premium" element={<BuyPremiumPage />} />
            <Route path="/apply-tutor" element={<TutorApplicationPage />} />

            {/* Gigs and Job Listings */}
            <Route path="/tutor/gig/:id" element={<TutorGigPage />} />
            <Route path="/gigs/:id" element={<GigDetails />} />
            <Route path="/jobs/:id" element={<JobDetail />} />

            

            {/* Messaging and Point Management */}
            <Route path="/messages" element={<Messages />} />

            {/* Payment Status Pages */}
            <Route path="/payments/success/" element={<PaymentSuccess />} />
            <Route path="/payments/fail/" element={<PaymentFail />} />
            <Route path="/payments/cancel" element={<PaymentCancel />} />

            {/* Q&A Routes */}
            <Route path="/qna" element={<QnAPage />} />
            <Route path="/qna/create" element={<CreateQuestionPage />} />
            <Route path="/qna/:id" element={<QuestionDetailsPage />} />

            {/* Map Search functionality */}
            <Route path="/map-search" element={<TutorMapSearch mode="gigs" radiusKm={20} />} />
            <Route path="/job-map" element={<TutorMapSearch mode="jobs" radiusKm={20} />} />


            {/* Footer Routes */}
            <Route path="/about" element={<About />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/teacher-guide" element={<TeacherGuide />} />
            <Route path="/student-faq" element={<FAQ />} />
            <Route path="/post-requirement" element={<PostRequirement />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
    </AuthProvider>
  );
}

export default App;
