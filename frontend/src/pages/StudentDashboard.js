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
  const status = typeof job?.status === 'string' ? job.status.toLowerCase() : 'active';
  const subject = job.subject_details;

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
      _ >
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

// --- 🃏 NEW EASTER EGG COMPONENT ♠️ ---
const EasterEggCards = ({ isOpen, onClose }) => {
  // Base classes for transitions
  const overlayClasses = `fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-300 ease-in-out`;
  const cardBaseClasses = `bg-white rounded-xl shadow-2xl w-72 h-96 p-6 border-4 relative transform transition-all duration-500 ease-out`;

  return (
    <div
      // Overlay handles fade-in/out and click-to-close
      className={`${overlayClasses} ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={onClose}
    >
      <div
        className="flex flex-col md:flex-row gap-8"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking on cards
      >
        {/* Card 1: Ace of Spades */}
        <div
          className={`${cardBaseClasses} border-black ${
            isOpen ? 'opacity-100 translate-y-0 scale-100 delay-100' : 'opacity-0 -translate-y-10 scale-95'
          }`}
        >
          {/* Card Corners */}
          <div className="absolute top-4 left-4 text-center text-black">
            <div className="text-3xl font-bold">A</div>
            <div className="text-4xl">♠</div>
          </div>
          <div className="absolute bottom-4 right-4 text-center text-black transform rotate-180">
            <div className="text-3xl font-bold">A</div>
            <div className="text-4xl">♠</div>
          </div>
          {/* Center Content */}
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-800">
            <h3 className="text-xl font-bold mb-2">Rahadul Islam</h3>
            <p className="text-sm">CSE Graduate (BRACU)</p>
            <p className="text-sm">Junior Software Developer</p>
            <p className="text-sm">Inovi Solutions</p>
          </div>
        </div>
        
        {/* Card 2: Joker */}
        <div
          className={`${cardBaseClasses} border-red-600 ${
            isOpen ? 'opacity-100 translate-y-0 scale-100 delay-200' : 'opacity-0 translate-y-10 scale-95'
          }`}
        >
          {/* Card Corners */}
          <div className="absolute top-4 left-4 text-center text-red-600">
            <div className="text-3xl font-bold">JOKER</div>
          </div>
          <div className="absolute bottom-4 right-4 text-center text-red-600 transform rotate-180">
            <div className="text-3xl font-bold">JOKER</div>
          </div>
          {/* Center Content */}
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-800">
            <div className="text-7xl mb-4">🃏</div> {/* Joker Emoji */}
            <h3 className="text-xl font-bold mb-2">Akib Hossain Omi</h3>
            <p className="text-sm">CS Graduate</p>
            <p className="text-sm">Software Developer</p>
            <p className="text-sm">Telcobright Ltd.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
// --- END OF EASTER EGG COMPONENT ---


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
  
  // --- ✨ NEW STATE FOR EASTER EGG ---
  const [showEasterEgg, setShowEasterEgg] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 6;

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser?.user_type === 'student') setUser(storedUser);
    else setIsLoading(false);
  }, []);

  // --- ✨ NEW EFFECT FOR EASTER EGG KEY PRESS ---
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Check if the pressed key is "Delete"
      if (event.key === 'Delete') {
        setShowEasterEgg(true);
      }
    };

    // Add event listener when the component mounts
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup function to remove the listener when the component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []); // Empty dependency array ensures this effect runs only once

  useEffect(() => {
    if (!user?.id) return;

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

  // Calculate pagination values
  const totalJobs = dashboardData.postedJobs.length;
  const totalPages = Math.ceil(totalJobs / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const currentJobs = dashboardData.postedJobs.slice(startIndex, startIndex + jobsPerPage);

  // Reset to first page when jobs data changes
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

  const handleNavigateToBuyCredits = () => window.location.href = '/buy-points';
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
    // Scroll to top of job posts section for better UX
    const jobSection = document.getElementById('job-posts-section');
    if (jobSection) {
      jobSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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
        <DashboardStats
          stats={{
            creditBalance: dashboardData.points,
            activeJobs: dashboardData.stats.activeJobs,
            completedJobs: dashboardData.stats.completedJobs
          }}
          favoriteTeachersCount={favoriteTeachers.length}
        />
        <section id="job-posts-section" className="mt-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Your Job Posts {totalJobs > 0 && `(${totalJobs})`}
            </h2>
            {totalJobs > 0 && (
              <div className="text-sm text-gray-500">
                Showing {Math.min(jobsPerPage, currentJobs.length)} of {totalJobs} jobs
              </div>
            )}
          </div>
          {dashboardData.postedJobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
              <p className="text-gray-700 font-medium">No jobs posted yet</p>
              <button
                onClick={handlePostJobClick}
                className="mt-4 inline-flex items-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white px-4 py-2 text-sm font-medium hover:bg-black"
              >
                Create Job
  _         </button>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {currentJobs.map((job) => (
      _         <JobCard key={safeKey(job)} job={job} onView={handleViewJob} />
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
        </div>
      </main>

      {/* --- ✨ RENDER THE EASTER EGG MODAL --- */}
      <EasterEggCards
        isOpen={showEasterEgg}
        onClose={() => setShowEasterEgg(false)} 
      />

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