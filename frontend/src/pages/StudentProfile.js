import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LoadingSpinner from "../components/LoadingSpinner";
import { studentAPI } from "../utils/apiService";
import { useAuth } from "../contexts/AuthContext";
import {
  MapPin,
  Mail,
  Phone,
  User,
  Briefcase,
  Clock,
  Calendar,
  CheckCircle,
  MessageCircle,
  BookOpen,
  HelpCircle,
  ChevronRight,
  DollarSign,
  Users,
  FileText,
  Sparkles,
  Shield,
  Award,
  Target
} from "lucide-react";

// Stats Card Component
const StatCard = ({ icon: Icon, label, value, color = "purple" }) => {
  const colorClasses = {
    purple: "bg-secondary-50 dark:bg-secondary-900/30 text-secondary-600 dark:text-secondary-400",
    blue: "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400",
    emerald: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
    amber: "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
    rose: "bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400",
    indigo: "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-dark-card rounded-xl p-4 border border-gray-100 dark:border-dark-border shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
        </div>
      </div>
    </motion.div>
  );
};

// Job Card Component
const JobCard = ({ job }) => {
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/30';
      case 'in_progress':
        return 'bg-primary-100 text-primary-700 border-primary-200 dark:bg-primary-900/30 dark:text-primary-400 dark:border-primary-800/30';
      case 'completed':
        return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-dark-bg-tertiary dark:text-gray-300 dark:border-dark-border';
      case 'closed':
        return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800/30';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-dark-bg-tertiary dark:text-gray-300 dark:border-dark-border';
    }
  };

  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onClick={() => navigate(`/jobs/${job.id}`)}
      className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden shadow-sm hover:shadow-lg dark:hover:shadow-glow transition-all cursor-pointer group"
    >
      {/* Job Header with gradient */}
      <div className="h-20 bg-gradient-to-br from-primary-500 via-secondary-500 to-pink-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMiIvPjwvZz48L3N2Zz4=')] opacity-30"></div>
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm text-white border border-white/20">
            <BookOpen className="w-3 h-3 mr-1" />
            {job.subject_details?.[0] || job.subject?.name || job.subject || "General"}
          </span>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(job.status)}`}>
            {formatStatus(job.status)}
          </span>
        </div>
      </div>

      {/* Job Content */}
      <div className="p-4">
        <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-secondary-600 dark:group-hover:text-secondary-400 transition-colors mb-2 line-clamp-2">
          {job.subject_details?.length > 0
            ? `${job.subject_details.join(', ')} Tutoring`
            : "Tutoring Request"}
        </h4>
        <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4">
          {job.description || "No description provided"}
        </p>

        {/* Job Meta */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
          {job.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {job.location}
            </span>
          )}
          {job.budget && (
            <span className="flex items-center gap-1 text-secondary-600 dark:text-secondary-400 font-medium">
              <DollarSign className="w-3 h-3" />
              ${job.budget}{job.budget_type === 'Hourly' ? '/hr' : ''}
            </span>
          )}
        </div>

        {/* Job Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-dark-border">
          <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {job.created_at
              ? new Date(job.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })
              : "Recently"}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 group-hover:text-secondary-500 dark:group-hover:text-secondary-400 transition-colors">
            View Details
            <ChevronRight className="w-3 h-3" />
          </span>
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
        ? 'bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-400'
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary'
    }`}
  >
    <Icon className="w-4 h-4" />
    {label}
    {count !== undefined && (
      <span className={`px-1.5 py-0.5 rounded-full text-xs ${
        active ? 'bg-secondary-200 dark:bg-secondary-800/50 text-secondary-800 dark:text-secondary-200' : 'bg-gray-200 dark:bg-dark-border text-gray-600 dark:text-gray-400'
      }`}>
        {count}
      </span>
    )}
  </button>
);

export default function StudentProfilePage({ initialData }) {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(initialData || null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    if (initialData) {
      setProfile(initialData);
      // Jobs are now included in the profile response
      setJobs(initialData.jobs || []);
      setLoading(false);
      return;
    }
    if (!studentId) return;

    async function fetchStudent() {
      try {
        setLoading(true);
        const res = await studentAPI.getStudentProfile(studentId);
        setProfile(res.data);
        // Jobs are now included in the profile response from backend
        setJobs(res.data.jobs || []);
      } catch (err) {
        setError(err.message || "Failed to load student data.");
      } finally {
        setLoading(false);
      }
    }
    fetchStudent();
  }, [studentId, initialData]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col items-center justify-center">
      <LoadingSpinner />
      <p className="mt-4 text-gray-500 dark:text-gray-400">Loading profile...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <p className="text-rose-600 dark:text-rose-400 font-medium">{error}</p>
      </div>
    </div>
  );

  if (!profile) return null;

  const isOwnProfile = user?.id === profile.id;

  // Calculate stats
  const stats = {
    jobsPosted: jobs.length || profile.jobs_count || 0,
    questionsAsked: profile.questions_count || 0,
    memberSince: profile.date_joined
      ? new Date(profile.date_joined).getFullYear()
      : new Date().getFullYear()
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg font-sans text-gray-900 dark:text-white transition-colors duration-300">
      <Navbar />

      <main className="min-h-screen dark:bg-dark-bg">
        {/* Hero Cover Section */}
        <div className="relative h-64 md:h-72 bg-gradient-to-br from-primary-600 via-secondary-600 to-pink-500 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0">
            <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl"></div>
            <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-primary-400/10 rounded-full blur-2xl"></div>
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
            className="bg-white dark:bg-dark-card rounded-2xl shadow-xl dark:shadow-glow border border-gray-100 dark:border-dark-border overflow-hidden mb-6"
          >
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-end gap-6">
                {/* Profile Picture */}
                <div className="relative flex-shrink-0 mx-auto md:mx-0">
                  <div className="w-32 h-32 md:w-36 md:h-36 rounded-2xl border-4 border-white dark:border-dark-card shadow-lg overflow-hidden bg-gradient-to-br from-primary-500 to-secondary-600">
                    {profile.profile_picture ? (
                      <img
                        src={profile.profile_picture}
                        alt={profile.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
                        {profile.username?.charAt(0).toUpperCase() || "S"}
                      </div>
                    )}
                  </div>
                  {profile.is_verified && (
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-dark-card">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                      {profile.first_name && profile.last_name
                        ? `${profile.first_name} ${profile.last_name}`
                        : profile.username}
                    </h1>
                    {profile.is_verified && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                        <Shield className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                    {profile.is_premium && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                        <Sparkles className="w-3 h-3" />
                        Premium
                      </span>
                    )}
                  </div>

                  <p className="text-gray-500 dark:text-gray-400 mb-1">@{profile.username}</p>

                  {/* Student Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 rounded-full text-sm font-medium mt-2">
                    <User className="w-4 h-4" />
                    Student
                  </div>

                  {/* Location */}
                  {profile.location && (
                    <div className="flex items-center justify-center md:justify-start gap-1.5 text-sm text-gray-600 dark:text-gray-400 mt-3">
                      <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      {profile.location}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row md:flex-col gap-3 mt-4 md:mt-0">
                  {!isOwnProfile && (
                    <button
                      onClick={() => navigate(`/messages/?username=${encodeURIComponent(profile.username)}`)}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold shadow-lg hover:shadow-glow hover:-translate-y-0.5 transition-all"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Message
                    </button>
                  )}
                  {isOwnProfile && (
                    <button
                      onClick={() => navigate('/profile')}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gray-100 dark:bg-dark-bg-tertiary hover:bg-gray-200 dark:hover:bg-dark-bg-secondary text-gray-700 dark:text-gray-200 font-semibold transition-all"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="border-t border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-dark-bg-secondary/30 px-6 py-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard icon={Briefcase} label="Jobs Posted" value={stats.jobsPosted} color="purple" />
                <StatCard icon={HelpCircle} label="Questions Asked" value={stats.questionsAsked} color="blue" />
                <StatCard icon={Calendar} label="Member Since" value={stats.memberSince} color="emerald" />
              </div>
            </div>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tabs */}
              <div className="bg-white dark:bg-dark-card rounded-xl p-2 border border-gray-200 dark:border-dark-border shadow-sm">
                <div className="flex flex-wrap gap-2">
                  <TabButton
                    active={activeTab === 'about'}
                    onClick={() => setActiveTab('about')}
                    icon={User}
                    label="About"
                  />
                  <TabButton
                    active={activeTab === 'jobs'}
                    onClick={() => setActiveTab('jobs')}
                    icon={Briefcase}
                    label="Posted Jobs"
                    count={stats.jobsPosted}
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
                    <div className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-dark-border shadow-sm">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <div className="w-8 h-8 bg-secondary-100 dark:bg-secondary-900/30 rounded-lg flex items-center justify-center">
                          <User className="w-4 h-4 text-secondary-600 dark:text-secondary-400" />
                        </div>
                        About Me
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {profile.bio || "This student hasn't written a bio yet."}
                      </p>
                    </div>

                    {/* Learning Goals or Interests (if available) */}
                    {profile.interests && profile.interests.length > 0 && (
                      <div className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-dark-border shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                            <Target className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                          </div>
                          Learning Interests
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.interests.map((interest, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800/30"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Activity Summary */}
                    <div className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-dark-border shadow-sm">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                          <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        Activity Summary
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 dark:bg-dark-bg-secondary rounded-lg">
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.jobsPosted}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Jobs Posted</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-dark-bg-secondary rounded-lg">
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.questionsAsked}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Questions Asked</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'jobs' && (
                  <motion.div
                    key="jobs"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {jobs.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {jobs.map((job, index) => (
                          <motion.div
                            key={job.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <JobCard job={job} />
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white dark:bg-dark-card rounded-xl p-12 border border-gray-200 dark:border-dark-border text-center">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-dark-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                          <Briefcase className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Jobs Posted</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">This student hasn't posted any tutoring jobs yet.</p>
                        {isOwnProfile && (
                          <button
                            onClick={() => navigate('/jobs/create')}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary-600 hover:bg-secondary-700 text-white font-medium transition-colors"
                          >
                            Post Your First Job
                          </button>
                        )}
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
                className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-dark-border shadow-sm sticky top-24"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Contact Information</h3>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-bg-secondary rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Email</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {profile.email || "Hidden"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-bg-secondary rounded-lg">
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">WhatsApp</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {profile.phone_number || "Hidden"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Member Since */}
                {profile.date_joined && (
                  <div className="mt-6 pt-4 border-t border-gray-100 dark:border-dark-border">
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Member since {new Date(profile.date_joined).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long'
                      })}
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Quick Actions Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl p-6 text-white"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">Looking for a Tutor?</h3>
                    <p className="text-primary-200 text-sm">Find the perfect match</p>
                  </div>
                </div>

                <p className="text-primary-100 text-sm mb-4">
                  Browse our network of qualified tutors and find the perfect match for your learning needs.
                </p>

                <button
                  onClick={() => navigate('/tutors')}
                  className="w-full py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg font-medium transition-colors text-center"
                >
                  Browse Tutors
                </button>
              </motion.div>

              {/* Post a Job CTA */}
              {isOwnProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-dark-border shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-secondary-100 dark:bg-secondary-900/30 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">Need Help?</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Post a tutoring job</p>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    Create a job listing and let qualified tutors apply to help you.
                  </p>

                  <button
                    onClick={() => navigate('/jobs/create')}
                    className="w-full py-2.5 bg-secondary-600 hover:bg-secondary-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Post a Job
                  </button>
                </motion.div>
              )}
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
