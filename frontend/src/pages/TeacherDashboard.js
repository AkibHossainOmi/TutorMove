import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { creditAPI, gigApi, notificationAPI, jobAPI } from '../utils/apiService';
import Pagination from '../components/Pagination';
import NotificationDropdown from '../components/Dashboard/Student/NotificationDropdown';
import {
  MapPin,
  Calendar,
  Wallet,
  BookOpen,
  MessageCircle,
  Briefcase,
  Star,
  TrendingUp,
  Plus,
  DollarSign,
  Users,
  Zap,
  Award,
  Clock,
  ChevronRight
} from 'lucide-react';

// API functions
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

// Helper functions
const safeKey = (item) => item?.id || item?._id || item?.uuid || String(Math.random());
const fmtDate = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  return isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, trend }) => {
  const colorClasses = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' },
    violet: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-100' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' }
  };

  const colors = colorClasses[color] || colorClasses.indigo;

  return (
    <div className="bg-white overflow-hidden rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="p-6">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-xl p-3 ${colors.bg}`}>
            <Icon className={`h-6 w-6 ${colors.text}`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="flex items-baseline">
                  <div className="text-2xl font-bold text-gray-900">{value}</div>
                  {trend !== undefined && (
                    <span className={`ml-2 flex items-baseline text-sm font-semibold ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                    </span>
                  )}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

// Gig Card Component
const GigCard = ({ gig, onView }) => {
  const status = gig?.is_active ? 'active' : 'inactive';

  return (
    <div className="group bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300 flex flex-col h-full">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
          {gig.title || "Tutoring Gig"}
        </h3>
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide border ${
            status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
            "bg-slate-50 text-slate-600 border-slate-200"
          }`}
        >
          {status}
        </span>
      </div>

      <div className="space-y-2 text-sm text-slate-600 mb-4 flex-grow">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-slate-400" />
          <span className="font-medium text-slate-700">{gig.subject || 'Various Subjects'}</span>
        </div>
        {gig.fee_details && (
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-slate-400" />
            <span>{gig.fee_details}</span>
          </div>
        )}
      </div>

      <p className="text-sm text-slate-500 line-clamp-2 mb-5 h-10">
        {gig.description || "No additional details provided."}
      </p>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Calendar className="w-3.5 h-3.5" />
          <span>Created {fmtDate(gig.created_at)}</span>
        </div>
        <button
          onClick={() => onView(gig)}
          className="text-xs px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 font-medium hover:bg-indigo-100 transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

// Job Card Component (for matched jobs)
const JobCard = ({ job, onView }) => {
  const subjects = job.subject_details?.join(', ') || 'General';

  return (
    <div className="group bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-300 flex flex-col h-full">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-bold text-slate-800 line-clamp-1 group-hover:text-purple-600 transition-colors">
          {subjects} Tutoring
        </h3>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide border bg-blue-50 text-blue-700 border-blue-100">
          {job.status || 'Open'}
        </span>
      </div>

      <div className="space-y-2 text-sm text-slate-600 mb-4 flex-grow">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-slate-400" />
          <span className="font-medium text-slate-700">{subjects}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-slate-400" />
          <span>{job.location || "Remote"}</span>
        </div>
        {job.budget && (
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-slate-400" />
            <span>${job.budget}{job.budget_type === 'Hourly' ? '/hr' : ''}</span>
          </div>
        )}
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
          className="text-xs px-3 py-1.5 rounded-lg bg-purple-50 text-purple-600 font-medium hover:bg-purple-100 transition-colors"
        >
          View & Apply
        </button>
      </div>
    </div>
  );
};

// Easter Egg Components (kept from original)
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
        <div className="card-back">
          <div className="card-pattern"></div>
        </div>
        <div className="card-front">
          {isSpade ? (
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
        .card-back, .card-front {
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
        .ace-card { border: 3px solid #000; border-radius: 12px; }
        .diamond-card { border: 3px solid #c41e3a; border-radius: 12px; }
        .card-corner {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          font-weight: bold;
        }
        .top-left { top: 10px; left: 15px; }
        .bottom-right { bottom: 10px; right: 15px; transform: rotate(180deg); }
        .rank { font-size: 42px; line-height: 1; color: #000; }
        .rank.red { color: #c41e3a; }
        .suit { font-size: 36px; line-height: 1; color: #000; }
        .suit.red { color: #c41e3a; }
        .card-center { flex: 1; display: flex; align-items: center; justify-content: center; margin: 40px 0; }
        .spade-icon { font-size: 120px; color: #000; animation: pulse 2s ease-in-out infinite; }
        .diamond-icon { font-size: 120px; color: #c41e3a; animation: sparkle 2s ease-in-out infinite; }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        @keyframes sparkle { 0%, 100% { transform: scale(1) rotate(0deg); filter: drop-shadow(0 0 10px rgba(196, 30, 58, 0.5)); } 50% { transform: scale(1.08) rotate(5deg); filter: drop-shadow(0 0 20px rgba(196, 30, 58, 0.8)); } }
        .card-info { background: rgba(255, 255, 255, 0.95); border-radius: 8px; padding: 16px; text-align: center; margin-top: auto; }
        .dev-name { font-size: 22px; font-weight: bold; color: #1a1a1a; margin-bottom: 8px; }
        .dev-title { font-size: 14px; color: #555; margin: 4px 0; }
        .dev-company { font-size: 16px; font-weight: 600; color: #2563eb; margin-top: 8px; }
        .close-hint { position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%); color: white; font-size: 14px; opacity: 0.7; animation: blink 2s ease-in-out infinite; }
        @keyframes blink { 0%, 100% { opacity: 0.7; } 50% { opacity: 0.3; } }
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

// Gig Post Modal
const GigPostModal = ({ isOpen, onClose, onGigCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    description: '',
    fee_details: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await gigApi.createGig(formData);
      onGigCreated(response.data);
      setFormData({ title: '', subject: '', description: '', fee_details: '' });
      onClose();
    } catch (error) {
      console.error('Error creating gig:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        <div className="relative bg-white rounded-2xl max-w-lg w-full mx-auto shadow-xl transform transition-all">
          <div className="px-6 pt-6 pb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Gig</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., Mathematics Tutoring"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., Math, Physics, English"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Describe your tutoring service..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fee Details</label>
                <input
                  type="text"
                  value={formData.fee_details}
                  onChange={(e) => setFormData({ ...formData, fee_details: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., $30/hour"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Gig'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// Insufficient Credits Modal
const InsufficientCreditsModal = ({ isOpen, onClose, onBuyCredits }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        <div className="relative bg-white rounded-2xl max-w-md w-full mx-auto shadow-xl p-6 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-amber-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Insufficient Credits</h3>
          <p className="text-gray-600 mb-6">
            You need credits to create more gigs. Purchase credits to continue growing your tutoring business.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onBuyCredits}
              className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
            >
              Buy Credits
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGigFormOpen, setIsGigFormOpen] = useState(false);
  const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showEasterEgg, setShowEasterEgg] = useState(false);

  const [dashboardData, setDashboardData] = useState({
    myGigs: [],
    matchedJobs: [],
    stats: { activeGigs: 0, creditBalance: 0 }
  });

  // Pagination state
  const [currentGigsPage, setCurrentGigsPage] = useState(1);
  const [currentJobsPage, setCurrentJobsPage] = useState(1);
  const itemsPerPage = 6;

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
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser?.user_type === 'tutor') {
      setUser(storedUser);
      loadDashboardData(storedUser);
      fetchNotifications();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationAPI.getNotifications({ page: 1, page_size: 5 });
      const notifs = response.data?.results || response.data || [];
      setNotifications(notifs);
      setUnreadNotificationCount(notifs.filter(n => !n.is_read).length);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      // Set empty array on error to prevent UI issues
      setNotifications([]);
      setUnreadNotificationCount(0);
    }
  };

  const loadDashboardData = async (currentUser) => {
    setIsLoading(true);
    try {
      const [gigsData, creditBalanceData, matchedJobsResponse] = await Promise.all([
        tutorAPI.getTutorGigs(currentUser.id),
        point.getUserCredits(currentUser.id),
        jobAPI.getMatchedJobs(),
      ]);

      const myGigs = gigsData || [];
      const matchedJobsData = matchedJobsResponse.data;
      const matchedJobs = Array.isArray(matchedJobsData)
        ? matchedJobsData
        : (matchedJobsData?.results || []);

      setDashboardData({
        myGigs,
        matchedJobs,
        stats: {
          activeGigs: myGigs.filter(gig => gig.is_active).length || myGigs.length,
          creditBalance: creditBalanceData.balance || 0,
        }
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Pagination calculations
  const totalGigs = dashboardData.myGigs.length;
  const totalGigsPages = Math.ceil(totalGigs / itemsPerPage);
  const currentGigs = dashboardData.myGigs.slice(
    (currentGigsPage - 1) * itemsPerPage,
    currentGigsPage * itemsPerPage
  );

  const matchedJobsArray = Array.isArray(dashboardData.matchedJobs) ? dashboardData.matchedJobs : [];
  const totalJobs = matchedJobsArray.length;
  const totalJobsPages = Math.ceil(totalJobs / itemsPerPage);
  const currentJobs = matchedJobsArray.slice(
    (currentJobsPage - 1) * itemsPerPage,
    currentJobsPage * itemsPerPage
  );

  const handleGigCreated = async () => {
    if (user) {
      try {
        const freeGigsLimit = 5;
        if (dashboardData.myGigs.length >= freeGigsLimit) {
          await axios.post(`${process.env.REACT_APP_API_URL}/api/point/update/`, {
            id: user.id,
            amount: 1,
            isincrease: false
          });
        }
        await loadDashboardData(user);
      } catch (error) {
        console.error('Error after gig creation:', error);
      }
    }
    setIsGigFormOpen(false);
  };

  const handleCreateGigClick = () => {
    const freeGigsLimit = 5;
    if (dashboardData.myGigs.length < freeGigsLimit || dashboardData.stats.creditBalance > 0) {
      setIsGigFormOpen(true);
    } else {
      setShowInsufficientCreditsModal(true);
    }
  };

  const handleNavigateToBuyCredits = () => navigate('/buy-points');

  const handleToggleNotifications = () => {
    if (!showNotifications) {
      notificationAPI.markAsRead();
      setUnreadNotificationCount(0);
    }
    setShowNotifications(!showNotifications);
  };

  const handleViewGig = (gig) => {
    if (gig?.id) navigate(`/gigs/${gig.id}`);
  };

  const handleViewJob = (job) => {
    if (job?.id) navigate(`/jobs/${job.id}`);
  };

  const handleGigsPageChange = (page) => {
    setCurrentGigsPage(page);
    document.getElementById('gigs-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleJobsPageChange = (page) => {
    setCurrentJobsPage(page);
    document.getElementById('jobs-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user || user.user_type !== 'tutor') {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-rose-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">
              You must be a <strong>tutor</strong> to access this dashboard.
            </p>
            <button
              onClick={() => navigate('/')}
              className="w-full px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
            >
              Go to Home
            </button>
          </div>
        </div>
      </>
    );
  }

  const freeGigsRemaining = Math.max(0, 5 - dashboardData.myGigs.length);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-600">
      <Navbar />
      <main className="max-w-7xl mx-auto mt-16 px-4 sm:px-6 lg:px-8 py-8">

        {/* Dashboard Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Welcome back, {user?.first_name || 'Tutor'}
            </h1>
            <p className="mt-2 text-gray-500 text-lg">Manage your gigs and find students to teach.</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <NotificationDropdown
              notifications={notifications}
              unreadCount={unreadNotificationCount}
              isOpen={showNotifications}
              onToggle={handleToggleNotifications}
              onMarkAsRead={() => {
                notificationAPI.markAsRead();
                setUnreadNotificationCount(0);
              }}
            />

            <button
              onClick={() => navigate('/messages')}
              className="relative p-2 text-gray-400 hover:text-gray-500 transition-colors"
              aria-label="Messages"
            >
              <MessageCircle className="w-6 h-6" />
            </button>

            <div className="h-6 w-px bg-gray-200 mx-2 hidden sm:block"></div>

            <button
              onClick={handleCreateGigClick}
              className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              Create Gig
            </button>

            <button
              onClick={handleNavigateToBuyCredits}
              className="inline-flex items-center px-5 py-2.5 border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all"
            >
              <Wallet className="-ml-1 mr-2 h-5 w-5 text-gray-400" />
              Buy Points
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="Available Points"
            value={dashboardData.stats.creditBalance}
            icon={Wallet}
            color="emerald"
          />
          <StatCard
            title="Active Gigs"
            value={dashboardData.stats.activeGigs}
            icon={Briefcase}
            color="indigo"
          />
          <StatCard
            title="Matched Jobs"
            value={totalJobs}
            icon={Users}
            color="violet"
          />
          <StatCard
            title="Free Gigs Left"
            value={freeGigsRemaining}
            icon={Award}
            color="amber"
          />
        </div>

        {/* Info Banner */}
        {freeGigsRemaining > 0 ? (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8">
            <div className="flex items-center">
              <Zap className="w-5 h-5 text-blue-600 mr-2" />
              <p className="text-sm text-blue-800">
                You have <strong>{freeGigsRemaining} free gig{freeGigsRemaining === 1 ? '' : 's'}</strong> remaining. Create gigs to showcase your skills!
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-8">
            <div className="flex items-center">
              <Wallet className="w-5 h-5 text-amber-600 mr-2" />
              <p className="text-sm text-amber-800">
                You've used all free gigs. New gigs will cost <strong>1 point each</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Quick Actions Banner */}
        <section className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6 mb-12">
          <div>
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              Grow Your Tutoring Business
            </h2>
            <p className="text-indigo-100 max-w-xl">
              Browse jobs that match your skills and apply to connect with students looking for tutors like you.
            </p>
          </div>
          <div className="flex gap-4 shrink-0">
            <Link to="/jobs" className="px-5 py-2.5 bg-white text-indigo-600 rounded-lg font-bold hover:bg-indigo-50 transition-colors shadow-sm">
              Browse Jobs
            </Link>
            <Link to="/qna" className="px-5 py-2.5 bg-indigo-700/50 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors border border-indigo-500">
              Answer Questions
            </Link>
          </div>
        </section>

        {/* Gigs Section */}
        <section id="gigs-section" className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              Your Gigs {totalGigs > 0 && <span className="text-sm font-normal text-slate-500 ml-1">({totalGigs})</span>}
            </h2>
            {totalGigs > 0 && (
              <span className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
                Page {currentGigsPage} of {totalGigsPages}
              </span>
            )}
          </div>

          {dashboardData.myGigs.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-1">No gigs created yet</h3>
              <p className="text-slate-500 mb-6">Create your first gig to start attracting students.</p>
              <button
                onClick={handleCreateGigClick}
                className="inline-flex items-center px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Gig
              </button>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {currentGigs.map((gig) => (
                  <GigCard key={safeKey(gig)} gig={gig} onView={handleViewGig} />
                ))}
              </div>
              {totalGigsPages > 1 && (
                <Pagination
                  currentPage={currentGigsPage}
                  totalPages={totalGigsPages}
                  onPageChange={handleGigsPageChange}
                />
              )}
            </>
          )}
        </section>

        {/* Matched Jobs Section */}
        <section id="jobs-section" className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Jobs Matching Your Skills {totalJobs > 0 && <span className="text-sm font-normal text-slate-500 ml-1">({totalJobs})</span>}
            </h2>
            {totalJobs > 0 && (
              <Link to="/jobs" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {matchedJobsArray.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-1">No matched jobs yet</h3>
              <p className="text-slate-500 mb-6">Create gigs to get matched with relevant tutoring jobs.</p>
              <Link
                to="/jobs"
                className="inline-flex items-center px-5 py-2.5 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition-all shadow-sm hover:shadow-md"
              >
                Browse All Jobs
              </Link>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {currentJobs.map((job) => (
                  <JobCard key={safeKey(job)} job={job} onView={handleViewJob} />
                ))}
              </div>
              {totalJobsPages > 1 && (
                <Pagination
                  currentPage={currentJobsPage}
                  totalPages={totalJobsPages}
                  onPageChange={handleJobsPageChange}
                />
              )}
            </>
          )}
        </section>

      </main>

      <GigPostModal
        isOpen={isGigFormOpen}
        onClose={() => setIsGigFormOpen(false)}
        onGigCreated={handleGigCreated}
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

      <Footer />
    </div>
  );
};

export default TeacherDashboard;
