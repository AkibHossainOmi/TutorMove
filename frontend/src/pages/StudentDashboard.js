// pages/StudentDashboard.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import DashboardHeader from '../components/Dashboard/Student/DashboardHeader';
import DashboardStats from '../components/Dashboard/Student/DashboardStats';
import JobPostModal from '../components/Dashboard/Student/JobPostModal';
import InsufficientCreditsModal from '../components/Dashboard/Student/InsufficientCreditsModal';
import { creditAPI, jobAPI, notificationAPI } from '../utils/apiService';
import { Link } from 'react-router-dom';
import Pagination from '../components/Pagination'; // Use the new generic Pagination
import { MapPin, Calendar, Wallet, BookOpen, MessageCircle } from 'lucide-react';

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
      const response = await jobAPI.getMyJobs();
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
  const status = typeof job?.status === 'string' ? job.status.toLowerCase() : 'active';
  const subject = job.subject_details;

  return (
    <div className="group bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300 flex flex-col h-full">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
          {job.title || "Tutoring Job"}
        </h3>
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide border ${
            status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
            status === "completed" ? "bg-slate-50 text-slate-600 border-slate-200" :
            "bg-blue-50 text-blue-700 border-blue-100"
          }`}
        >
          {status}
        </span>
      </div>

      <div className="space-y-2 text-sm text-slate-600 mb-4 flex-grow">
        <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-slate-400" />
            <span className="font-medium text-slate-700">{subject || 'Various Subjects'}</span>
        </div>
         <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span>{job.location || "Remote"}</span>
        </div>
         <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-slate-400" />
            <span>{job.budget || "Negotiable"}</span>
        </div>
      </div>

      <p className="text-sm text-slate-500 line-clamp-2 mb-5 h-10">
        {job.description || "No additional details provided."}
      </p>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
           <Calendar className="w-3.5 h-3.5" />
           <span>Posted {fmtDate(job.created_at)}</span>
        </div>
        <button
          onClick={() => onView(job)}
          className="text-xs px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 font-medium hover:bg-indigo-100 transition-colors"
        >
          View Details
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
    points: 0,
    stats: { activeJobs: 0, completedJobs: 0 }
  });
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 6;

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser?.user_type === 'student') setUser(storedUser);
    else {
        // Mock user for UI dev if not present, or redirect
        // For now, assume auth handles redirect if not logged in
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const loadNotifications = async () => {
      try {
        const res = await notificationAPI.getLatestNotifications();
        const allNotifications = res.data || [];
        setNotifications(allNotifications);
        const unreadCount = allNotifications.filter(n => !n.is_read).length;
        setUnreadNotificationCount(unreadCount);
      } catch {}
    };

    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const [creditsData, jobsData, favoritesData] = await Promise.all([
          studentAPI.getCredits(),
          studentAPI.getPostedJobs(),
          studentAPI.getFavoriteTeachers(user.id)
        ]);

        const activeJobs = jobsData.filter(j => j.status === 'active').length;
        const completedJobs = jobsData.filter(j => j.status === 'completed').length;

        setDashboardData({
          postedJobs: jobsData,
          points: creditsData.balance || 0,
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

  const totalJobs = dashboardData.postedJobs.length;
  const totalPages = Math.ceil(totalJobs / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const currentJobs = dashboardData.postedJobs.slice(startIndex, startIndex + jobsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [dashboardData.postedJobs.length]);

  const handleJobCreated = (newJob) => {
    setDashboardData(prev => ({
      ...prev,
      postedJobs: [newJob, ...prev.postedJobs],
      stats: { ...prev.stats, activeJobs: prev.stats.activeJobs + 1 },
      points: prev.points - 1
    }));
    setIsJobFormOpen(false);
  };

  const handlePostJobClick = () => {
    if (dashboardData.points <= 0) setShowInsufficientCreditsModal(true);
    else setIsJobFormOpen(true);
  };

  const handleNavigateToBuyCredits = () => navigate('/buy-points');
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

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const jobSection = document.getElementById('job-posts-section');
    if (jobSection) {
      jobSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <LoadingSpinner />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-600">
      <Navbar />
      <main className="max-w-7xl mx-auto mt-16 px-4 sm:px-6 lg:px-8 py-8">

        {/* Dashboard Header */}
        <DashboardHeader
          user={user}
          creditBalance={dashboardData.points}
          onPostJobClick={handlePostJobClick}
          onBuyCreditsClick={handleNavigateToBuyCredits}
          notifications={notifications}
          unreadNotificationCount={unreadNotificationCount}
          showNotifications={showNotifications}
          onToggleNotifications={handleToggleNotifications}
          onMarkNotificationsRead={handleMarkNotificationsRead}
          unreadMessagesCount={0}
        />

        {/* Stats Section */}
        <div className="mt-8">
            <DashboardStats
            stats={{
                creditBalance: dashboardData.points,
                activeJobs: dashboardData.stats.activeJobs,
                completedJobs: dashboardData.stats.completedJobs
            }}
            favoriteTeachersCount={favoriteTeachers.length}
            />
        </div>

        {/* Quick Actions / Q&A Banner */}
        <section className="mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
           <div>
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                 <MessageCircle className="w-6 h-6" />
                 Need help with a question?
              </h2>
              <p className="text-indigo-100 max-w-xl">
                 Post a question in our Q&A Forum and get answers from expert tutors. It's a great way to find the right help quickly.
              </p>
           </div>
           <div className="flex gap-4 shrink-0">
               <Link to="/qna/create" className="px-5 py-2.5 bg-white text-indigo-600 rounded-lg font-bold hover:bg-indigo-50 transition-colors shadow-sm">
                  Ask Question
               </Link>
               <Link to="/qna" className="px-5 py-2.5 bg-indigo-700/50 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors border border-indigo-500">
                  Browse Forum
               </Link>
           </div>
        </section>

        {/* Job Posts Section */}
        <section id="job-posts-section" className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
               <BriefcaseIcon className="w-5 h-5 text-indigo-600" />
               Your Job Posts {totalJobs > 0 && <span className="text-sm font-normal text-slate-500 ml-1">({totalJobs})</span>}
            </h2>
            {totalJobs > 0 && (
              <span className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
                Page {currentPage} of {totalPages}
              </span>
            )}
          </div>

          {dashboardData.postedJobs.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                 <BriefcaseIcon className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-1">No jobs posted yet</h3>
              <p className="text-slate-500 mb-6">Create your first job post to find the perfect tutor.</p>
              <button
                onClick={handlePostJobClick}
                className="inline-flex items-center px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md"
              >
                Create Job Post
              </button>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {currentJobs.map((job) => (
                  <JobCard key={safeKey(job)} job={job} onView={handleViewJob} />
                ))}
              </div>
              
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </section>

        {/* Favorites Section */}
        {favoriteTeachers.length > 0 && (
          <section className="mt-12 mb-12">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
               <StarIcon className="w-5 h-5 text-amber-500" />
               Favorite Teachers
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {favoriteTeachers.slice(0, 4).map((t, idx) => (
                <div key={t?.id || idx} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 hover:border-indigo-200 transition-colors cursor-pointer" onClick={() => navigate(`/profile/${t.username}`)}>
                   <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                      {t?.name ? t.name.charAt(0) : 'T'}
                   </div>
                   <div>
                      <p className="font-semibold text-slate-900 text-sm">{t?.name || 'Teacher'}</p>
                      <p className="text-xs text-slate-500">{t?.subject || 'Tutor'}</p>
                   </div>
                </div>
              ))}
            </div>
          </section>
        )}
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
      <Footer />
    </div>
  );
};

// Helper Icons
const BriefcaseIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const StarIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

export default StudentDashboard;
