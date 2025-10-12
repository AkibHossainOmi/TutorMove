import { useState, useEffect } from 'react';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { creditAPI, gigApi, notificationAPI, jobAPI } from '../utils/apiService';

// Import components
import DashboardHeader from '../components/Dashboard/Teacher/DashboardHeader';
import DashboardStats from '../components/Dashboard/Teacher/DashboardStats';
import DashboardTabs from '../components/Dashboard/Teacher/DashboardTabs';
import InsufficientCreditsModal from '../components/Dashboard/Teacher/InsufficientCreditsModal';
import GigPostModal from '../components/Dashboard/Teacher/GigPostModal';

/**
 * Custom hook for managing chat-related functionalities.
 */
const useChat = () => ({
  openChat: (chatId) => console.log(`Opening chat ${chatId}`),
  unreadCount: 0
});

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
      console.error("Error fetching user points:", error.response?.data || error.message);
      return { id: userId, balance: 0 };
    }
  }
};

// Pagination Component (same as in StudentDashboard)
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  
  // Show limited page numbers for better UX
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  // Adjust start page if we're near the end
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(
      <button
        key={i}
        onClick={() => onPageChange(i)}
        className={`px-3 py-1 rounded-lg text-sm font-medium ${
          currentPage === i
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
        }`}
      >
        {i}
      </button>
    );
  }

  return (
    <div className="flex items-center justify-center space-x-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded-lg text-sm font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      
      {startPage > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-3 py-1 rounded-lg text-sm font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          >
            1
          </button>
          {startPage > 2 && <span className="px-2 text-gray-500">...</span>}
        </>
      )}
      
      {pages}
      
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="px-2 text-gray-500">...</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            className="px-3 py-1 rounded-lg text-sm font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          >
            {totalPages}
          </button>
        </>
      )}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded-lg text-sm font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
};

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
    stats: {
      activeGigs: 0,
      completedJobs: 0,
      creditBalance: 0,
    }
  });

  // Pagination state for both gigs and matched jobs
  const [currentGigsPage, setCurrentGigsPage] = useState(1);
  const [currentJobsPage, setCurrentJobsPage] = useState(1);
  const itemsPerPage = 6;

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
        fetchNotifications(storedUser.id);
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
      if (!currentUser || !currentUser.id) {
        console.error("User ID not found. Cannot fetch dashboard data.");
        setIsLoading(false);
        return;
      }

      const [gigsData, creditBalanceData, matchedJobsResponse] = await Promise.all([
        tutorAPI.getTutorGigs(currentUser.id),
        credit.getUserCredits(currentUser.id),
        jobAPI.getMatchedJobs(),
      ]);

      const myGigs = gigsData || [];
      const matchedJobs = matchedJobsResponse.data || [];
      const creditBalance = creditBalanceData.balance || 0;
      setDashboardData(prev => ({
        ...prev,
        myGigs: myGigs,
        matchedJobs: matchedJobs,
        stats: {
          activeGigs: myGigs.filter(gig => gig.status === 'active').length || 0,
          creditBalance: creditBalance,
        }
      }));
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate pagination values for gigs
  const totalGigs = dashboardData.myGigs.length;
  const totalGigsPages = Math.ceil(totalGigs / itemsPerPage);
  const gigsStartIndex = (currentGigsPage - 1) * itemsPerPage;
  const currentGigs = dashboardData.myGigs.slice(gigsStartIndex, gigsStartIndex + itemsPerPage);

  // Calculate pagination values for matched jobs
  const totalJobs = dashboardData.matchedJobs.length;
  const totalJobsPages = Math.ceil(totalJobs / itemsPerPage);
  const jobsStartIndex = (currentJobsPage - 1) * itemsPerPage;
  const currentJobs = dashboardData.matchedJobs.slice(jobsStartIndex, jobsStartIndex + itemsPerPage);

  // Reset to first page when data changes
  useEffect(() => {
    setCurrentGigsPage(1);
  }, [dashboardData.myGigs.length]);

  useEffect(() => {
    setCurrentJobsPage(1);
  }, [dashboardData.matchedJobs.length]);

  const handleGigCreated = async (newGig) => {
    if (user) {
      try {
        const freeGigsLimit = 5;
        const currentGigCount = dashboardData.myGigs.length;

        if (currentGigCount >= freeGigsLimit) {
          const creditUpdateResponse = await axios.post(`${process.env.REACT_APP_API_URL}/api/credit/update/`, {
            id: user.id,
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
    window.location.href = '/buy-points';
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

  const handleGigsPageChange = (page) => {
    setCurrentGigsPage(page);
    // Scroll to gigs section for better UX
    const gigsSection = document.getElementById('my-gigs-section');
    if (gigsSection) {
      gigsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleJobsPageChange = (page) => {
    setCurrentJobsPage(page);
    // Scroll to jobs section for better UX
    const jobsSection = document.getElementById('matched-jobs-section');
    if (jobsSection) {
      jobsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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
          <DashboardHeader 
            user={user}
            notifications={notifications}
            unreadNotificationCount={unreadNotificationCount}
            showNotifications={showNotifications}
            toggleNotifications={toggleNotifications}
            markNotificationsRead={markNotificationsRead}
            handleCreateGigClick={handleCreateGigClick}
            handleNavigateToBuyCredits={handleNavigateToBuyCredits}
            unreadMessagesCount={unreadMessagesCount}
          />

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

          <DashboardStats stats={dashboardData.stats} myGigs={dashboardData.myGigs} />

          <DashboardTabs 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            dashboardData={{
              ...dashboardData,
              // Pass paginated data to tabs
              myGigs: currentGigs,
              matchedJobs: currentJobs
            }}
            handleCreateGigClick={handleCreateGigClick}
            // Pass pagination info and handlers
            paginationInfo={{
              // Gigs pagination
              totalGigs: totalGigs,
              totalGigsPages: totalGigsPages,
              currentGigsPage: currentGigsPage,
              onGigsPageChange: handleGigsPageChange,
              // Jobs pagination
              totalJobs: totalJobs,
              totalJobsPages: totalJobsPages,
              currentJobsPage: currentJobsPage,
              onJobsPageChange: handleJobsPageChange,
              itemsPerPage: itemsPerPage
            }}
          />

          
        </main>

        <GigPostModal 
          isGigFormOpen={isGigFormOpen}
          setIsGigFormOpen={setIsGigFormOpen}
          handleGigCreated={handleGigCreated}
        />

        <InsufficientCreditsModal 
          showInsufficientCreditsModal={showInsufficientCreditsModal}
          setShowInsufficientCreditsModal={setShowInsufficientCreditsModal}
          handleNavigateToBuyCredits={handleNavigateToBuyCredits}
        />
      </div>
      <div className="w-screen relative left-1/2 right-1/2 -mx-[50.4vw] h-20">
        <Footer/>
      </div>
    </>
  );
};

export default TeacherDashboard;