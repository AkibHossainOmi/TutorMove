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
 * API functions for point-related operations.
 */
const point = {
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

// Easter Egg Card Component
const PlayingCard = ({ type, isRevealed, delay }) => {
  const isSpade = type === 'spade';
  
  return (
    <div
      className="playing-card"
      style={{
        animationDelay: `${delay}s`,
        opacity: isRevealed ? 1 : 0,
        transform: isRevealed ? 'translateY(0)' : 'translateY(50px)'
      }}
    >
      <div 
        className="card-inner"
        style={{
          transform: isRevealed ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* Card Back */}
        <div className="card-back">
          <div className="card-pattern"></div>
        </div>
        
        {/* Card Front */}
        <div className="card-front">
          {isSpade ? (
            // Ace of Spades Card - Now shows Akib's info
            <div className="card-content ace-card">
              <div className="card-corner top-left">
                <div className="rank">A</div>
                <div className="suit">♠</div>
              </div>
              <div className="card-center">
                <div className="spade-icon">♠</div>
              </div>
              <div className="card-info">
                <h3 className="dev-name">Akib Hossain Omi</h3>
                <p className="dev-title">CS Graduate</p>
                <p className="dev-title">Software Developer</p>
                <p className="dev-company">Telcobright Ltd.</p>
              </div>
              <div className="card-corner bottom-right">
                <div className="rank">A</div>
                <div className="suit">♠</div>
              </div>
            </div>
          ) : (
            // Ace of Diamonds Card - Now shows Rahadul's info
            <div className="card-content diamond-card">
              <div className="card-corner top-left">
                <div className="rank red">A</div>
                <div className="suit red">♦</div>
              </div>
              <div className="card-center">
                <div className="diamond-icon">♦</div>
              </div>
              <div className="card-info">
                <h3 className="dev-name">Rahadul Islam</h3>
                <p className="dev-title">CSE Graduate (BRACU)</p>
                <p className="dev-title">Junior Software Developer</p>
                <p className="dev-company">Inovi Solutions</p>
              </div>
              <div className="card-corner bottom-right">
                <div className="rank red">A</div>
                <div className="suit red">♦</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const EasterEggOverlay = ({ isVisible, onClose }) => {
  const [cardsRevealed, setCardsRevealed] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setTimeout(() => setCardsRevealed(true), 100);
    } else {
      setCardsRevealed(false);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      <style>{`
        .easter-egg-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.5s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .cards-container {
          display: flex;
          gap: 60px;
          perspective: 1000px;
          position: relative;
        }

        .playing-card {
          width: 320px;
          height: 480px;
          position: relative;
          transition: all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          perspective: 1000px;
        }

        .card-inner {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 1s ease-in-out;
        }

        .card-back,
        .card-front {
          width: 100%;
          height: 100%;
          position: absolute;
          backface-visibility: hidden;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }

        .card-back {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .card-pattern {
          width: 280px;
          height: 440px;
          background-image: 
            repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.1) 10px, rgba(255,255,255,.1) 20px),
            repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255,255,255,.1) 10px, rgba(255,255,255,.1) 20px);
          border-radius: 12px;
          border: 3px solid rgba(255, 255, 255, 0.3);
        }

        .card-front {
          background: white;
          transform: rotateY(180deg);
          padding: 20px;
        }

        .card-content {
          width: 100%;
          height: 100%;
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .ace-card {
          border: 3px solid #000;
          border-radius: 12px;
        }

        .diamond-card {
          border: 3px solid #c41e3a;
          border-radius: 12px;
        }

        .card-corner {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          font-weight: bold;
        }

        .top-left {
          top: 10px;
          left: 15px;
        }

        .bottom-right {
          bottom: 10px;
          right: 15px;
          transform: rotate(180deg);
        }

        .rank {
          font-size: 42px;
          line-height: 1;
          color: #000;
        }

        .rank.red {
          color: #c41e3a;
        }

        .suit {
          font-size: 36px;
          line-height: 1;
          color: #000;
        }

        .suit.red {
          color: #c41e3a;
        }

        .card-center {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 40px 0;
        }

        .spade-icon {
          font-size: 120px;
          color: #000;
          animation: pulse 2s ease-in-out infinite;
        }

        .diamond-icon {
          font-size: 120px;
          color: #c41e3a;
          animation: sparkle 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes sparkle {
          0%, 100% { 
            transform: scale(1) rotate(0deg);
            filter: drop-shadow(0 0 10px rgba(196, 30, 58, 0.5));
          }
          50% { 
            transform: scale(1.08) rotate(5deg);
            filter: drop-shadow(0 0 20px rgba(196, 30, 58, 0.8));
          }
        }

        .card-info {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 8px;
          padding: 16px;
          text-align: center;
          margin-top: auto;
        }

        .dev-name {
          font-size: 22px;
          font-weight: bold;
          color: #1a1a1a;
          margin-bottom: 8px;
        }

        .dev-title {
          font-size: 14px;
          color: #555;
          margin: 4px 0;
        }

        .dev-company {
          font-size: 16px;
          font-weight: 600;
          color: #2563eb;
          margin-top: 8px;
        }

        .close-hint {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          color: white;
          font-size: 14px;
          opacity: 0.7;
          animation: blink 2s ease-in-out infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 0.3; }
        }
      `}</style>

      <div className="easter-egg-overlay" onClick={onClose}>
        <div className="cards-container" onClick={(e) => e.stopPropagation()}>
          <PlayingCard type="spade" isRevealed={cardsRevealed} delay={0} />
          <PlayingCard type="diamond" isRevealed={cardsRevealed} delay={0.3} />
        </div>
        <div className="close-hint">
          Actual Developers of this project.
        </div>
      </div>
    </>
  );
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

  // Easter Egg State
  const [showEasterEgg, setShowEasterEgg] = useState(false);

  // Easter Egg Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete') {
        setShowEasterEgg(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch notifications for the logged in user
  const fetchNotifications = async (userId) => {
    try {
      const response = await notificationAPI.getLatestNotifications();
      const unreadNotifs = response.data || [];
      setNotifications(unreadNotifs);
      const unreadNotifsCount = unreadNotifs.filter(n => !n.is_read).length;
      setUnreadNotificationCount(unreadNotifsCount);
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
        point.getUserCredits(currentUser.id),
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
          const creditUpdateResponse = await axios.post(`${process.env.REACT_APP_API_URL}/api/point/update/`, {
            id: user.id,
            amount: 1,
            isincrease: false
          });
          console.log('Point updated:', creditUpdateResponse.data);
        }

        await loadDashboardData(user);
      } catch (error) {
        console.error('Error updating point after gig creation:', error.response?.data || error.message);
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
                  : `You've used all free gigs. New gigs will cost 1 point each.`}
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

        <EasterEggOverlay 
          isVisible={showEasterEgg} 
          onClose={() => setShowEasterEgg(false)} 
        />
      </div>
      <div className="w-screen relative left-1/2 right-1/2 -mx-[50.4vw] h-20">
        <Footer/>
      </div>
    </>
  );
};

export default TeacherDashboard;