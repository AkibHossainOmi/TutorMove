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
  
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
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

// Easter Egg Card Component
const PlayingCard = ({ type, isRevealed, delay }) => {
  const isAce = type === 'ace';
  
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
          {isAce ? (
            // Ace of Spades Card
            <div className="card-content ace-card">
              <div className="card-corner top-left">
                <div className="rank">A</div>
                <div className="suit">♠</div>
              </div>
              <div className="card-center">
                <div className="spade-icon">♠</div>
              </div>
              <div className="card-info">
                <h3 className="dev-name">Rahadul Islam</h3>
                <p className="dev-title">CSE Graduate (BRACU)</p>
                <p className="dev-title">Junior Software Developer</p>
                <p className="dev-company">Inovi Solutions</p>
              </div>
              <div className="card-corner bottom-right">
                <div className="rank">A</div>
                <div className="suit">♠</div>
              </div>
            </div>
          ) : (
            // Ace of Diamonds Card
            <div className="card-content diamond-card">
              <div className="card-corner top-left">
                <div className="rank red">A</div>
                <div className="suit red">♦</div>
              </div>
              <div className="card-center">
                <div className="diamond-icon">♦</div>
              </div>
              <div className="card-info">
                <h3 className="dev-name">Akib Hossain Omi</h3>
                <p className="dev-title">CS Graduate</p>
                <p className="dev-title">Software Developer</p>
                <p className="dev-company">Telcobright Ltd.</p>
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
          <PlayingCard type="ace" isRevealed={cardsRevealed} delay={0} />
          <PlayingCard type="diamond" isRevealed={cardsRevealed} delay={0.3} />
        </div>
        <div className="close-hint">
          Actual Developers of this project.
        </div>
      </div>
    </>
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

  // Easter Egg State
  const [showEasterEgg, setShowEasterEgg] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser?.user_type === 'student') setUser(storedUser);
    else setIsLoading(false);
  }, []);

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

  useEffect(() => {
    if (!user?.id) return;

    const loadNotifications = async () => {
      try {
        const res = await notificationAPI.getLatestNotifications();
        const allNotifications = res.data || [];

        setNotifications(allNotifications);
        // Count only unread notifications
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

        {/* Q&A Button Section */}
        <section className="mt-8">
           <Link to="/qna/create" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition shadow">
              Ask a Question in Forum
           </Link>
           <Link to="/qna" className="ml-4 text-blue-600 hover:underline">
              Browse Q&A Forum
           </Link>
        </section>

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
      <EasterEggOverlay 
        isVisible={showEasterEgg} 
        onClose={() => setShowEasterEgg(false)} 
      />
      <div className="w-screen relative left-1/2 right-1/2 -mx-[50.4vw] h-20">
        <Footer />
      </div>
    </div>
  );
};

export default StudentDashboard;