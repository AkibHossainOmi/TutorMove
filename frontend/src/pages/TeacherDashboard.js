import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GigPostForm from '../components/GigPostForm';
import JobCard from '../components/JobCard';
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
    // In a real application, you would typically add to the notifications state here
    setNotifications(prev => [...prev, { id: Date.now(), message, type, isRead: false, created_at: new Date().toISOString() }]);
  };

  // Mark a notification as read (example)
  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  return { showNotification, notifications, setNotifications, markAsRead };
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
  unreadCount: 0 // This remains a mock unread count as no API is provided for it.
});

/**
 * API functions for job-related operations.
 * These are kept as mocks since no specific job API endpoints were provided for actual data.
 */
const jobAPI = {
  /**
   * Fetches mock matched jobs.
   * In a real app, this would fetch from a /api/jobs/matched/ endpoint.
   * @returns {Promise<Object>} A promise resolving to mock job data.
   */
  getMatchedJobs: async () => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      data: {
        results: [
          // Example mock job if no real data comes
          // { id: 101, title: 'Math Tutor Needed (Grade 10)', description: 'Seeking a tutor for algebra and geometry.', subject: 'Mathematics', budget: 50, status: 'open' },
          // { id: 102, title: 'English Essay Help', description: 'Assistance with college application essays.', subject: 'English', budget: 70, status: 'open' },
        ]
      }
    };
  },
  /**
   * Fetches mock user applications.
   * In a real app, this would fetch from a /api/applications/my/ endpoint.
   * @returns {Promise<Object>} A promise resolving to mock application data.
   */
  getMyApplications: async () => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 400));
    return {
      data: {
        results: [
          // Example mock application
          // { id: 201, jobId: 101, status: 'pending', appliedDate: '2025-06-20' }
        ]
      }
    };
  }
};

/**
 * API functions for tutor-related operations.
 */
const tutorAPI = {
  /**
   * Fetches tutor gigs for a given teacher ID.
   * Assumes the API returns gig objects with 'id', 'title', 'description', 'subject', and 'created_at'.
   * @param {string} teacherId - The ID of the teacher.
   * @returns {Promise<Array>} A promise resolving to an array of gig data.
   * @throws {Error} If there's an error fetching the gigs.
   */
  getTutorGigs: async (teacherId) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/gigs/teacher/${teacherId}/`);
      // API might return an array directly or an object with a 'results' key (for pagination)
      // We normalize it to always return an array
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
      console.error("Error fetching tutor gigs:", error.response?.data || error.message);
      throw error;
    }
  }
};

/**
 * API functions for credit-related operations.
 */
const creditAPI = {
  /**
   * Fetches the credit balance for a given user ID.
   * @param {string} userId - The ID of the user.
   * @returns {Promise<Object>} A promise resolving to the credit balance data { user_id: number, balance: number }.
   * @throws {Error} If there's an error fetching the credit balance.
   */
  getUserCredits: async (userId) => {
    try {
      // Assuming a mock for now if credit endpoint is not fully implemented
      // In a real scenario, replace this with your actual API call:
      const response = await axios.get(`http://localhost:8000/api/credit/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user credits:", error.response?.data || error.message);
      // For demonstration, return a mock balance if API fails
      // In production, you might want to throw or handle more explicitly
      return { user_id: userId, balance: 0 }; // Return 0 credits on error
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
 * It expects a 'gig' object with 'id', 'title', 'description', 'subject', and 'created_at'.
 * @param {Object} props - The component props.
 * @param {Object} props.gig - The gig object to display.
 */
const GigItemCard = ({ gig }) => {
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
  const { showNotification, notifications, setNotifications, markAsRead } = useNotification();
  const { unreadCount } = useChat(); // unreadCount remains mock as no API is provided

  const [user, setUser] = useState(null);
  const [isGigFormOpen, setIsGigFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false); // Renamed to avoid confusion
  // New state for the insufficient credits modal
  const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);

  // Initial dashboard data with actual defaults instead of mock values
  const [dashboardData, setDashboardData] = useState({
    myGigs: [],
    matchedJobs: [],
    applications: [],
    earnings: {
      total: 0, // Will be fetched from credit API
      pending: 0, // Should be calculated from real gig/job data
      completed: 0 // Should be calculated from real gig/job data
    },
    stats: {
      activeGigs: 0, // Calculated from myGigs
      completedJobs: 0, // Calculated from applications
      creditBalance: 0, // Fetched from credit API
    }
  });

  // Removed CREDIT_PURCHASE_ENDPOINT as it's now handled by BuyCreditPage
  // Removed statusMessage, showSpinner, showLoading, hideLoading, showStatus as they are no longer needed here.

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
        // If no user or not a tutor, set loading to false and user to null
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
        setIsLoading(false);
        return;
      }

      // Fetch all data concurrently
      const [gigsData, creditBalanceData, matchedJobsResponse, applicationsResponse] = await Promise.all([
        tutorAPI.getTutorGigs(currentUser.user_id),
        creditAPI.getUserCredits(currentUser.user_id),
        jobAPI.getMatchedJobs(), // This is still a mock
        jobAPI.getMyApplications(), // This is still a mock
      ]);

      const myGigs = gigsData || []; // Ensure it's an array
      const matchedJobs = matchedJobsResponse.data?.results || [];
      const applications = applicationsResponse.data?.results || [];
      const creditBalance = creditBalanceData.balance || 0;

      setDashboardData(prev => ({
        ...prev,
        myGigs: myGigs,
        matchedJobs: matchedJobs,
        applications: applications,
        earnings: {
          total: creditBalance, // Directly from API
          // These calculations remain example-based as real logic is not provided
          pending: myGigs.filter(gig => gig.status === 'pending').length * 20,
          completed: myGigs.filter(gig => gig.status === 'completed').length * 50
        },
        stats: {
          activeGigs: myGigs.filter(gig => gig.status === 'active').length || 0,
          completedJobs: applications.filter(app => app.status === 'completed').length || 0,
          creditBalance: creditBalance,
        }
      }));
      showNotification('Dashboard data loaded successfully!', 'success');
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      showNotification(
        `Failed to load dashboard data: ${error.response?.data?.detail || error.message || 'Network error'}`,
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
    // Reloading all dashboard data is safer to ensure all stats are updated correctly
    // or you can optimistically update if you're sure about the structure.
    // For simplicity and data consistency, let's reload if the user is available.
    if (user) {
      loadDashboardData(user);
    } else {
      setDashboardData(prev => ({
        ...prev,
        myGigs: [newGig, ...prev.myGigs],
        stats: {
          ...prev.stats,
          activeGigs: prev.stats.activeGigs + 1
        }
      }));
    }
    setIsGigFormOpen(false);
    showNotification('Gig created successfully!', 'success');
  };

  /**
   * Handles the click on the "Create a Gig" button.
   * Checks for credit balance before opening the GigPostForm.
   */
  const handleCreateGigClick = () => {
    if (dashboardData.stats.creditBalance <= 0) {
      setShowInsufficientCreditsModal(true);
    } else {
      setIsGigFormOpen(true);
    }
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

  // Removed statusMessage, showSpinner state as they are no longer needed here.
  // Removed showLoading, hideLoading, showStatus functions as they are no longer needed here.

  /**
   * Handles the action of navigating to the Buy Credit page.
   */
  const handleNavigateToBuyCredits = () => {
    // Navigate to the BuyCreditPage
    window.location.href = '/buy-credits'; // Assuming your route is '/buy-credits'
  };


  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Access denied message if user is not a tutor
  if (!user || user.user_type !== 'tutor') {
    return (
      <>
        <Navbar />
        <div style={{ height: '100px' }}></div> {/* Spacer for fixed navbar */}
        <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2>Access Denied</h2>
          <p>You must be a **tutor** to access this dashboard. Your current role is: **{user?.user_type || 'Unknown'}**</p>
          {/* Removed the 'teacher' specific message as user_type 'teacher' might not be distinct from 'tutor' in your system, or is a typo. */}
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
              Teacher Dashboard - Welcome, {user?.username || 'Teacher'}!
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
                onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
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
                {notifications.filter(n => !n.isRead).length > 0 && (
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
              {showNotificationsDropdown && (
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
                  {notifications.length > 0 ? (
                    notifications.slice(0, 5).map(notification => (
                      <div
                        key={notification.id}
                        onClick={() => markAsRead(notification.id)} // Mark as read on click
                        style={{
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
              {unreadCount > 0 && ( // This is still a mock unreadCount
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

            {/* Create a Gig Button - Modified onClick handler */}
            <button
              onClick={handleCreateGigClick} // Call the new handler
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

            {/* Buy Credits Button - Modified onClick handler */}
            <button
              onClick={handleNavigateToBuyCredits} // Call the new navigation handler
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
        {/* Removed showSpinner and statusMessage display logic as it's handled by BuyCreditPage now */}

        {/* Statistics Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <StatCard
            title="Current Credits" // Changed title to reflect actual credit balance
            value={`${dashboardData.stats.creditBalance} Credits`}
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
                  onClick={handleCreateGigClick} // Modified to use the new handler
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
                dashboardData.myGigs.map((gig) => (
                  <GigItemCard key={gig.id} gig={gig} />
                ))
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
                <p style={{ fontSize: '1.2em', marginBottom: '10px' }}><strong>Available Credits:</strong> <span style={{ color: '#28a745', fontWeight: 'bold' }}>{dashboardData.stats.creditBalance}</span></p>
                <p style={{ fontSize: '1em', marginBottom: '5px' }}>Pending Earnings (Estimated): {dashboardData.earnings.pending}</p>
                <p style={{ fontSize: '1em' }}>Completed Earnings (Estimated): {dashboardData.earnings.completed}</p>
                <button
                  onClick={handleNavigateToBuyCredits} // Navigates to BuyCreditPage
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

          {/* Add Premium Tab content if needed */}
          {activeTab === 'premium' && (
            <div className="premium-tab-content" style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '25px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              borderLeft: '5px solid #ffc107',
              textAlign: 'center'
            }}>
              <h3 style={{ color: '#ffc107', marginBottom: '15px' }}>Unlock Premium Features! 🚀</h3>
              <p style={{ fontSize: '1.1em', marginBottom: '20px', color: '#555' }}>
                Upgrade to a premium membership to gain access to exclusive benefits, including:
              </p>
              <ul style={{ listStyleType: 'none', padding: 0, margin: '0 auto 20px', maxWidth: '400px', textAlign: 'left' }}>
                <li style={{ marginBottom: '10px', fontSize: '1em' }}>✨ Priority listing in search results</li>
                <li style={{ marginBottom: '10px', fontSize: '1em' }}>📈 Advanced analytics for your gigs</li>
                <li style={{ marginBottom: '10px', fontSize: '1em' }}>📞 Direct support access</li>
                <li style={{ fontSize: '1em' }}>🎁 Special discounts on credit purchases</li>
              </ul>
              <button
                // onClick={() => window.location.href = PREMIUM_UPGRADE_ENDPOINT} // Uncomment and implement if you have a premium upgrade page
                onClick={() => showNotification("Premium upgrade feature coming soon!", "info")}
                style={{
                  padding: '12px 25px',
                  backgroundColor: '#ffc107',
                  color: '#212529',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '1.1em',
                  fontWeight: '600',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                  transition: 'background-color 0.3s ease, transform 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0a800'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffc107'}
              >
                Upgrade to Premium
              </button>
            </div>
          )}

        </div>

        {/* Gig Post Form Modal */}
        {isGigFormOpen && (
          <GigPostForm
            onClose={() => setIsGigFormOpen(false)}
            onGigCreated={handleGigCreated}
            userId={user?.user_id} // Pass userId to the form
          />
        )}

        {/* Insufficient Credits Modal */}
        {showInsufficientCreditsModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '8px',
              boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
              textAlign: 'center',
              maxWidth: '400px',
              width: '90%'
            }}>
              <h3 style={{ color: '#dc3545', marginBottom: '15px' }}>Insufficient Credits</h3>
              <p style={{ marginBottom: '25px', fontSize: '1.1em' }}>
                You do not have enough credits to create a gig. Please buy more credits to proceed.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                <button
                  onClick={() => {
                    setShowInsufficientCreditsModal(false); // Close the modal first
                    handleNavigateToBuyCredits(); // Then navigate to Buy Credits page
                  }}
                  style={{
                    padding: '10px 20px',
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
                <button
                  onClick={() => setShowInsufficientCreditsModal(false)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '1em',
                    fontWeight: '500',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    transition: 'background-color 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5a6268'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TeacherDashboard;
