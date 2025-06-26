import React, { useState, useEffect } from 'react';
import axios from 'axios';
import JobPostForm from '../components/JobPostForm';
import JobCard from '../components/JobCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Navbar from '../components/Navbar';

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
      const response = await axios.get(`http://localhost:8000/api/gigs/teacher/${teacherId}/`);
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
  getUserCredits: async (userId) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/credit/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user credits:", error.response?.data || error.message);
      return { user_id: userId, balance: 0 };
    }
  }
};

/**
 * Teacher verification button component.
 */


/**
 * Component to display individual gig information.
 */
const GigItemCard = ({ gig }) => {
  const { title, description, subject, created_at } = gig;

  return (
    <div className="gig-card bg-white rounded-lg p-5 shadow-sm border-l-4 border-blue-500 flex flex-col gap-2 transition-transform hover:-translate-y-1 cursor-pointer">
      <h4 className="m-0 text-gray-800 text-lg">{title || 'No Title'}</h4>
      <p className="m-0 text-gray-600 text-sm flex-grow">
        {description || 'No description provided.'}
      </p>
      <div className="flex justify-between items-center text-sm text-gray-700">
        <span className="bg-gray-100 px-2 py-1 rounded font-medium">
          Subject: {subject || 'N/A'}
        </span>
        <span className="text-gray-600">
          Created: {created_at ? new Date(created_at).toLocaleDateString() : 'N/A'}
        </span>
      </div>
    </div>
  );
};

/**
 * The main Teacher Dashboard component.
 */
const StudentDashboard = () => {
  const { unreadCount } = useChat();
  const [isJobFormOpen, setIsJobFormOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);

  const [dashboardData, setDashboardData] = useState({
    postedJobs: [],
    applications: [],
    favoriteTeachers: [],
    reviews: [],
    credits: {
      available: 0,
      spent: 0,
      pending: 0
    },
    stats: {
      totalJobs: 0,
      activeJobs: 0,
      completedJobs: 0,
      totalReviews: 0
    }
  });
  
  const handleJobCreated = async (newJob) => {
    setDashboardData(prev => ({
      ...prev,
      postedJobs: [newJob, ...prev.postedJobs],
      stats: {
        ...prev.stats,
        totalJobs: prev.stats.totalJobs + 1,
        activeJobs: prev.stats.activeJobs + 1
      }
    }));
  
    if (user) {
      try {
        // Deduct 1 credit by sending the required data
        const creditUpdateResponse = await axios.post('http://localhost:8000/api/credit/update/', {
          user_id: user.user_id,
          amount: 1,
          isincrease: false
        });
  
        console.log('Credit updated:', creditUpdateResponse.data);
  
        // Reload data to reflect changes
        await loadDashboardData(user);
      } catch (error) {
        console.error('Error updating credit after gig creation:', error.response?.data || error.message);
      }
    }
  
    setIsJobFormOpen(false);
  };
  

    const handlePostJobClick = () => {
    if (dashboardData.stats.creditBalance <= 0) {
      setShowInsufficientCreditsModal(true);
    } else {
      setIsJobFormOpen(true);
    }
  };

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser && storedUser.user_type === 'student') {
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
        creditAPI.getUserCredits(currentUser.user_id),
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
  

  const handleNavigateToBuyCredits = () => {
    window.location.href = '/buy-credits';
  };

  const StatCard = ({ title, value, icon, color }) => {
    const colorClasses = {
      green: 'bg-green-100 text-green-700',
      blue: 'bg-blue-100 text-blue-700',
      orange: 'bg-orange-100 text-orange-700',
      teal: 'bg-teal-100 text-teal-700'
    };

    return (
      <div className="stat-card bg-white rounded-lg p-5 shadow-sm flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${colorClasses[color]}`}>
          {icon}
        </div>
        <div>
          <h3 className="m-0 text-gray-800 text-2xl">{value}</h3>
          <p className="mt-1 text-gray-600 text-sm">{title}</p>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user || user.user_type !== 'student') {
    return (
      <>
        <Navbar />
        <div className="h-24"></div>
        <div className="px-8 max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="mb-6">
            You must be a <strong>tutor</strong> to access this dashboard. Your current role is: <strong>{user?.user_type || 'Unknown'}</strong>
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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
      <div className="h-24"></div>
      
      <div className="teacher-dashboard-container px-8 max-w-7xl mx-auto font-sans text-gray-800">
        {/* Dashboard Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-5 mb-8">
          <div className="flex flex-col gap-2">
            <h1 className="m-0 text-3xl font-bold">
              Student Dashboard - Welcome, {user?.username || 'Student'}!
            </h1>
          </div>

          <div className="flex flex-wrap gap-3 items-center justify-end">
          <button
              className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-700 transition-colors"
            >
              🔔 Notifications
            </button>
            {/* Messages Button */}
            <button
              onClick={() => window.location.href = '/messages'}
              className="px-4 py-2 bg-teal-500 text-white rounded-md relative hover:bg-teal-600 transition-colors"
            >
              💬 Messages
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold border-2 border-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Create a Gig Button */}
            <button
              onClick={handlePostJobClick}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              ➕ Create a Job
            </button>

            {/* Buy Credits Button */}
            <button
              onClick={handleNavigateToBuyCredits}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              💳 Buy Credits
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            title="Current Credits"
            value={`${dashboardData.stats.creditBalance} Credits`}
            icon="💰"
            color="green"
          />
          <StatCard
            title="Active Jobs"
            value={dashboardData.stats.activeGigs}
            icon="🎯"
            color="blue"
          />
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-5 overflow-x-auto">
          <div className="flex gap-5 pb-2">
            {['jobs', 'premium'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 font-medium transition-colors ${
                  activeTab === tab 
                    ? 'text-blue-600 border-b-2 border-blue-600 font-semibold' 
                    : 'text-gray-600 hover:text-blue-500'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Area */}
        <div className="mt-5">

          {/* Jobs Tab Content */}
          {activeTab === 'jobs' && (
            <div className="jobs-tab-content">
              <div className="mb-8">
                <h3 className="border-b border-gray-200 pb-2 mb-4">My Gigs Matched Jobs</h3>
                <div className="grid gap-5">
                  {dashboardData.matchedJobs.length > 0 ? (
                    dashboardData.matchedJobs.map(job => (
                      <JobCard key={job.id} job={job} />
                    ))
                  ) : (
                    <p className="text-gray-600">No matched jobs found for your gigs.</p>
                  )}
                </div>
              </div>
              <div>
                <h3 className="border-b border-gray-200 pb-2 mb-4">Search All Jobs</h3>
                <button
                  onClick={() => window.location.href = '/jobs'}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                >
                  Browse All Jobs
                </button>
              </div>
            </div>
          )}

          {/* Gigs Tab Content */}
          {activeTab === 'gigs' && (
            <div className="gigs-tab-content grid gap-5">
              <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-4">
                <h3 className="m-0">My Gigs</h3>
              </div>
              {dashboardData.myGigs.length > 0 ? (
                dashboardData.myGigs.map((gig) => (
                  <GigItemCard key={gig.id} gig={gig} />
                ))
              ) : (
                <p className="text-gray-600 text-center">
                  You haven't created any gigs yet. Click "Add New Gig" to get started!
                </p>
              )}
            </div>
          )}

          {/* Wallet Tab Content */}
          {activeTab === 'wallet' && (
            <div className="wallet-tab-content grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Credit Wallet Card */}
              <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-green-500">
                
                <h3 className="text-green-600 mb-4">Credit Wallet</h3>
                <p className="text-lg mb-2">
                  <strong>Available Credits:</strong> <span className="text-green-600 font-bold">{dashboardData.stats.creditBalance}</span>
                </p>
                <p className="mb-1">Pending Earnings (Estimated): {dashboardData.earnings.pending}</p>
                <p>Completed Earnings (Estimated): {dashboardData.earnings.completed}</p>
                <button
                  onClick={handleNavigateToBuyCredits}
                  className="mt-5 px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Buy Credits
                </button>
              </div>

              {/* Payments Card */}
              <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-gray-500">
                <h3 className="text-gray-600 mb-4">Payments</h3>
                <p className="mb-2">Configure your payout account.</p>
                <p>Review your transaction history.</p>
                <button
                  onClick={() => console.log('Navigate to payment history page!')}
                  className="mt-5 px-5 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  View Payment History
                </button>
              </div>

              {/* Refer & Earn Card */}
              <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-teal-400">
                <h3 className="text-teal-500 mb-4">Refer & Earn</h3>
                <p className="mb-4">
                  Invite friends to the platform and earn free credits when they sign up and complete their first lesson!
                </p>
                <button
                  onClick={() => console.log('Navigate to refer & earn page!')}
                  className="mt-2 px-5 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
                >
                  Invite Friends
                </button>
              </div>
            </div>
          )}

          {/* Premium Tab Content */}
          {activeTab === 'premium' && (
            <div className="premium-tab-content bg-white rounded-lg p-6 shadow-sm border-l-4 border-yellow-400 text-center">
              <h3 className="text-yellow-500 mb-4">Unlock Premium Features! 🚀</h3>
              <p className="text-gray-600 text-lg mb-5">
                Upgrade to a premium membership to gain access to exclusive benefits, including:
              </p>
              <ul className="list-none p-0 m-0 mb-6 max-w-md mx-auto text-left">
                <li className="mb-3">✨ Priority listing in search results</li>
                <li className="mb-3">📈 Advanced analytics for your gigs</li>
                <li className="mb-3">📞 Direct support access</li>
                <li>🎁 Special discounts on credit purchases</li>
              </ul>
              <button
                className="px-6 py-3 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 transition-colors shadow-md hover:shadow-lg font-semibold"
              >
                Upgrade to Premium
              </button>
            </div>
          )}
        </div>

        {/* Gig Post Form Modal */}
        {isJobFormOpen && (
          <JobPostForm
            onClose={() => {
              setIsJobFormOpen(false);
            }}
            onJobCreated={handleJobCreated}
          />
        )}

        {/* Insufficient Credits Modal */}
        {showInsufficientCreditsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full text-center">
              <h3 className="text-red-600 mb-4 text-xl font-semibold">Insufficient Credits</h3>
              <p className="mb-6 text-lg">
                You do not have enough credits to create a gig. Please buy more credits to proceed.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    setShowInsufficientCreditsModal(false);
                    handleNavigateToBuyCredits();
                  }}
                  className="px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  💳 Buy Credits
                </button>
                <button
                  onClick={() => setShowInsufficientCreditsModal(false)}
                  className="px-5 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
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

export default StudentDashboard;