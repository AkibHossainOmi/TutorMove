import React, { useState, useEffect } from 'react';
import axios from 'axios';

// --- Mock Components for a Self-Contained Example ---
// In a real application, these would be in separate files (e.g., components/GigPostForm.js)

// Mock for i18n's useTranslation to avoid external dependency issues in this environment
const useTranslation = () => ({ t: (key) => key });

// Mock GigPostForm component
const GigPostForm = ({ onClose, onGigCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate gig creation with a mock ID and active status
    const newGig = {
      id: `mock-gig-${Date.now()}`,
      title,
      description,
      subject,
      status: 'active', // Ensure new gigs are 'active' for stats
      teacher: 1, // Mock teacher ID
      latitude: null,
      longitude: null,
      created_at: new Date().toISOString(),
      contact_info: 'mock@example.com'
    };
    onGigCreated(newGig); // Pass the new gig to the parent component
    onClose(); // Close the form
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 2000
    }}>
      <div style={{
        backgroundColor: 'white', padding: '30px', borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)', maxWidth: '500px', width: '90%'
      }}>
        <h2 style={{ marginBottom: '20px', color: '#343a40' }}>Create a New Gig</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="gigTitle" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Title:</label>
            <input
              type="text"
              id="gigTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{
                width: '100%', padding: '10px', borderRadius: '4px',
                border: '1px solid #ced4da', boxSizing: 'border-box'
              }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="gigDescription" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Description:</label>
            <textarea
              id="gigDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows="4"
              style={{
                width: '100%', padding: '10px', borderRadius: '4px',
                border: '1px solid #ced4da', boxSizing: 'border-box'
              }}
            ></textarea>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="gigSubject" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Subject:</label>
            <input
              type="text"
              id="gigSubject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              style={{
                width: '100%', padding: '10px', borderRadius: '4px',
                border: '1px solid #ced4da', boxSizing: 'border-box'
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px', backgroundColor: '#6c757d', color: 'white',
                border: 'none', borderRadius: '4px', cursor: 'pointer',
                transition: 'background-color 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5a6268'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 20px', backgroundColor: '#007bff', color: 'white',
                border: 'none', borderRadius: '4px', cursor: 'pointer',
                transition: 'background-color 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
            >
              Create Gig
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Mock JobCard component
const JobCard = ({ job }) => (
  <div style={{
    backgroundColor: 'white', borderRadius: '8px', padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '15px',
    borderLeft: '4px solid #17a2b8'
  }}>
    <h4 style={{ margin: '0 0 10px', color: '#17a2b8' }}>{job.title}</h4>
    <p style={{ margin: '0 0 5px', fontSize: '0.9em', color: '#495057' }}>{job.description}</p>
    <p style={{ margin: 0, fontSize: '0.8em', color: '#6c757d' }}>Budget: {job.budget}</p>
  </div>
);

// Mock TutorCard component
const TutorCard = ({ tutor }) => (
  <div style={{
    backgroundColor: 'white', borderRadius: '8px', padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '15px',
    borderLeft: '4px solid #28a745'
  }}>
    <h4 style={{ margin: '0 0 10px', color: '#28a745' }}>{tutor.title}</h4>
    <p style={{ margin: '0 0 5px', fontSize: '0.9em', color: '#495057' }}>Subject: {tutor.subject}</p>
    <p style={{ margin: 0, fontSize: '0.8em', color: '#6c757d' }}>{tutor.description}</p>
  </div>
);

// Mock LoadingSpinner component
const LoadingSpinner = () => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: '100vh', flexDirection: 'column', gap: '20px',
    backgroundColor: '#f8f9fa', color: '#007bff'
  }}>
    <style>
      {`
        .loading-spinner-lg {
          border: 8px solid rgba(0, 0, 0, 0.1);
          border-left-color: #007bff;
          border-radius: 50%;
          width: 60px;
          height: 60px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}
    </style>
    <div className="loading-spinner-lg"></div>
    <p style={{ fontSize: '1.2em' }}>Loading dashboard data...</p>
  </div>
);

// Mock WelcomeBanner component
const WelcomeBanner = () => (
  <div style={{
    backgroundColor: '#e9ecef', padding: '20px', borderRadius: '8px',
    textAlign: 'center', marginBottom: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  }}>
    <h2 style={{ color: '#343a40', margin: '0 0 10px' }}>Welcome to Your Teacher Dashboard!</h2>
    <p style={{ color: '#6c757d', margin: 0 }}>Manage your gigs, find jobs, track earnings, and grow your teaching career.</p>
  </div>
);

// Mock Navbar component
const Navbar = () => (
  <nav style={{
    backgroundColor: '#343a40', color: 'white', padding: '15px 30px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
  }}>
    <div style={{ fontSize: '1.5em', fontWeight: 'bold' }}>TutorLink</div>
    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', gap: '25px' }}>
      <li><a href="/" style={{ color: 'white', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Home</a></li>
      <li><a href="/find-tutors" style={{ color: 'white', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Find Tutors</a></li>
      <li><a href="/jobs" style={{ color: 'white', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Find Jobs</a></li>
      <li><a href="/dashboard" style={{ color: 'white', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Dashboard</a></li>
      <li><a href="/profile" style={{ color: 'white', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Profile</a></li>
      <li><a href="/logout" style={{ color: 'white', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Logout</a></li>
    </ul>
  </nav>
);

// Mock implementations for context hooks
const useNotification = () => {
  const [notifications, setNotifications] = useState([
    { id: 'n1', message: 'New student inquiry!', isRead: false, created_at: new Date().toISOString() },
    { id: 'n2', message: 'Your gig "Math Tutor" is live!', isRead: true, created_at: new Date().toISOString() },
    { id: 'n3', message: 'Profile updated successfully!', isRead: false, created_at: new Date().toISOString() },
  ]);

  const showNotification = (message, type) => {
    console.log(`Notification (${type}): ${message}`);
  };

  return { showNotification, notifications };
};

const useChat = () => ({
  openChat: (chatId) => console.log(`Opening chat ${chatId}`),
  unreadCount: 3
});


// --- API Service Stubs ---
// IMPORTANT: Define your Django base URL here
const DJANGO_BASE_URL = 'http://localhost:8000'; // Or your deployed backend URL

const jobAPI = {
  getMatchedJobs: async (userId, config) => {
    console.warn("jobAPI.getMatchedJobs is a stub. Replace with actual API call to your Django backend.");
    return { data: { results: [
      { id: 'job1', title: 'Mathematics Tutor Needed', description: 'Seeking a tutor for high school math.', budget: '500 BDT/hr' },
      { id: 'job2', title: 'Physics Homework Help', description: 'Looking for help with university level physics.', budget: '700 BDT/hr' }
    ] } };
  },
  getMyApplications: async (userId, config) => {
    console.warn("jobAPI.getMyApplications is a stub. Replace with actual API call to your Django backend.");
    return { data: { results: [
      { id: 'app1', jobId: 'job1', status: 'pending', applied_at: new Date().toISOString() },
      { id: 'app2', jobId: 'job2', status: 'completed', applied_at: new Date().toISOString() }
    ] } };
  }
};

const tutorAPI = {
  getTutorGigs: async ({ teacherId, config }) => {
    try {
      const response = await axios.get(`${DJANGO_BASE_URL}/api/gigs/teacher/${teacherId}/`, config);
      console.log("Raw API response data for gigs:", response.data);
      // Return the data directly, as it's already the array of gigs
      return response.data;
    } catch (error) {
      console.error("Error fetching tutor gigs:", error.response ? error.response.data : error.message);
      throw error;
    }
  }
};
// --- End API Service Stubs ---


// TeacherVerificationButton component
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
      fontWeight: 'bold',
      transition: 'background-color 0.3s ease'
    }}
    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0a800'}
    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffc107'}
  >
    Verify Teacher Status
  </button>
);


const TeacherDashboard = () => {
  const { t } = useTranslation();

  const { showNotification, notifications } = useNotification();
  const { unreadCount } = useChat();

  const [user, setUser] = useState(null);
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

  const CREDIT_PURCHASE_ENDPOINT = `${DJANGO_BASE_URL}/api/credits/purchase/`;
  const PREMIUM_UPGRADE_ENDPOINT = `${DJANGO_BASE_URL}/api/premium/upgrade/`;


  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      // Added a mock user if localStorage is empty for demonstration purposes
      if (!storedUser) {
        const mockUser = { user_id: 3, username: 'MockTutor', user_type: 'tutor' };
        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('access_token', 'mock_access_token'); // Mock token
        setUser(mockUser);
        loadDashboardData(mockUser);
      } else if (storedUser.user_type === 'tutor') {
        setUser(storedUser);
        loadDashboardData(storedUser);
      } else {
        setIsLoading(false);
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage:", error);
      setIsLoading(false);
      setUser(null);
    }
  }, []);

  /**
   * Loads all necessary dashboard data from API endpoints.
   * Updates the dashboardData state and handles loading state.
   * @param {object} currentUser - The user object (from localStorage).
   */
  const loadDashboardData = async (currentUser) => {
    setIsLoading(true);
    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      };

      // Correctly handle the response structure from tutorAPI.getTutorGigs
      const gigsResponse = await tutorAPI.getTutorGigs({ teacherId: currentUser.user_id, config });
      const matchedJobsResponse = await jobAPI.getMatchedJobs(currentUser.user_id, config);
      const applicationsResponse = await jobAPI.getMyApplications(currentUser.user_id, config);

      setDashboardData(prevData => ({
        ...prevData,
        myGigs: gigsResponse || [], // `gigsResponse` is already the array
        matchedJobs: matchedJobsResponse.data.results || [],
        applications: applicationsResponse.data.results || [],
        // Mocked earnings and stats, replace with actual API data
        earnings: {
          total: 1500,
          pending: 300,
          completed: 1200
        },
        stats: {
          totalViews: 567,
          activeGigs: (gigsResponse || []).filter(gig => gig.status === 'active').length,
          completedJobs: (applicationsResponse.data.results || []).filter(app => app.status === 'completed').length,
          totalStudents: 15
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
      gap: '15px',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <div style={{
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        backgroundColor: `${color}20`,
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
    console.log(isError ? `ERROR: ${message}` : `SUCCESS: ${message}`);
  }


  /**
   * Handles the "Buy Credits" button click event.
   * Makes an API call to the backend to initiate payment for credits.
   */
  const handleBuyCredits = async () => {
    showLoading('Initiating credit purchase...');
    try {
      if (!user || !user.user_id) {
        showStatus('User not logged in or user ID not available.', true);
        hideLoading();
        return;
      }

      const purchaseData = {
        credits: 10,
        amount: 100.00,
        user_id: user.user_id
      };

      const response = await axios.post(
        CREDIT_PURCHASE_ENDPOINT,
        purchaseData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      hideLoading();
      if (response.data.status === 'SUCCESS' && response.data.payment_url) {
        showStatus('Redirecting to SSLCommerz...', false);
        window.location.href = response.data.payment_url;
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
      if (!user || !user.user_id) {
        showStatus('User not logged in or user ID not available.', true);
        hideLoading();
        return;
      }

      const upgradeData = {
        plan: 'monthly',
        user_id: user.user_id
      };

      const response = await axios.post(
        PREMIUM_UPGRADE_ENDPOINT,
        upgradeData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      hideLoading();
      if (response.data.status === 'SUCCESS' && response.data.payment_url) {
        showStatus('Redirecting to SSLCommerz...', false);
        window.location.href = response.data.payment_url;
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


  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Access control: Ensure only 'tutor' type users can see this dashboard
  if (!user || user.user_type !== 'tutor') {
    return (
      <>
        <Navbar />
        <div style={{ height: '100px' }}></div>
        <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2>Access Denied</h2>
          <p>You must be a **tutor** to access this dashboard. Your current role is: **{user?.user_type || 'Unknown'}**</p>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '15px'
            }}
          >
            Go to Home
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={{ height: '100px' }}></div>
      <div className="teacher-dashboard-container" style={{
        padding: '30px',
        maxWidth: '1200px',
        margin: '0 auto',
        fontFamily: 'Inter, sans-serif',
        color: '#343a40'
      }}>
        <WelcomeBanner />

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '30px',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '10px'
          }}>
            <h1 style={{ margin: 0, color: '#212529', fontSize: '2em' }}>
              Teacher Dashboard - Welcome, {user?.username}!
            </h1>
            <TeacherVerificationButton />
          </div>

          <div style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            flexWrap: 'wrap',
            justifyContent: 'flex-end'
          }}>
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
                  top: 'calc(100% + 10px)',
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
                        backgroundColor: notification.isRead ? 'white' : '#eaf4ff',
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
                      onClick={() => window.location.href = '/messages'}
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

            <button
              onClick={handleBuyCredits}
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

        {showSpinner && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '15px 0', color: '#555' }}>
            <style>
              {`
                .loading-spinner {
                  border: 4px solid rgba(0, 0, 0, 0.1);
                  border-left-color: #007bff;
                  border-radius: 50%;
                  width: 24px;
                  height: 24px;
                  animation: spin 1s linear infinite;
                }
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}
            </style>
            <div className="loading-spinner" style={{ marginRight: '10px' }}></div>
            <span>{statusMessage}</span>
          </div>
        )}
        {!showSpinner && statusMessage && (
          <p className="status-message" style={{ textAlign: 'center', marginTop: '15px', color: statusMessage.includes('Error') ? '#dc3545' : '#28a745' }}>{statusMessage}</p>
        )}

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

        <div style={{
          borderBottom: '1px solid #dee2e6',
          marginBottom: '20px',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          scrollbarWidth: 'none',
          MsOverflowStyle: 'none'
        }}>
          <style>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          <div style={{ display: 'flex', gap: '20px', paddingBottom: '10px' }}>
            {['overview', 'jobs', 'gigs', 'wallet', 'profile', 'premium'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderBottom: activeTab === tab ? '3px solid #007bff' : 'none',
                  backgroundColor: 'transparent',
                  color: activeTab === tab ? '#007bff' : '#6c757d',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: activeTab === tab ? '600' : 'normal',
                  flexShrink: 0,
                  transition: 'color 0.3s ease, border-bottom 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#007bff'}
                onMouseLeave={(e) => e.currentTarget.style.color = activeTab === tab ? '#007bff' : '#6c757d'}
              >
                {t(tab.charAt(0).toUpperCase() + tab.slice(1))}
              </button>
            ))}
          </div>
        </div>

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
                <p style={{ fontSize: '1.2em', marginBottom: '10px' }}>**Available Credits:** <span style={{ color: '#28a745', fontWeight: 'bold' }}>{dashboardData.earnings.total}</span></p>
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
                  onClick={() => console.log('Navigate to payment history page!')}
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
                  onClick={() => console.log('Navigate to refer & earn page!')}
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
                  onClick={() => console.log('Navigate to profile edit page!')}
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
                  onClick={() => console.log('Navigate to settings page!')}
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
              borderTop: '5px solid #ffc107',
              maxWidth: '800px',
              margin: '0 auto'
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
                onClick={handleUpgradePremium}
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