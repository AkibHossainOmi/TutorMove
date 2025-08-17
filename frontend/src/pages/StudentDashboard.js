// pages/StudentDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import DashboardHeader from '../components/Dashboard/Student/DashboardHeader';
import DashboardStats from '../components/Dashboard/Student/DashboardStats';
import QuickActions from '../components/Dashboard/Student/QuickActions';
import JobPostModal from '../components/Dashboard/Student/JobPostModal';
import InsufficientCreditsModal from '../components/Dashboard/Student/InsufficientCreditsModal';
import { creditAPI, jobAPI, notificationAPI } from '../utils/apiService';

const studentAPI = {
  getCredits: async () => {
    try {
      const response = await creditAPI.getCreditBalance();
      return response.data;
    } catch {
      return { balance: 0 };
    }
  },
  getPostedJobs: async () => {
    try {
      const response = await jobAPI.getJobs();
      return response.data || [];
    } catch {
      return [];
    }
  },
  getFavoriteTeachers: async (userId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/favorites/${userId}`);
      return response.data || [];
    } catch {
      return [];
    }
  }
};

const safeKey = (job) => job?.id || job?._id || job?.job_id || job?.uuid || String(Math.random());
const fmtDate = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  return isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
};

const JobCard = ({ job, onView }) => {
  // Safely handle status and subject
  const status = typeof job?.status === 'string' ? job.status.toLowerCase() : 'active';
  const subject =
    typeof job?.subject === 'string'
      ? job.subject
      : job?.subject?.title || job?.subject?.name || job?.subject_name || job?.subject__c || '—';

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md hover:border-gray-200 transition">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
          {job.title || "Tutoring Job"}
        </h3>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            status === "active" ? "bg-emerald-100 text-emerald-700" :
            status === "completed" ? "bg-gray-100 text-gray-600" :
            "bg-blue-100 text-blue-700"
          }`}
        >
          {status}
        </span>
      </div>
      <div className="space-y-1 text-sm text-gray-600 mb-4">
        <p><strong>Subject:</strong> {subject}</p>
        <p><strong>Location:</strong> {job.location || "Remote"}</p>
        <p><strong>Budget:</strong> {job.budget || "Negotiable"}</p>
      </div>
      <p className="text-sm text-gray-700 line-clamp-2 mb-5">
        {job.description || "No additional details."}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">Posted {fmtDate(job.created_at)}</span>
        <button
          onClick={() => onView(job)}
          className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
        >
          View details
        </button>
      </div>
    </div>
  );
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJobFormOpen, setIsJobFormOpen] = useState(false);
  const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);
  const [favoriteTeachers, setFavoriteTeachers] = useState([]);
  const [dashboardData, setDashboardData] = useState({
    postedJobs: [],
    credits: 0,
    stats: { activeJobs: 0, completedJobs: 0 }
  });
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser?.user_type === 'student') setUser(storedUser);
    else setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!user?.user_id) return;

    const loadNotifications = async () => {
      try {
        const res = await notificationAPI.getUnreadNotifications();
        setNotifications(res.data || []);
        setUnreadNotificationCount(res.data?.length || 0);
      } catch {}
    };

    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const [creditsData, jobsData, favoritesData] = await Promise.all([
          studentAPI.getCredits(),
          studentAPI.getPostedJobs(),
          studentAPI.getFavoriteTeachers(user.user_id)
        ]);

        const activeJobs = jobsData.filter(j => j.status === 'active').length;
        const completedJobs = jobsData.filter(j => j.status === 'completed').length;

        setDashboardData({
          postedJobs: jobsData,
          credits: creditsData.balance || 0,
          stats: { activeJobs, completedJobs }
        });
        setFavoriteTeachers(favoritesData);
        await loadNotifications();
      } catch {} finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  const handleJobCreated = (newJob) => {
    setDashboardData(prev => ({
      ...prev,
      postedJobs: [newJob, ...prev.postedJobs],
      stats: { ...prev.stats, activeJobs: prev.stats.activeJobs + 1 },
      credits: prev.credits - 1
    }));
    setIsJobFormOpen(false);
  };

  const handlePostJobClick = () => {
    if (dashboardData.credits <= 0) setShowInsufficientCreditsModal(true);
    else setIsJobFormOpen(true);
  };

  const handleNavigateToBuyCredits = () => window.location.href = '/buy-credits';
  const handleToggleNotifications = () => {
    if (!showNotifications) handleMarkNotificationsRead();
    setShowNotifications(!showNotifications);
  };
  const handleMarkNotificationsRead = async () => {
    try {
      await notificationAPI.markAsRead();
      setUnreadNotificationCount(0);
    } catch {}
  };
  const handleViewJob = (job) => {
    const jobId = job?.id || job?._id || job?.job_id || job?.uuid;
    if (jobId) navigate(`/jobs/${jobId}`);
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <LoadingSpinner />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto mt-20 px-4 sm:px-6 lg:px-8 py-8">
        <DashboardHeader
          user={user}
          creditBalance={dashboardData.credits}
          onPostJobClick={handlePostJobClick}
          onBuyCreditsClick={handleNavigateToBuyCredits}
          notifications={notifications}
          unreadNotificationCount={unreadNotificationCount}
          showNotifications={showNotifications}
          onToggleNotifications={handleToggleNotifications}
          onMarkNotificationsRead={handleMarkNotificationsRead}
          unreadMessagesCount={0}
        />
        <DashboardStats
          stats={{
            creditBalance: dashboardData.credits,
            activeJobs: dashboardData.stats.activeJobs,
            completedJobs: dashboardData.stats.completedJobs
          }}
          favoriteTeachersCount={favoriteTeachers.length}
        />
        <section className="mt-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Your Job Posts</h2>
            
          </div>
          {dashboardData.postedJobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
              <p className="text-gray-700 font-medium">No jobs posted yet</p>
              <button
                onClick={handlePostJobClick}
                className="mt-4 inline-flex items-center rounded-xl bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:bg-black"
              >
                Create Job
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {dashboardData.postedJobs.map((job) => (
                <JobCard key={safeKey(job)} job={job} onView={handleViewJob} />
              ))}
            </div>
          )}
        </section>
        {favoriteTeachers.length > 0 && (
          <section className="mt-12">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Favorite Teachers</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {favoriteTeachers.slice(0, 6).map((t, idx) => (
                <div key={t?.id || idx} className="bg-white border border-gray-100 rounded-2xl p-4">
                  <p className="font-medium text-gray-900">{t?.name || 'Teacher'}</p>
                  <p className="text-sm text-gray-600">{t?.subject || '—'}</p>
                </div>
              ))}
            </div>
          </section>
        )}
        <div className="mt-16">
          <QuickActions
            onPostJobClick={handlePostJobClick}
            onBuyCreditsClick={handleNavigateToBuyCredits}
          />
        </div>
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
