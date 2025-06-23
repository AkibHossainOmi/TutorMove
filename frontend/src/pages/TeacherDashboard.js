import React, { useState, useEffect } from 'react';
import axios from 'axios'; // ADDED: Import axios for making API requests

// The following imports are commented out to prevent redeclaration errors
// when using the mock implementations provided below.
// In a full application, uncomment these and remove the mock implementations.
// import { useTranslation } from 'react-i18next';
// import { useAuth } from '../contexts/AuthContext';
// import { useNotification } from '../contexts/NotificationContext';
// import { useChat } from '../contexts/ChatContext';
// import { jobAPI, tutorAPI } from '../utils/apiService';
import GigPostForm from '../components/GigPostForm';
import JobCard from '../components/JobCard';
import TutorCard from '../components/TutorCard';
import LoadingSpinner from '../components/LoadingSpinner';
import WelcomeBanner from '../components/WelcomeBanner';
import Navbar from '../components/Navbar';
// import TeacherVerificationButton from '../components/TeacherVerificationButton';

// Mock implementations for demonstration purposes
// These mocks are used when the actual context/API imports are commented out.
const useTranslation = () => ({
  t: (key) => key // Simple mock translator
});
const useAuth = () => ({
  user: { id: 'teacher123', username: 'Professor Smith', email: 'professor.smith@example.com' } // Mock user with email
});
const useNotification = () => {
  const [notifications, setNotifications] = useState([
    { id: 'n1', message: 'New student inquiry!', isRead: false, created_at: new Date().toISOString() },
    { id: 'n2', message: 'Your gig "Math Tutor" is live!', isRead: true, created_at: new Date().toISOString() },
  ]);
  const showNotification = (message, type) => console.log(`Notification (${type}): ${message}`); // Placeholder for notification display
  return { showNotification, notifications };
};
const useChat = () => ({
  openChat: (chatId) => console.log(`Opening chat ${chatId}`), // Placeholder for chat functionality
  unreadCount: 3 // Mock unread count
});

// Mock API services for demonstration
const jobAPI = {
  getMatchedJobs: async () => ({ data: { results: [
    { id: 'job1', title: 'Calculus Help Needed', description: 'Student needs help with Calculus I homework', budget: 50, status: 'open' },
    { id: 'job2', title: 'English Essay Review', description: 'Review a college application essay', budget: 30, status: 'open' },
  ]}}),
  getMyApplications: async () => ({ data: { results: [
    { id: 'app1', jobId: 'job1', status: 'pending' },
    { id: 'app2', jobId: 'job3', status: 'completed' }, // Mock completed application
  ]}})
};

const tutorAPI = {
  getTutorGigs: async ({ user }) => ({ data: { results: [
    { id: 'gig1', title: 'Expert Math Tutor', description: 'Offering advanced math tutoring', rate: 40, status: 'active', teacherId: user.id },
    { id: 'gig2', title: 'Physics Fundamentals', description: 'Introductory physics lessons', rate: 35, status: 'active', teacherId: user.id },
    { id: 'gig3', title: 'Beginner Spanish', description: 'Learn Spanish from scratch', rate: 25, status: 'paused', teacherId: user.id },
  ]}})
};


const TeacherVerificationButton = () => (
  <button
    style={{
      padding: '8px 15px',
      backgroundColor: '#ffc107',
      color: '#212529',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 'bold'
    }}
  >
    Verify Teacher Status
  </button>
);


const TeacherDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showNotification, notifications } = useNotification();
  const { unreadCount } = useChat();
  const [isGigFormOpen, setIsGigFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    myGigs: [],
    matchedJobs: [],
    applications: [],
    earnings: {
      total: 0,
      pending: 0,
      completed: 0
    },
    stats: {
      totalViews: 0,
      activeGigs: 0,
      completedJobs: 0,
      totalStudents: 0
    }
  });

  // IMPORTANT: Replace with your actual Django backend URL and API endpoint
  // This should match the settings in your Django project
  // const DJANGO_BASE_URL = 'http://localhost:8000'; // Or your deployed backend URL
  const CREDIT_PURCHASE_ENDPOINT = `/api/credits/purchase/`;
  const PREMIUM_UPGRADE_ENDPOINT = `/api/premium/upgrade/`;

  // IMPORTANT: For testing with `AllowAny` on backend, you can use a mock user ID
  // In a real application with bypassed auth, you'd send a real user's ID
  // For production, this should be replaced with a proper token as discussed
  const MOCK_USER_ID = '1'; // Replace with an actual user ID from your Django DB for testing purposes
                               // E.g., if you created a superuser, their ID is usually 1.

  // AUTH_TOKEN is not strictly needed for this specific test if backend allows `AllowAny`
  // but it's good practice to keep it for when you re-enable authentication.
  // const AUTH_TOKEN = 'YOUR_AUTH_TOKEN_HERE'; // Placeholder, replace with actual token in real app


  useEffect(() => {
    loadDashboardData();
  }, []);

  /**
   * Loads all necessary dashboard data from API endpoints.
   * Updates the dashboardData state and handles loading state.
   */
  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load teacher's gigs
      const gigsResponse = await tutorAPI.getTutorGigs({ user: user.id });

      // Load matched jobs for teacher
      const matchedJobsResponse = await jobAPI.getMatchedJobs();

      // Load teacher's applications
      const applicationsResponse = await jobAPI.getMyApplications();

      setDashboardData(prev => ({
        ...prev, // Keep existing properties
        myGigs: gigsResponse.data.results || [],
        matchedJobs: matchedJobsResponse.data.results || [],
        applications: applicationsResponse.data.results || [],
        // Example data for earnings and stats - replace with actual API data if available
        earnings: {
          total: prev.earnings.total || 8500, // Keep existing if loaded, else use mock
          pending: prev.earnings.pending || 2100,
          completed: prev.earnings.completed || 6400
        },
        stats: {
          totalViews: prev.stats.totalViews || 320,
          activeGigs: gigsResponse.data.results?.filter(gig => gig.status === 'active').length || 0,
          completedJobs: applicationsResponse.data.results?.filter(app => app.status === 'completed').length || 0,
          totalStudents: prev.stats.totalStudents || 45
        }
      }));
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      showNotification(
        'Failed to load dashboard data. Please try again.',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles the successful creation of a new gig.
   * Adds the new gig to the myGigs list and updates active gigs count.
   * @param {object} newGig - The newly created gig object.
   */
  const handleGigCreated = (newGig) => {
    setDashboardData(prev => ({
      ...prev,
      myGigs: [newGig, ...prev.myGigs],
      stats: {
        ...prev.stats,
        activeGigs: prev.stats.activeGigs + 1
      }
    }));
    setIsGigFormOpen(false);
    showNotification('Gig created successfully!', 'success');
  };

  /**
   * Reusable StatCard component for displaying key metrics.
   * @param {string} title - The title of the stat.
   * @param {string|number} value - The value of the stat.
   * @param {string} icon - Emoji icon for the stat.
   * @param {string} color - Accent color for the icon background.
   */
  const StatCard = ({ title, value, icon, color }) => (
    <div className="stat-card" style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: '15px'
    }}>
      <div style={{
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        backgroundColor: `${color}20`, // Light background color from main color
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        color: color
      }}>
        {icon}
      </div>
      <div>
        <h3 style={{ margin: '0', color: '#495057', fontSize: '1.5em' }}>{value}</h3>
        <p style={{ margin: '5px 0 0', color: '#6c757d', fontSize: '0.9em' }}>{title}</p>
      </div>
    </div>
  );

  // Helper functions for UI feedback (loading, status messages)
  const [statusMessage, setStatusMessage] = useState('');
  const [showSpinner, setShowSpinner] = useState(false);

  function showLoading(message = 'Processing payment...') {
      setShowSpinner(true);
      setStatusMessage(message);
  }

  function hideLoading() {
      setShowSpinner(false);
      setStatusMessage('');
  }

  function showStatus(message, isError = false) {
      setStatusMessage(message);
      // You might want to style this differently for errors in your actual CSS
      console.log(isError ? `ERROR: ${message}` : `SUCCESS: ${message}`);
  }


  /**
   * Handles the "Buy Credits" button click event.
   * Makes an API call to the backend to initiate payment for credits.
   */
  const handleBuyCredits = async () => {
    showLoading('Initiating credit purchase...');
    try {
      // Data to send to your Django backend
      const purchaseData = {
        credits: 10,  // Amount of credits to buy
        amount: 100.00, // Corresponding financial amount (e.g., BDT)
        user_id: MOCK_USER_ID // Pass user_id explicitly since token is bypassed
      };

      const response = await axios.post(
        CREDIT_PURCHASE_ENDPOINT,
        purchaseData,
        {
          headers: {
            // 'Authorization': `Token ${AUTH_TOKEN}`, // Commented out for bypass testing
            'Content-Type': 'application/json'
          }
        }
      );

      hideLoading();
      if (response.data.status === 'SUCCESS' && response.data.payment_url) {
        showStatus('Redirecting to SSLCommerz...', false);
        window.location.href = response.data.payment_url; // Redirect the user to SSLCommerz
      } else {
        const errorMessage = response.data.error || 'Unknown error during payment initiation.';
        showStatus(`Payment initiation failed: ${errorMessage}`, true);
      }
    } catch (error) {
      hideLoading();
      console.error('Error initiating credit purchase:', error.response ? error.response.data : error.message);
      const userMessage = error.response?.data?.error || 'Could not initiate payment. Please try again.';
      showStatus(`Error: ${userMessage}`, true);
    }
  };

  /**
   * Handles the "Upgrade to Premium" button click event.
   * Makes an API call to the backend to initiate payment for premium.
   */
  const handleUpgradePremium = async () => {
    showLoading('Initiating premium upgrade...');
    try {
      // Data to send to your Django backend
      const upgradeData = {
        plan: 'monthly', // Example plan
        user_id: MOCK_USER_ID // Pass user_id explicitly since token is bypassed
      };

      const response = await axios.post(
        PREMIUM_UPGRADE_ENDPOINT,
        upgradeData,
        {
          headers: {
            // 'Authorization': `Token ${AUTH_TOKEN}`, // Commented out for bypass testing
            'Content-Type': 'application/json'
          }
        }
      );

      hideLoading();
      if (response.data.status === 'SUCCESS' && response.data.payment_url) {
        showStatus('Redirecting to SSLCommerz...', false);
        window.location.href = response.data.payment_url; // Redirect the user to SSLCommerz
      } else {
        const errorMessage = response.data.error || 'Unknown error during premium initiation.';
        showStatus(`Premium upgrade failed: ${errorMessage}`, true);
      }
    } catch (error) {
      hideLoading();
      console.error('Error initiating premium upgrade:', error.response ? error.response.data : error.message);
      const userMessage = error.response?.data?.error || 'Could not initiate premium upgrade. Please try again.';
      showStatus(`Error: ${userMessage}`, true);
    }
  };


  // Display loading spinner while data is being fetched
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
    <Navbar />
    <div className="teacher-dashboard-container" style={{
      padding: '30px',
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: 'Inter, sans-serif',
      color: '#343a40'
    }}>
      <WelcomeBanner />

      {/* Header Section: Title, Verification, and Action Buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start', // Align items to the start, allowing vertical stacking on smaller screens
        marginBottom: '30px',
        flexWrap: 'wrap', // Allow items to wrap to the next line on smaller screens
        gap: '20px' // Space between wrapped items
      }}>
        {/* Title and Verification Button */}
        <div style={{
          display: 'flex',
          flexDirection: 'column', // Stack title and verification vertically
          alignItems: 'flex-start',
          gap: '10px'
        }}>
          <h1 style={{ margin: 0, color: '#212529', fontSize: '2em' }}>
            Teacher Dashboard - Welcome, {user.username}!
          </h1>
          <TeacherVerificationButton />
        </div>

        {/* Action Buttons: Notifications, Messages, Create Gig, Buy Credits */}
        <div style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          flexWrap: 'wrap', // Allow buttons to wrap
          justifyContent: 'flex-end' // Align buttons to the right
        }}>
          {/* Notification Button */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                padding: '10px 15px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                position: 'relative',
                fontSize: '1em',
                fontWeight: '500',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'background-color 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5a6268'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
            >
              🔔 Notifications
              {notifications?.filter(n => !n.isRead).length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  border: '2px solid white'
                }}>
                  {notifications.filter(n => !n.isRead).length}
                </span>
              )}
            </button>
            {showNotifications && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 10px)', // Position below the button with a gap
                right: 0,
                backgroundColor: 'white',
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                width: '300px',
                maxHeight: '400px',
                overflowY: 'auto',
                zIndex: 1000,
                animation: 'fadeIn 0.3s ease-out'
              }}>
                <style>{`
                  @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                  }
                `}</style>
                <div style={{ padding: '15px', borderBottom: '1px solid #dee2e6', backgroundColor: '#f8f9fa' }}>
                  <h4 style={{ margin: 0, color: '#343a40' }}>Notifications</h4>
                </div>
                {notifications?.length > 0 ? (
                  notifications.slice(0, 5).map(notification => (
                    <div key={notification.id} style={{
                      padding: '12px 15px',
                      borderBottom: '1px solid #f8f9fa',
                      backgroundColor: notification.isRead ? 'white' : '#eaf4ff', // Highlight unread
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                      fontSize: '0.9em'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = notification.isRead ? '#f8f9fa' : '#dff0ff'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = notification.isRead ? 'white' : '#eaf4ff'}
                    >
                      <p style={{ margin: 0, fontWeight: notification.isRead ? 'normal' : 'bold' }}>{notification.message}</p>
                      <small style={{ color: '#6c757d' }}>
                        {new Date(notification.created_at).toLocaleDateString()}
                      </small>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '15px', textAlign: 'center', color: '#6c757d' }}>
                    No notifications
                  </div>
                )}
                <div style={{ padding: '10px 15px', textAlign: 'center', borderTop: '1px solid #dee2e6', backgroundColor: '#f8f9fa' }}>
                  <button
                    onClick={() => window.location.href = '/messages'} // Assuming /messages route handles all notifications
                    style={{
                      padding: '8px 15px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '1em',
                      fontWeight: '500',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      transition: 'background-color 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
                  >
                    View All
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Messages Button */}
          <button
            onClick={() => window.location.href = '/messages'}
            style={{
              padding: '10px 15px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              position: 'relative',
              fontSize: '1em',
              fontWeight: '500',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'background-color 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#138496'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#17a2b8'}
          >
            💬 Messages
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                backgroundColor: '#dc3545',
                color: 'white',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                border: '2px solid white'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {/* Create a Gig Button */}
          <button
            onClick={() => setIsGigFormOpen(true)}
            style={{
              padding: '10px 15px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1em',
              fontWeight: '500',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'background-color 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
          >
            ➕ Create a Gig
          </button>

          {/* Buy Credits Button - MODIFIED FOR DIRECT PAYMENT INITIATION */}
          <button
            onClick={handleBuyCredits} // Call the new handler
            style={{
              padding: '10px 15px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1em',
              fontWeight: '500',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'background-color 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#218838'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#28a745'}
          >
            💳 Buy Credits
          </button>
        </div>
      </div>

      {/* Status/Loading Message Display */}
      {showSpinner && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '15px 0', color: '#555' }}>
          <div className="loading-spinner" style={{ display: 'block', marginRight: '10px' }}></div>
          <span>{statusMessage}</span>
        </div>
      )}
      {!showSpinner && statusMessage && (
        <p className="status-message" style={{ textAlign: 'center', marginTop: '15px' }}>{statusMessage}</p>
      )}


      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <StatCard
          title="Total Earnings"
          value={`${dashboardData.earnings.total} Credits`}
          icon="💰"
          color="#28a745"
        />
        <StatCard
          title="Active Gigs"
          value={dashboardData.stats.activeGigs}
          icon="🎯"
          color="#007bff"
        />
        <StatCard
          title="Total Students"
          value={dashboardData.stats.totalStudents}
          icon="👥"
          color="#fd7e14"
        />
        <StatCard
          title="Profile Views"
          value={dashboardData.stats.totalViews}
          icon="👁️"
          color="#6f42c1"
        />
      </div>

      {/* Menu Bar */}
      <div style={{
        borderBottom: '1px solid #dee2e6',
        marginBottom: '20px',
        overflowX: 'auto', // Allow horizontal scrolling for tabs on small screens
        whiteSpace: 'nowrap' // Prevent tabs from wrapping
      }}>
        <div style={{ display: 'flex', gap: '20px', paddingBottom: '10px' }}> {/* Add padding to prevent cut-off of active tab border */}
          {['overview', 'jobs', 'gigs', 'wallet', 'profile', 'premium'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderBottom: activeTab === tab ? '3px solid #007bff' : 'none', // Thicker border for active tab
                backgroundColor: 'transparent',
                color: activeTab === tab ? '#007bff' : '#6c757d',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: activeTab === tab ? '600' : 'normal', // Bolder for active tab
                flexShrink: 0, // Prevent buttons from shrinking
                transition: 'color 0.3s ease, border-bottom 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#007bff'}
              onMouseLeave={(e) => e.currentTarget.style.color = activeTab === tab ? '#007bff' : '#6c757d'}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ marginTop: '20px' }}>
        {activeTab === 'overview' && (
          <div className="overview-tab-content" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            <div className="my-gigs-section">
              <h3 style={{ borderBottom: '1px solid #dee2e6', paddingBottom: '10px', marginBottom: '15px' }}>My Recent Gigs</h3>
              {dashboardData.myGigs.length > 0 ? (
                dashboardData.myGigs.slice(0, 3).map(gig => (
                  <TutorCard key={gig.id} tutor={gig} />
                ))
              ) : (
                <p style={{ color: '#6c757d' }}>No gigs found. Why not create one?</p>
              )}
            </div>
            <div className="matched-jobs-section">
              <h3 style={{ borderBottom: '1px solid #dee2e6', paddingBottom: '10px', marginBottom: '15px' }}>Matched Jobs</h3>
              {dashboardData.matchedJobs.length > 0 ? (
                dashboardData.matchedJobs.slice(0, 3).map(job => (
                  <JobCard key={job.id} job={job} />
                ))
              ) : (
                <p style={{ color: '#6c757d' }}>No matched jobs at the moment.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="jobs-tab-content">
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ borderBottom: '1px solid #dee2e6', paddingBottom: '10px', marginBottom: '15px' }}>My Gigs Matched Jobs</h3>
              <div style={{ display: 'grid', gap: '20px' }}>
                {dashboardData.matchedJobs.length > 0 ? (
                  dashboardData.matchedJobs.map(job => (
                    <JobCard key={job.id} job={job} />
                  ))
                ) : (
                  <p style={{ color: '#6c757d' }}>No matched jobs found for your gigs.</p>
                )}
              </div>
            </div>
            <div>
              <h3 style={{ borderBottom: '1px solid #dee2e6', paddingBottom: '10px', marginBottom: '15px' }}>Search All Jobs</h3>
              <button
                onClick={() => window.location.href = '/jobs'}
                style={{
                  padding: '12px 25px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '1.1em',
                  fontWeight: '600',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                  transition: 'background-color 0.3s ease, transform 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
              >
                Browse All Jobs
              </button>
            </div>
          </div>
        )}

        {activeTab === 'gigs' && (
          <div className="gigs-tab-content" style={{ display: 'grid', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #dee2e6', paddingBottom: '10px', marginBottom: '15px' }}>
              <h3 style={{ margin: 0 }}>My Gigs</h3>
              <button
                onClick={() => setIsGigFormOpen(true)}
                style={{
                  padding: '10px 15px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1em',
                  fontWeight: '500',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'background-color 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
              >
                ➕ Add New Gig
              </button>
            </div>
            {dashboardData.myGigs.length > 0 ? (
              dashboardData.myGigs.map(gig => (
                <TutorCard key={gig.id} tutor={gig} />
              ))
            ) : (
              <p style={{ color: '#6c757d', textAlign: 'center' }}>You haven't created any gigs yet. Click "Add New Gig" to get started!</p>
            )}
          </div>
        )}

        {activeTab === 'wallet' && (
          <div className="wallet-tab-content" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '25px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              borderLeft: '5px solid #28a745'
            }}>
              <h3 style={{ color: '#28a745', marginBottom: '15px' }}>Credit Wallet</h3>
              <p style={{ fontSize: '1.2em', marginBottom: '10px' }}><strong>Available Credits:</strong> <span style={{ color: '#28a745', fontWeight: 'bold' }}>{dashboardData.earnings.total}</span></p>
              <p style={{ fontSize: '1em', marginBottom: '5px' }}>Pending: {dashboardData.earnings.pending}</p>
              <p style={{ fontSize: '1em' }}>Completed: {dashboardData.earnings.completed}</p>
              <button
                onClick={handleBuyCredits}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginTop: '20px',
                  fontSize: '1em',
                  fontWeight: '500',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'background-color 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#218838'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#28a745'}
              >
                Buy Credits
              </button>
            </div>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '25px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              borderLeft: '5px solid #6c757d'
            }}>
              <h3 style={{ color: '#6c757d', marginBottom: '15px' }}>Payments</h3>
              <p style={{ marginBottom: '10px' }}>Configure your payout account.</p>
              <p>Review your transaction history.</p>
              <button
                onClick={() => alert('Navigate to payment history page!')} // Placeholder for navigation
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginTop: '20px',
                  fontSize: '1em',
                  fontWeight: '500',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'background-color 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5a6268'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
              >
                View Payment History
              </button>
            </div>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '25px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              borderLeft: '5px solid #17a2b8'
            }}>
              <h3 style={{ color: '#17a2b8', marginBottom: '15px' }}>Refer & Earn</h3>
              <p style={{ marginBottom: '10px' }}>Invite friends to the platform and earn free credits when they sign up and complete their first lesson!</p>
              <button
                onClick={() => alert('Navigate to refer & earn page!')} // Placeholder for navigation
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginTop: '20px',
                  fontSize: '1em',
                  fontWeight: '500',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'background-color 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#138496'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#17a2b8'}
              >
                Invite Friends
              </button>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="profile-tab-content" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '25px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              borderLeft: '5px solid #007bff'
            }}>
              <h3 style={{ color: '#007bff', marginBottom: '15px' }}>Edit Profile</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '10px', fontSize: '1em' }}>➡️ Personal details (Name, Bio, etc.)</li>
                <li style={{ marginBottom: '10px', fontSize: '1em' }}>➡️ Photo upload</li>
                <li style={{ marginBottom: '10px', fontSize: '1em' }}>➡️ Gigs management (set live/hide status)</li>
                <li style={{ marginBottom: '10px', fontSize: '1em' }}>➡️ Address</li>
                <li style={{ marginBottom: '10px', fontSize: '1em' }}>➡️ Education & experience</li>
                <li style={{ marginBottom: '10px', fontSize: '1em' }}>➡️ Teaching details (subjects, grades)</li>
                <li style={{ marginBottom: '10px', fontSize: '1em' }}>➡️ Profile description</li>
                <li style={{ marginBottom: '10px', fontSize: '1em' }}>➡️ Phone number</li>
              </ul>
              <button
                onClick={() => alert('Navigate to profile edit page!')} // Placeholder for navigation
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginTop: '20px',
                  fontSize: '1em',
                  fontWeight: '500',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'background-color 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
              >
                Edit Profile Now
              </button>
            </div>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '25px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              borderLeft: '5px solid #fd7e14'
            }}>
              <h3 style={{ color: '#fd7e14', marginBottom: '15px' }}>Additional Settings</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '10px', fontSize: '1em' }}>⚙️ Promote yourself (marketing tools)</li>
                <li style={{ marginBottom: '10px', fontSize: '1em' }}>⚙️ Contact settings (communication preferences)</li>
                <li style={{ marginBottom: '10px', fontSize: '1em' }}>⚙️ Profile picture upload</li>
                <li style={{ marginBottom: '10px', fontSize: '1em' }}>⚙️ Credits balance display options</li>
                <li style={{ marginBottom: '10px', fontSize: '1em' }}>⚙️ My profile & gigs preview</li>
              </ul>
              <button
                onClick={() => alert('Navigate to settings page!')} // Placeholder for navigation
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#fd7e14',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginTop: '20px',
                  fontSize: '1em',
                  fontWeight: '500',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'background-color 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e06b00'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fd7e14'}
              >
                Adjust Settings
              </button>
            </div>
          </div>
        )}

        {activeTab === 'premium' && (
          <div className="premium-tab-content" style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '40px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            textAlign: 'center',
            borderTop: '5px solid #ffc107'
          }}>
            <h2 style={{ color: '#ffc107', fontSize: '2.2em', marginBottom: '20px' }}>🌟 Unlock Premium Features 🌟</h2>
            <p style={{ fontSize: '1.2em', color: '#495057', marginBottom: '30px' }}>
              Elevate your teaching career with exclusive benefits:
            </p>
            <ul style={{
              textAlign: 'left',
              maxWidth: '500px',
              margin: '20px auto 40px',
              listStyle: 'none',
              padding: 0,
              fontSize: '1.1em'
            }}>
              <li style={{ marginBottom: '15px' }}>✨ Priority listing in search results for more visibility.</li>
              <li style={{ marginBottom: '15px' }}>📊 Advanced analytics and insights into your profile and gig performance.</li>
              <li style={{ marginBottom: '15px' }}>🚀 Unlimited gig postings to showcase all your expertise.</li>
              <li style={{ marginBottom: '15px' }}>✉️ Direct messaging with students for faster communication.</li>
              <li style={{ marginBottom: '15px' }}>Profile verification badge to build trust.</li>
            </ul>
            <button
              onClick={handleUpgradePremium} // Call the new handler
              style={{
                padding: '18px 40px',
                backgroundColor: '#ffc107',
                color: '#212529',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '20px',
                fontWeight: 'bold',
                boxShadow: '0 8px 15px rgba(255,193,7,0.4)',
                transition: 'background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e0a800'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffc107'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Upgrade to Premium Now!
            </button>
          </div>
        )}
      </div>

      {/* Forms Overlay */}
      {isGigFormOpen && (
        <GigPostForm
          onClose={() => setIsGigFormOpen(false)}
          onGigCreated={handleGigCreated}
        />
      )}
    </div>
    </>
  
  );
};

export default TeacherDashboard;
