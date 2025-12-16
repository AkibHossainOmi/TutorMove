import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { tutorAPI, reviewAPI } from "../utils/apiService";
import LoadingSpinner from "../components/LoadingSpinner";
import GiftCoinModal from "../components/GiftCoinModal";
import { useAuth } from "../contexts/AuthContext";
import { pointsAPI } from "../utils/apiService";
import {
  Star,
  MapPin,
  MessageCircle,
  Gift,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
  BookOpen,
  Clock,
  CheckCircle,
  Users,
  Award,
  ChevronRight,
  Calendar,
  DollarSign,
  Sparkles,
  Shield,
  ExternalLink,
  ThumbsUp
} from "lucide-react";

// Stats Card Component
const StatCard = ({ icon: Icon, label, value, color = "purple" }) => {
  const colorClasses = {
    purple: "bg-purple-100 text-purple-600",
    blue: "bg-blue-100 text-blue-600",
    emerald: "bg-emerald-100 text-emerald-600",
    amber: "bg-amber-100 text-amber-600",
    rose: "bg-rose-100 text-rose-600"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-xs text-slate-500 font-medium">{label}</p>
        </div>
      </div>
    </motion.div>
  );
};

// Gig Card Component
const GigCard = ({ gig, tutorUsername }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onClick={() => navigate(`/gigs/${gig.id}`)}
      className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
    >
      {/* Gig Header with gradient */}
      <div className="h-24 bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMiIvPjwvZz48L3N2Zz4=')] opacity-30"></div>
        <div className="absolute bottom-3 left-4 right-4">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm text-white border border-white/20">
            <BookOpen className="w-3 h-3 mr-1" />
            {gig.subject}
          </span>
        </div>
      </div>

      {/* Gig Content */}
      <div className="p-4">
        <h4 className="font-semibold text-slate-900 group-hover:text-purple-600 transition-colors mb-2 line-clamp-2">
          {gig.title}
        </h4>
        <p className="text-slate-500 text-sm line-clamp-2 mb-4">
          {gig.description || "No description provided"}
        </p>

        {/* Gig Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          {gig.fee_details && (
            <span className="text-sm font-semibold text-purple-600">
              {gig.fee_details}
            </span>
          )}
          <span className="text-xs text-slate-400 flex items-center gap-1 group-hover:text-purple-500 transition-colors ml-auto">
            View Details
            <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// Review Card Component
const ReviewCard = ({ review }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm"
    >
      <div className="flex items-start gap-4">
        {/* Reviewer Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
          {review.student_name?.charAt(0).toUpperCase() || "S"}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-slate-900">{review.student_name || "Student"}</h4>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                />
              ))}
            </div>
          </div>

          {/* Comment */}
          <p className="text-slate-600 text-sm leading-relaxed">
            {review.comment || "No comment provided"}
          </p>

          {/* Date */}
          <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(review.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// Tab Button Component
const TabButton = ({ active, onClick, icon: Icon, label, count }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
      active
        ? 'bg-purple-100 text-purple-700'
        : 'text-slate-600 hover:bg-slate-100'
    }`}
  >
    <Icon className="w-4 h-4" />
    {label}
    {count !== undefined && (
      <span className={`px-1.5 py-0.5 rounded-full text-xs ${
        active ? 'bg-purple-200 text-purple-800' : 'bg-slate-200 text-slate-600'
      }`}>
        {count}
      </span>
    )}
  </button>
);

export default function TutorProfilePage({ initialData }) {
  const { tutorId } = useParams();
  const [profile, setProfile] = useState(initialData || null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(null);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [userCreditBalance, setUserCreditBalance] = useState(0);
  const [activeTab, setActiveTab] = useState('about');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (initialData) {
      setProfile(initialData);
      setLoading(false);
      return;
    }

    if (!tutorId) return;

    async function fetchData() {
      try {
        setLoading(true);
        const profileData = await tutorAPI.getTutorProfile(tutorId);
        setProfile(profileData.data);

        // Fetch reviews for this tutor
        try {
          const reviewsData = await reviewAPI.getReviews({ tutor: tutorId });
          setReviews(reviewsData.data?.results || reviewsData.data || []);
        } catch {
          // Reviews might not be available
          setReviews([]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [tutorId, initialData]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
      <LoadingSpinner />
      <p className="mt-4 text-slate-500">Loading profile...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    </div>
  );

  if (!profile) return null;

  const isStudent = user?.user_type === "student";
  const isOwnProfile = user?.id === profile.id;

  const fetchUserBalance = async () => {
    try {
      const res = await pointsAPI.getBalance();
      setUserCreditBalance(res.data.balance);
    } catch (err) {
      console.error("Failed to fetch balance", err);
    }
  };

  const openGiftModal = () => {
    fetchUserBalance();
    setIsGiftModalOpen(true);
  };

  // Calculate stats
  const stats = {
    rating: profile.average_rating?.toFixed(1) || "0.0",
    reviews: profile.review_count || 0,
    gigs: profile.gigs?.length || 0,
    students: profile.students_taught || 0
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50">
        {/* Hero Cover Section */}
        <div className="relative h-64 md:h-80 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0">
            <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"></div>
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-400/10 rounded-full blur-2xl"></div>
          </div>

          {/* Pattern overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDgpIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-50"></div>
        </div>

        {/* Profile Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10 pb-12">
          {/* Profile Header Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden mb-6"
          >
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-end gap-6">
                {/* Profile Picture */}
                <div className="relative flex-shrink-0 mx-auto md:mx-0">
                  <div className="w-32 h-32 md:w-36 md:h-36 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-purple-500 to-indigo-600">
                    {profile.profile_picture ? (
                      <img
                        src={profile.profile_picture}
                        alt={profile.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
                        {profile.username?.charAt(0).toUpperCase() || "T"}
                      </div>
                    )}
                  </div>
                  {profile.is_verified && (
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                      {profile.first_name && profile.last_name
                        ? `${profile.first_name} ${profile.last_name}`
                        : profile.username}
                    </h1>
                    {profile.is_verified && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                        <Shield className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                    {profile.is_premium && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                        <Sparkles className="w-3 h-3" />
                        Premium
                      </span>
                    )}
                  </div>

                  <p className="text-slate-500 mb-1">@{profile.username}</p>

                  {/* Location & Rate */}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-600 mt-3">
                    {profile.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        {profile.location}
                      </span>
                    )}
                    {profile.hourly_rate && (
                      <span className="flex items-center gap-1.5 font-semibold text-purple-600">
                        <DollarSign className="w-4 h-4" />
                        ${profile.hourly_rate}/hour
                      </span>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center justify-center md:justify-start gap-2 mt-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(profile.average_rating || 0)
                              ? 'text-amber-400 fill-amber-400'
                              : i < (profile.average_rating || 0)
                              ? 'text-amber-400 fill-amber-400 opacity-50'
                              : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-semibold text-slate-900">{stats.rating}</span>
                    <span className="text-slate-500">({stats.reviews} reviews)</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row md:flex-col gap-3 mt-4 md:mt-0">
                  {!isOwnProfile && (
                    <>
                      <button
                        onClick={() => navigate(`/messages/?username=${encodeURIComponent(profile.username)}`)}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                      >
                        <MessageCircle className="w-5 h-5" />
                        Message
                      </button>
                      {isStudent && (
                        <button
                          onClick={openGiftModal}
                          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-md hover:shadow-lg transition-all"
                        >
                          <Gift className="w-5 h-5" />
                          Gift Coins
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={Star} label="Rating" value={stats.rating} color="amber" />
                <StatCard icon={ThumbsUp} label="Reviews" value={stats.reviews} color="blue" />
                <StatCard icon={BookOpen} label="Active Gigs" value={stats.gigs} color="purple" />
                <StatCard icon={Users} label="Students" value={stats.students || "New"} color="emerald" />
              </div>
            </div>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tabs */}
              <div className="bg-white rounded-xl p-2 border border-slate-200 shadow-sm">
                <div className="flex flex-wrap gap-2">
                  <TabButton
                    active={activeTab === 'about'}
                    onClick={() => setActiveTab('about')}
                    icon={Briefcase}
                    label="About"
                  />
                  <TabButton
                    active={activeTab === 'gigs'}
                    onClick={() => setActiveTab('gigs')}
                    icon={BookOpen}
                    label="Gigs"
                    count={stats.gigs}
                  />
                  <TabButton
                    active={activeTab === 'reviews'}
                    onClick={() => setActiveTab('reviews')}
                    icon={Star}
                    label="Reviews"
                    count={stats.reviews}
                  />
                </div>
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {activeTab === 'about' && (
                  <motion.div
                    key="about"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    {/* About Me */}
                    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                      <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Briefcase className="w-4 h-4 text-purple-600" />
                        </div>
                        About Me
                      </h3>
                      <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {profile.bio || "This tutor hasn't written a bio yet."}
                      </p>
                    </div>

                    {/* Education & Experience Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <GraduationCap className="w-4 h-4 text-blue-600" />
                          </div>
                          Education
                        </h3>
                        <p className="text-slate-600">
                          {profile.education || "Not specified"}
                        </p>
                      </div>

                      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <Award className="w-4 h-4 text-emerald-600" />
                          </div>
                          Experience
                        </h3>
                        <p className="text-slate-600">
                          {profile.experience || "Not specified"}
                        </p>
                      </div>
                    </div>

                    {/* Subjects */}
                    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                      <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-indigo-600" />
                        </div>
                        Subjects
                      </h3>
                      {profile.subjects?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {profile.subjects.map((subj, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 border border-purple-200"
                            >
                              {subj}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-500 italic">No subjects listed.</p>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'gigs' && (
                  <motion.div
                    key="gigs"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {profile.gigs?.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {profile.gigs.map((gig, index) => (
                          <motion.div
                            key={gig.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <GigCard gig={gig} tutorUsername={profile.username} />
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white rounded-xl p-12 border border-slate-200 text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <BookOpen className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">No Active Gigs</h3>
                        <p className="text-slate-500">This tutor hasn't posted any gigs yet.</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'reviews' && (
                  <motion.div
                    key="reviews"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {reviews.length > 0 ? (
                      <div className="space-y-4">
                        {reviews.map((review, index) => (
                          <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <ReviewCard review={review} />
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white rounded-xl p-12 border border-slate-200 text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Star className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">No Reviews Yet</h3>
                        <p className="text-slate-500">This tutor hasn't received any reviews yet.</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Column - Sidebar */}
            <aside className="space-y-6">
              {/* Contact Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm sticky top-24"
              >
                <h3 className="text-lg font-bold text-slate-900 mb-4">Contact Information</h3>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Email</p>
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {profile.email || "Hidden"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">WhatsApp</p>
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {profile.phone_number || "Hidden"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Member Since */}
                {profile.date_joined && (
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <p className="text-sm text-slate-500 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Member since {new Date(profile.date_joined).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long'
                      })}
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Quick Stats Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl p-6 text-white"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">Tutor Stats</h3>
                    <p className="text-purple-200 text-sm">Performance overview</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-purple-200">Response Rate</span>
                    <span className="font-semibold">95%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-purple-200">Avg. Response</span>
                    <span className="font-semibold">2 hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-purple-200">Satisfaction</span>
                    <span className="font-semibold">{stats.rating}/5.0</span>
                  </div>
                </div>
              </motion.div>
            </aside>
          </div>
        </div>
      </main>

      <GiftCoinModal
        isOpen={isGiftModalOpen}
        onClose={() => setIsGiftModalOpen(false)}
        tutorId={profile?.id}
        tutorName={profile.username}
        currentBalance={userCreditBalance}
      />
      <Footer />
    </>
  );
}
