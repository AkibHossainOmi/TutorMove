import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GigPostForm from '../components/GigPostForm';
import JobCard from '../components/JobCard';
// import TutorCard from '../components/TutorCard'; // Removed as we are using a custom GigItemCard
import LoadingSpinner from '../components/LoadingSpinner';
import Navbar from '../components/Navbar';

/**
 * Custom hook for managing notifications.
 * Provides a function to show notifications (currently logs to console)
 * and state for a list of notifications.
 */
const useNotification = () => {
  const [notifications, setNotifications] = useState([]);

  /**
   * Displays a notification message.
   * @param {string} message - The notification message.
   * @param {'success'|'error'|'info'} type - The type of notification.
   */
  const showNotification = (message, type) => {
    console.log(`Notification (${type}): ${message}`);
    // In a real application, you might update the notifications state
    // For example: setNotifications(prev => [...prev, { id: Date.now(), message, type, isRead: false }]);
  };

  return { showNotification, notifications, setNotifications };
};

/**
 * Custom hook for managing chat-related functionalities.
 * Provides a function to open chat and a mock unread count.
 */
const useChat = () => ({
  /**
   * Logs a message indicating that a chat is being opened.
   * @param {string} chatId - The ID of the chat to open.
   */
  openChat: (chatId) => console.log(`Opening chat ${chatId}`),
  unreadCount: 0 // Mock unread count
});

/**
 * Mock API functions for job-related operations.
 */
const jobAPI = {
  /**
   * Fetches mock matched jobs.
   * @returns {Promise<Object>} A promise resolving to mock job data.
   */
  getMatchedJobs: async () => ({ data: { results: [] } }),
  /**
   * Fetches mock user applications.
   * @returns {Promise<Object>} A promise resolving to mock application data.
   */
  getMyApplications: async () => ({ data: { results: [] } })
};

/**
 * API functions for tutor-related operations.
 */
const tutorAPI = {
  /**
   * Fetches tutor gigs for a given teacher ID.
   * Assumes the API returns gig objects with 'title', 'description', 'subject', and 'created_at'.
   * @param {string} teacherId - The ID of the teacher.
   * @returns {Promise<Array|Object>} A promise resolving to the gig data (array or object with results key).
   * @throws {Error} If there's an error fetching the gigs.
   */
  getTutorGigs: async (teacherId) => {
    try {
      // Corrected API endpoint for fetching gigs by teacher ID
      const response = await axios.get(`http://localhost:8000/api/gigs/teacher/${teacherId}/`);
      // Assuming Django API returns an array of gig objects directly or within a 'results' key
      return response.data;
    } catch (error) {
      console.error("Error fetching tutor gigs:", error.response ? error.response.data : error.message);
      // Re-throw to be caught by the calling function (loadDashboardData)
      throw error;
    }
  }
};

/**
 * A placeholder button for teacher verification.
 * This component has no actual functionality in this snippet.
 */
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

/**
 * Component to display individual gig information in a card format.
 * It expects a 'gig' object with 'title', 'description', 'subject', and 'created_at'.
 * @param {Object} props - The component props.
 * @param {Object} props.gig - The gig object to display.
 */
const GigItemCard = ({ gig }) => {
  // Destructure the required properties from the gig object
  const { title, description, subject, created_at } = gig;

  return (
    <div className="gig-card" style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      borderLeft: '5px solid #007bff',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      transition: 'transform 0.2s ease-in-out',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <h4 style={{ margin: '0', color: '#343a40', fontSize: '1.2em' }}>{title || 'No Title'}</h4>
      <p style={{ margin: '0', color: '#6c757d', fontSize: '0.9em', flexGrow: 1 }}>
        {description || 'No description provided.'}
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85em', color: '#495057' }}>
        <span style={{ backgroundColor: '#e9ecef', padding: '4px 8px', borderRadius: '4px', fontWeight: '500' }}>
          Subject: {subject || 'N/A'}
        </span>
        <span style={{ color: '#6c757d' }}>
          Created: {created_at ? new Date(created_at).toLocaleDateString() : 'N/A'}
        </span>
      </div>
    </div>
  );
};


/**
 * The main Teacher Dashboard component.
 * Displays various information relevant to a tutor, including gigs, jobs, and wallet.
 */
const TeacherDashboard = () => {
  const { showNotification, notifications, setNotifications } = useNotification();
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
      activeGigs: 0,
      completedJobs: 0,
    }
  });

  const CREDIT_PURCHASE_ENDPOINT = `http://localhost:8000/api/credits/purchase/`;
  const PREMIUM_UPGRADE_ENDPOINT = `/api/premium/upgrade/`; // Not used in the provided snippet
  const MOCK_USER_ID = '1';

  /**
   * useEffect hook to load user data from localStorage and then dashboard data.
   * Runs once on component mount.
   */
  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser && storedUser.user_type === 'tutor') {
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
   * Fetches and updates the dashboard data for the current user.
   * @param {Object} currentUser - The current user object, including user_id.
   */
  const loadDashboardData = async (currentUser) => {
    setIsLoading(true);
    try {
      if (!currentUser || !currentUser.user_id) {
        showNotification("User ID not found. Cannot fetch dashboard data.", 'error');
        return;
      }

      const gigsData = await tutorAPI.getTutorGigs(currentUser.user_id); // This already returns response.data

      // Safely determine myGigs from gigsData
      let myGigs = [];
      if (gigsData && Array.isArray(gigsData.results)) {
        myGigs = gigsData.results; // If it's paginated, like { count: N, results: [...] }
      } else if (gigsData && Array.isArray(gigsData)) {
        myGigs = gigsData; // If it's a direct array of gigs
      } else {
        // Fallback if data format is unexpected or empty
        console.warn("Unexpected gig data format or no gigs found:", gigsData);
        myGigs = [];
      }

      const matchedJobsResponse = await jobAPI.getMatchedJobs();
      const applicationsResponse = await jobAPI.getMyApplications();

      setDashboardData(prev => ({
        ...prev,
        myGigs: myGigs, // Use the safely determined myGigs
        matchedJobs: matchedJobsResponse.data.results || [],
        applications: applicationsResponse.data.results || [],
        earnings: {
          total: myGigs.length * 50, // Example calculation
          pending: myGigs.filter(gig => gig.status === 'pending').length * 20, // Example calculation
          completed: myGigs.filter(gig => gig.status === 'completed').length * 50 // Example calculation
        },
        stats: {
          activeGigs: myGigs.filter(gig => gig.status === 'active').length || 0,
          completedJobs: applicationsResponse.data.results?.filter(app => app.status === 'completed').length || 0,
        }
      }));
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      showNotification(
        `Failed to load dashboard data: ${error.message || 'Network error'}`,
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles the successful creation of a new gig.
   * Adds the new gig to the dashboard data and closes the form.
   * @param {Object} newGig - The newly created gig object.
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
   * Renders a statistic card with a title, value, icon, and color.
   * @param {Object} props - The component props.
   * @param {string} props.title - The title of the stat card.
   * @param {string|number} props.value - The value to display.
   * @param {string} props.icon - The emoji icon for the card.
   * @param {string} props.color - The color theme for the card.
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

  const [statusMessage, setStatusMessage] = useState('');
  const [showSpinner, setShowSpinner] = useState(false);

  /**
   * Displays a loading spinner and a status message.
   * @param {string} [message='Processing payment...'] - The message to display while loading.
   */
  function showLoading(message = 'Processing payment...') {
    setShowSpinner(true);
    setStatusMessage(message);
  }

  /**
   * Hides the loading spinner and clears the status message.
   */
  function hideLoading() {
    setShowSpinner(false);
    setStatusMessage('');
  }

  /**
   * Displays a status message (and logs to console).
   * @param {string} message - The message to display.
   * @param {boolean} [isError=false] - Whether the message indicates an error.
   */
  function showStatus(message, isError = false) {
    setStatusMessage(message);
    console.log(isError ? `ERROR: ${message}` : `SUCCESS: ${message}`);
  }

  /**
   * Handles the action of buying credits, initiating a payment process.
   */
  const handleBuyCredits = async () => {
    showLoading('Initiating credit purchase...');
    try {
      const purchaseData = {
        credits: 10,
        amount: 100.00,
        user_id: user?.user_id || MOCK_USER_ID
      };

      const response = await axios.post(
        CREDIT_PURCHASE_ENDPOINT,
        purchaseData,
        {
          headers: {
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


  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Access denied message if user is not a tutor
  if (!user || user.user_type !== 'tutor') {
    return (
      <>
        <Navbar />
        <div style={{ height: '100px' }}></div>
        <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2>Access Denied</h2>
          <p>You must be a **tutor** to access this dashboard. Your current role is: **{user?.user_type || 'Unknown'}**</p>
          {user?.user_type === 'teacher' && (
            <p>Please navigate to the **Teacher Dashboard**.</p>
          )}
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
      <div style={{ height: '100px' }}></div> {/* Spacer for fixed navbar */}
      <div className="teacher-dashboard-container" style={{
        padding: '30px',
        maxWidth: '1200px',
        margin: '0 auto',
        fontFamily: 'Inter, sans-serif',
        color: '#343a40'
      }}>
        {/* Dashboard Header Section */}
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
            {/* Notifications Button */}
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

            {/* Buy Credits Button */}
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

        {/* Loading/Status Message Area */}
        {showSpinner && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '15px 0', color: '#555' }}>
            <div className="loading-spinner" style={{ display: 'block', marginRight: '10px' }}></div>
            <span>{statusMessage}</span>
          </div>
        )}
        {!showSpinner && statusMessage && (
          <p className="status-message" style={{ textAlign: 'center', marginTop: '15px' }}>{statusMessage}</p>
        )}

        {/* Statistics Cards */}
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
            title="Completed Jobs"
            value={dashboardData.stats.completedJobs}
            icon="✅"
            color="#fd7e14"
          />
        </div>

        {/* Tab Navigation */}
        <div style={{
          borderBottom: '1px solid #dee2e6',
          marginBottom: '20px',
          overflowX: 'auto',
          whiteSpace: 'nowrap'
        }}>
          <div style={{ display: 'flex', gap: '20px', paddingBottom: '10px' }}>
            {['jobs', 'gigs', 'wallet', 'premium'].map(tab => (
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
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Area */}
        <div style={{ marginTop: '20px' }}>

          {/* Jobs Tab Content */}
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

          {/* Gigs Tab Content - NOW USING GigItemCard */}
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
                dashboardData.myGigs.map((gig) => { // Changed to explicit return
                  return <GigItemCard key={gig.id} gig={gig} />; // Renders the new GigItemCard
                })
              ) : (
                <p style={{ color: '#6c757d', textAlign: 'center' }}>You haven't created any gigs yet. Click "Add New Gig" to get started!</p>
              )}
            </div>
          )}

          {/* Wallet Tab Content */}
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
                  // Using console.log instead of alert() for better user experience within an iframe
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
                  // Using console.log instead of alert() for better user experience within an iframe
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

          {/* Add Premium Tab content if needed */}
          {activeTab === 'premium' && (
            <div className="premium-tab-content">
              <h3>Premium Features</h3>
              <p>Upgrade to unlock exclusive features and benefits!</p>
              {/* Add premium upgrade button/info here */}
            </div>
          )}

        </div>

        {/* Gig Post Form Modal */}
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
