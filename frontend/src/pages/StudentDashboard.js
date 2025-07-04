import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import DashboardHeader from '../components/Dashboard/Student/DashboardHeader';
import DashboardStats from '../components/Dashboard/Student/DashboardStats';
import DashboardTabs from '../components/Dashboard/Student/DashboardTabs';
import QuickActions from '../components/Dashboard/Student/QuickActions';
import JobPostModal from '../components/Dashboard/Student/JobPostModal';
import InsufficientCreditsModal from '../components/Dashboard/Student/InsufficientCreditsModal';
import { creditAPI } from '../utils/apiService';

// Simplified API functions
const studentAPI = {
  getCredits: async (userId) => {
    console.log('Calling getCredits with userId:', userId);
    try {
      const response = await creditAPI.getCreditBalance(userId);
      return response.data;
    } catch (error) {
      console.error("Error fetching credits:", error);
      return { balance: 0 };
    }
  },
  getPostedJobs: async (userId) => {
    console.log('Calling getPostedJobs with userId:', userId);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/jobs/${userId}`);
      return response.data || [];
    } catch (error) {
      console.error("Error fetching jobs:", error);
      return [];
    }
  },
  getFavoriteTeachers: async (userId) => {
    console.log('Calling getFavoriteTeachers with userId:', userId);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/favorites/${userId}`);
      return response.data || [];
    } catch (error) {
      console.error("Error fetching favorite teachers:", error);
      return [];
    }
  }
};

const StudentDashboard = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJobFormOpen, setIsJobFormOpen] = useState(false);
  const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('jobs');
  const [favoriteTeachers, setFavoriteTeachers] = useState([]);
  const [dashboardData, setDashboardData] = useState({
    postedJobs: [],
    credits: 0,
    stats: {
      activeJobs: 0,
      completedJobs: 0
    }
  });

  // Get user from localStorage once
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser?.user_type === 'student') {
      setUser(storedUser);
    } else {
      setIsLoading(false); // Non-student users
    }
  }, []);

  // Load dashboard data only after user is set
  useEffect(() => {
    if (!user?.user_id) return;

    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const [creditsData, jobsData, favoritesData] = await Promise.all([
          studentAPI.getCredits(user.user_id),
          studentAPI.getPostedJobs(user.user_id),
          studentAPI.getFavoriteTeachers(user.user_id)
        ]);

        const activeJobs = jobsData.filter(job => job.status === 'active').length;
        const completedJobs = jobsData.filter(job => job.status === 'completed').length;

        setDashboardData({
          postedJobs: jobsData,
          credits: creditsData.balance || 0,
          stats: {
            activeJobs,
            completedJobs
          }
        });

        setFavoriteTeachers(favoritesData);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  // Handle job creation
  const handleJobCreated = (newJob) => {
    setDashboardData(prev => ({
      ...prev,
      postedJobs: [newJob, ...prev.postedJobs],
      stats: {
        ...prev.stats,
        activeJobs: prev.stats.activeJobs + 1
      },
      credits: prev.credits - 1
    }));
    setIsJobFormOpen(false);
  };

  const handlePostJobClick = () => {
    if (dashboardData.credits <= 0) {
      setShowInsufficientCreditsModal(true);
    } else {
      setIsJobFormOpen(true);
    }
  };

  const handleNavigateToBuyCredits = () => {
    window.location.href = '/buy-credits';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto mt-20 px-4 sm:px-6 lg:px-8 py-8">
        <DashboardHeader
          user={user}
          creditBalance={dashboardData.credits}
          onPostJobClick={handlePostJobClick}
          onBuyCreditsClick={handleNavigateToBuyCredits}
        />

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-blue-800">
              You have {dashboardData.credits} credits remaining. {dashboardData.credits <= 2 && (
                <button 
                  onClick={handleNavigateToBuyCredits}
                  className="text-blue-600 font-medium hover:underline"
                >
                  Buy more credits
                </button>
              )}
            </p>
          </div>
        </div>

        <DashboardStats 
          stats={{
            creditBalance: dashboardData.credits,
            activeJobs: dashboardData.stats.activeJobs,
            completedJobs: dashboardData.stats.completedJobs
          }}
          favoriteTeachersCount={favoriteTeachers.length}
        />

        <DashboardTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          postedJobs={dashboardData.postedJobs}
          onPostJobClick={handlePostJobClick}
        />

        <QuickActions
          onPostJobClick={handlePostJobClick}
          onBuyCreditsClick={handleNavigateToBuyCredits}
        />
      </main>

      <JobPostModal
        isOpen={isJobFormOpen}
        onClose={() => setIsJobFormOpen(false)}
        onJobCreated={handleJobCreated}
      />

      <InsufficientCreditsModal
        isOpen={showInsufficientCreditsModal}
        onClose={() => setShowInsufficientCreditsModal(false)}
        onBuyCredits={handleNavigateToBuyCredits}
      />

      <div className="w-screen relative left-1/2 right-1/2 -mx-[50.4vw] h-20">
        <Footer />
      </div>
    </div>
  );
};

export default StudentDashboard;
