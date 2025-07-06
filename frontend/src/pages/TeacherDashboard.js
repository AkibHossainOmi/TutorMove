  import React, { useState, useEffect } from 'react';
  import axios from 'axios';
  import GigPostForm from '../components/GigPostForm';
  import JobCard from '../components/JobCard';
  import LoadingSpinner from '../components/LoadingSpinner';
  import Navbar from '../components/Navbar';
  import Footer from '../components/Footer';
import { creditAPI, gigApi, notificationAPI } from '../utils/apiService';

  /**
   * Custom hook for managing chat-related functionalities.
   */
  const useChat = () => ({
    openChat: (chatId) => console.log(`Opening chat ${chatId}`),
    unreadCount: 0
  });

  /**
   * API functions for job-related operations.
   */
  const jobAPI = {
    getMatchedJobs: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        data: {
          results: []
        }
      };
    },
    getMyApplications: async () => {
      await new Promise(resolve => setTimeout(resolve, 400));
      return {
        data: {
          results: []
        }
      };
    }
  };

  /**
   * API functions for tutor-related operations.
   */
  const tutorAPI = {
    getTutorGigs: async (teacherId) => {
      try {
        const response = await gigApi.getGigs();
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
  const credit = {
    getUserCredits: async (userId) => {
      try {
        const response = await creditAPI.getCreditBalance();
        return response.data;
      } catch (error) {
        console.error("Error fetching user credits:", error.response?.data || error.message);
        return { user_id: userId, balance: 0 };
      }
    }
  };

  /**
   * Teacher verification badge component.
   */
  const TeacherVerificationBadge = ({ verified }) => (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
      verified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
    }`}>
      {verified ? (
        <>
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Verified Teacher
        </>
      ) : (
        <>
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          Not Verified
        </>
      )}
    </div>
  );

  /**
   * Component to display individual gig information.
   */
  const GigItemCard = ({ gig }) => {
    const { title, description, subject, created_at, status } = gig;

    const statusColors = {
      active: 'bg-emerald-100 text-emerald-800',
      pending: 'bg-amber-100 text-amber-800',
      completed: 'bg-blue-100 text-blue-800',
      draft: 'bg-gray-100 text-gray-800'
    };

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <h4 className="text-lg font-semibold text-gray-900 line-clamp-2">{title || 'No Title'}</h4>
            <span className={`text-xs px-2 py-1 rounded-full ${statusColors[status] || 'bg-gray-100'}`}>
              {status || 'Active'}
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {description || 'No description provided.'}
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="bg-gray-50 px-2 py-1 rounded-md font-medium text-gray-700">
              Subject: {subject || 'N/A'}
            </span>
            <span className="bg-gray-50 px-2 py-1 rounded-md font-medium text-gray-700">
              Created: {created_at ? new Date(created_at).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
        <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-end">
          <button className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
            View Details
          </button>
        </div>
      </div>
    );
  };

  /**
   * Notification item component.
   */
  const NotificationItem = ({ notification }) => {
    const handleNotificationClick = () => {
      // If it's a job posting notification, redirect to /jobs
      if (notification.message.includes("job")) {
        window.location.href = "/jobs";
      }
    };
  
    return (
      <div
        className={`px-4 py-3 border-b border-gray-100 cursor-pointer transition-colors ${
          !notification.is_read ? 'bg-blue-50 hover:bg-blue-100' : 'bg-white hover:bg-gray-50'
        }`}
        key={notification.id}
        onClick={handleNotificationClick}  // Add onClick handler
      >
        <div className="flex items-start">
          <div className={`flex-shrink-0 mt-1 mr-3 w-2 h-2 rounded-full ${
            !notification.is_read ? 'bg-blue-500' : 'bg-transparent'
          }`}></div>
          <div>
            <p className="text-sm text-gray-800">{notification.message}</p>
            <small className="text-xs text-gray-500">
              {new Date(notification.created_at).toLocaleString()}
            </small>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Stat Card Component
   */
  const StatCard = ({ title, value, icon, color, trend }) => {
    const colorClasses = {
      blue: 'from-blue-500 to-blue-600',
      emerald: 'from-emerald-500 to-emerald-600',
      amber: 'from-amber-500 to-amber-600',
      violet: 'from-violet-500 to-violet-600'
    };

    const trendIcons = {
      up: (
        <svg className="w-4 h-4 ml-1 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12 7a1 1 0 01-1 1H9v1h2a1 1 0 110 2H9v1h2a1 1 0 110 2H9v1a1 1 0 11-2 0v-1H5a1 1 0 110-2h2v-1H5a1 1 0 110-2h2V8H5a1 1 0 010-2h2V5a1 1 0 112 0v1h2a1 1 0 011 1z" clipRule="evenodd" />
        </svg>
      ),
      down: (
        <svg className="w-4 h-4 ml-1 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      ),
      neutral: (
        <svg className="w-4 h-4 ml-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      )
    };

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
              <div className="flex items-center mt-1">
                <span className="text-2xl font-semibold text-gray-900">{value}</span>
                {trend && trendIcons[trend]}
              </div>
            </div>
            <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-lg p-3 text-white`}>
              {icon}
            </div>
          </div>
        </div>
      </div>
    );
  };

  /**
   * The main Teacher Dashboard component.
   */
  const TeacherDashboard = () => {
    const { unreadCount: unreadMessagesCount } = useChat();

    const [user, setUser] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);

    const [isGigFormOpen, setIsGigFormOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [isLoading, setIsLoading] = useState(true);
    const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);

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
        creditBalance: 0,
      }
    });

    // Fetch notifications for the logged in user
    const fetchNotifications = async (userId) => {
      try {
        const response = await notificationAPI.getUnreadNotifications();
        const unreadNotifs = response.data || [];
        setNotifications(unreadNotifs);
        setUnreadNotificationCount(unreadNotifs.length);
      } catch (error) {
        console.error("Failed to fetch notifications:", error.response?.data || error.message);
      }
    };

    useEffect(() => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser && storedUser.user_type === 'tutor') {
          setUser(storedUser);
          loadDashboardData(storedUser);
          fetchNotifications(storedUser.user_id);
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

    const loadDashboardData = async (currentUser) => {
      setIsLoading(true);
      try {
        if (!currentUser || !currentUser.user_id) {
          console.error("User ID not found. Cannot fetch dashboard data.");
          setIsLoading(false);
          return;
        }

        const [gigsData, creditBalanceData, matchedJobsResponse, applicationsResponse] = await Promise.all([
          tutorAPI.getTutorGigs(currentUser.user_id),
          credit.getUserCredits(currentUser.user_id),
          jobAPI.getMatchedJobs(),
          jobAPI.getMyApplications(),
        ]);

        const myGigs = gigsData || [];
        const matchedJobs = matchedJobsResponse.data?.results || [];
        const applications = applicationsResponse.data?.results || [];
        const creditBalance = creditBalanceData.balance || 0;

        setDashboardData(prev => ({
          ...prev,
          myGigs: myGigs,
          matchedJobs: matchedJobs,
          applications: applications,
          earnings: {
            total: creditBalance,
            pending: myGigs.filter(gig => gig.status === 'pending').length * 20,
            completed: myGigs.filter(gig => gig.status === 'completed').length * 50
          },
          stats: {
            activeGigs: myGigs.filter(gig => gig.status === 'active').length || 0,
            completedJobs: applications.filter(app => app.status === 'completed').length || 0,
            creditBalance: creditBalance,
          }
        }));
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const handleGigCreated = async (newGig) => {
      if (user) {
        try {
          const freeGigsLimit = 5;
          const currentGigCount = dashboardData.myGigs.length;

          if (currentGigCount >= freeGigsLimit) {
            const creditUpdateResponse = await axios.post(`${process.env.REACT_APP_API_URL}/api/credit/update/`, {
              user_id: user.user_id,
              amount: 1,
              isincrease: false
            });
            console.log('Credit updated:', creditUpdateResponse.data);
          }

          await loadDashboardData(user);
        } catch (error) {
          console.error('Error updating credit after gig creation:', error.response?.data || error.message);
        }
      }

      setIsGigFormOpen(false);
    };

    const handleCreateGigClick = () => {
      const freeGigsLimit = 5;
      const currentGigCount = dashboardData.myGigs.length;

      if (currentGigCount < freeGigsLimit) {
        setIsGigFormOpen(true);
      } else if (dashboardData.stats.creditBalance > 0) {
        setIsGigFormOpen(true);
      } else {
        setShowInsufficientCreditsModal(true);
      }
    };

    const handleNavigateToBuyCredits = () => {
      window.location.href = '/buy-credits';
    };

    const markNotificationsRead = async () => {
      if (!user) return;
      try {
        notificationAPI.markAsRead();
        setUnreadNotificationCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      } catch (error) {
        console.error("Failed to mark notifications as read:", error.response?.data || error.message);
      }
    };

    const toggleNotifications = () => {
      setShowNotifications(prev => {
        const newState = !prev;
        if (newState) markNotificationsRead();
        return newState;
      });
    };

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <LoadingSpinner />
        </div>
      );
    }

    if (!user || user.user_type !== 'tutor') {
      return (
        <>
          <Navbar />
          <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-md overflow-hidden p-8 text-center">
              <div className="bg-rose-100 p-3 rounded-full inline-flex mb-4">
                <svg className="w-8 h-8 text-rose-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
              <p className="text-gray-600 mb-6">
                You must be a <strong>tutor</strong> to access this dashboard. Your current role is: <strong>{user?.user_type || 'Unknown'}</strong>
              </p>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
              >
                Go to Home
              </button>
            </div>
          </div>
        </>
      );
    }

    return (
      <>
          <Navbar />
        <div className="mt-20 min-h-screen bg-gray-50 flex-grow">        
          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Welcome back, {user?.username || 'Teacher'}!
                  </h1>
                  <TeacherVerificationBadge verified={false} />
                </div>
                <p className="text-gray-600">Manage your teaching gigs, applications, and earnings</p>
              </div>

              <div className="flex flex-wrap gap-3">
                {/* Notifications Dropdown */}
                <div className="relative">
                  <button
                    onClick={toggleNotifications}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-xs hover:bg-gray-50 transition-colors relative"
                    aria-label="Notifications"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                    </svg>
                    {unreadNotificationCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                        {unreadNotificationCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                        <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">No new notifications</div>
                        ) : (
                          notifications.map((notif) => (
                            <NotificationItem key={notif.id} notification={notif} />
                          ))
                        )}
                      </div>
                      <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 text-right">
                        <button
                          onClick={() => window.location.href = '/notifications'}
                          className="text-xs font-medium text-blue-600 hover:text-blue-800"
                        >
                          View all
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Messages Button */}
                <button
                  onClick={() => window.location.href = '/messages'}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-xs hover:bg-gray-50 transition-colors relative"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                  </svg>
                  {unreadMessagesCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                      {unreadMessagesCount}
                    </span>
                  )}
                </button>

                {/* Create Gig Button */}
                <button
                  onClick={handleCreateGigClick}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  New Gig
                </button>
                
                {/* Buy Credits Button */}
                <button
                  onClick={handleNavigateToBuyCredits}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                  Buy Credits
                </button>
              </div>
            </div>

            {/* Free Gigs Remaining */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-blue-800">
                  {dashboardData.myGigs.length < 5
                    ? `You have ${5 - dashboardData.myGigs.length} free gig${5 - dashboardData.myGigs.length === 1 ? '' : 's'} remaining.`
                    : `You've used all free gigs. New gigs will cost 1 credit each.`}
                </p>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <StatCard
                title="Available Credits"
                value={dashboardData.stats.creditBalance}
                icon="💰"
                color="emerald"
                trend={dashboardData.stats.creditBalance > 0 ? 'up' : 'down'}
              />
              <StatCard
                title="Active Gigs"
                value={ dashboardData.myGigs.length}
                icon="🎯"
                color="blue"
              />
              <StatCard
                title="Completed Jobs"
                value={dashboardData.stats.completedJobs}
                icon="✅"
                color="violet"
              />
            </div>

            {/* Main Content Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
              {/* Tab Navigation */}
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  {['overview', 'gigs', 'jobs', 'earnings'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Your Recent Gigs</h3>
                        <button
                          onClick={() => setActiveTab('gigs')}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          View all
                        </button>
                      </div>
                      {dashboardData.myGigs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {dashboardData.myGigs.slice(0, 3).map((gig) => (
                            <GigItemCard key={gig.id} gig={gig} />
                          ))}
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-lg p-8 text-center">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          <h3 className="mt-2 text-sm font-medium text-gray-900">No gigs yet</h3>
                          <p className="mt-1 text-sm text-gray-500">Get started by creating your first teaching gig.</p>
                          <div className="mt-6">
                            <button
                              onClick={handleCreateGigClick}
                              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                              </svg>
                              New Gig
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Matched Jobs</h3>
                        <button
                          onClick={() => setActiveTab('jobs')}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          View all
                        </button>
                      </div>
                      {dashboardData.matchedJobs.length > 0 ? (
                        <div className="space-y-4">
                          {dashboardData.matchedJobs.slice(0, 3).map((job) => (
                            <JobCard key={job.id} job={job} />
                          ))}
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-lg p-8 text-center">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          <h3 className="mt-2 text-sm font-medium text-gray-900">No matched jobs</h3>
                          <p className="mt-1 text-sm text-gray-500">We'll show jobs that match your gigs here.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Gigs Tab */}
                {activeTab === 'gigs' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">Your Gigs</h3>
                      <button
                        onClick={handleCreateGigClick}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                        New Gig
                      </button>
                    </div>

                    {dashboardData.myGigs.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {dashboardData.myGigs.map((gig) => (
                          <GigItemCard key={gig.id} gig={gig} />
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-8 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No gigs yet</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by creating your first teaching gig.</p>
                        <div className="mt-6">
                          <button
                            onClick={handleCreateGigClick}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                            New Gig
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Jobs Tab */}
                {activeTab === 'jobs' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">Matched Jobs</h3>
                      <button
                        onClick={() => window.location.href = '/jobs'}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Browse All Jobs
                      </button>
                    </div>

                    {dashboardData.matchedJobs.length > 0 ? (
                      <div className="space-y-4">
                        {dashboardData.matchedJobs.map((job) => (
                          <JobCard key={job.id} job={job} />
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-8 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No matched jobs</h3>
                        <p className="mt-1 text-sm text-gray-500">We'll show jobs that match your gigs here.</p>
                        <div className="mt-6">
                          <button
                            onClick={() => window.location.href = '/jobs'}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Browse All Jobs
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Earnings Tab */}
                {activeTab === 'earnings' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Earnings Summary</h3>
                      <p className="mt-1 text-sm text-gray-500">Overview of your earnings and transactions.</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-4 rounded-lg shadow-xs border border-gray-200">
                          <p className="text-sm font-medium text-gray-500">Total Balance</p>
                          <p className="mt-1 text-2xl font-semibold text-gray-900">${dashboardData.earnings.total}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-xs border border-gray-200">
                          <p className="text-sm font-medium text-gray-500">Pending</p>
                          <p className="mt-1 text-2xl font-semibold text-gray-900">${dashboardData.earnings.pending}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-xs border border-gray-200">
                          <p className="text-sm font-medium text-gray-500">Completed</p>
                          <p className="mt-1 text-2xl font-semibold text-gray-900">${dashboardData.earnings.completed}</p>
                        </div>
                      </div>

                      <div className="mt-8">
                        <h4 className="text-sm font-medium text-gray-900 mb-4">Recent Transactions</h4>
                        <div className="bg-white rounded-lg shadow-xs overflow-hidden border border-gray-200">
                          <div className="p-4 border-b border-gray-200 bg-gray-50 text-sm font-medium text-gray-500">
                            No recent transactions
                          </div>
                          <div className="p-8 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="mt-2 text-sm text-gray-500">Your transaction history will appear here</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={handleCreateGigClick}
                  className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="bg-blue-100 p-3 rounded-full mb-2">
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Create Gig</span>
                </button>
                <button
                  onClick={() => window.location.href = '/jobs'}
                  className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="bg-emerald-100 p-3 rounded-full mb-2">
                    <svg className="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                      <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Browse Jobs</span>
                </button>
                <button
                  onClick={handleNavigateToBuyCredits}
                  className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="bg-amber-100 p-3 rounded-full mb-2">
                    <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Buy Credits</span>
                </button>
                <button
                  onClick={() => window.location.href = '/profile'}
                  className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="bg-violet-100 p-3 rounded-full mb-2">
                    <svg className="w-6 h-6 text-violet-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Edit Profile</span>
                </button>
              </div>
            </div>
          </main>

          {/* Gig Post Form Modal */}
          {isGigFormOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <GigPostForm 
                onGigCreated={(newGig) => {
                  handleGigCreated(newGig);
                  setIsGigFormOpen(false);
                }}
                onClose={() => setIsGigFormOpen(false)}
              />
            </div>
          )}

          {/* Insufficient Credits Modal */}
          {showInsufficientCreditsModal && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Insufficient Credits</h3>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-rose-100 p-3 rounded-full">
                      <svg className="h-8 w-8 text-rose-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-center text-gray-600 mb-6">
                    You don't have enough credits to create a new gig. Please purchase more credits to continue.
                  </p>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => setShowInsufficientCreditsModal(false)}
                      className="px-5 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setShowInsufficientCreditsModal(false);
                        handleNavigateToBuyCredits();
                      }}
                      className="px-5 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Buy Credits
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
        <div className="w-screen relative left-1/2 right-1/2 -mx-[50.4vw] h-20">
      <Footer/>
      </div>
      </>
    );
  };

  export default TeacherDashboard;