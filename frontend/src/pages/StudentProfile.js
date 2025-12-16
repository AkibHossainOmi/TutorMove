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
    purple: "bg-purple-100 text-purple-600",
    blue: "bg-blue-100 text-blue-600",
    emerald: "bg-emerald-100 text-emerald-600",
    amber: "bg-amber-100 text-amber-600",
    rose: "bg-rose-100 text-rose-600",
    indigo: "bg-indigo-100 text-indigo-600"
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

// Job Card Component
const JobCard = ({ job }) => {
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'closed':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
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
      className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
    >
      {/* Job Header with gradient */}
      <div className="h-20 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative overflow-hidden">
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
        <h4 className="font-semibold text-slate-900 group-hover:text-purple-600 transition-colors mb-2 line-clamp-2">
          {job.subject_details?.length > 0
            ? `${job.subject_details.join(', ')} Tutoring`
            : "Tutoring Request"}
        </h4>
        <p className="text-slate-500 text-sm line-clamp-2 mb-4">
          {job.description || "No description provided"}
        </p>

        {/* Job Meta */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-3">
          {job.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {job.location}
            </span>
          )}
          {job.budget && (
            <span className="flex items-center gap-1 text-purple-600 font-medium">
              <DollarSign className="w-3 h-3" />
              ${job.budget}{job.budget_type === 'Hourly' ? '/hr' : ''}
            </span>
          )}
        </div>

        {/* Job Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {job.created_at
              ? new Date(job.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })
              : "Recently"}
          </span>
          <span className="text-xs text-slate-400 flex items-center gap-1 group-hover:text-purple-500 transition-colors">
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
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg flex flex-col items-center justify-center">
      <LoadingSpinner />
      <p className="mt-4 text-slate-500 dark:text-dark-text-muted">Loading profile...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <p className="text-red-600 font-medium">{error}</p>
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
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg font-sans text-slate-900 dark:text-dark-text-primary">
      <Navbar />

      <main className="min-h-screen dark:bg-dark-bg">
        {/* Hero Cover Section */}
        <div className="relative h-64 md:h-72 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0">
            <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl"></div>
            <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-indigo-400/10 rounded-full blur-2xl"></div>
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
                  <div className="w-32 h-32 md:w-36 md:h-36 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600">
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

                  {/* Student Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium mt-2">
                    <User className="w-4 h-4" />
                    Student
                  </div>

                  {/* Location */}
                  {profile.location && (
                    <div className="flex items-center justify-center md:justify-start gap-1.5 text-sm text-slate-600 mt-3">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {profile.location}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row md:flex-col gap-3 mt-4 md:mt-0">
                  {!isOwnProfile && (
                    <button
                      onClick={() => navigate(`/messages/?username=${encodeURIComponent(profile.username)}`)}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Message
                    </button>
                  )}
                  {isOwnProfile && (
                    <button
                      onClick={() => navigate('/profile')}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-all"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4">
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
              <div className="bg-white rounded-xl p-2 border border-slate-200 shadow-sm">
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
                    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                      <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <User className="w-4 h-4 text-purple-600" />
                        </div>
                        About Me
                      </h3>
                      <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {profile.bio || "This student hasn't written a bio yet."}
                      </p>
                    </div>

                    {/* Learning Goals or Interests (if available) */}
                    {profile.interests && profile.interests.length > 0 && (
                      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <Target className="w-4 h-4 text-indigo-600" />
                          </div>
                          Learning Interests
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.interests.map((interest, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-200"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Activity Summary */}
                    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                      <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <Award className="w-4 h-4 text-emerald-600" />
                        </div>
                        Activity Summary
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <p className="text-2xl font-bold text-slate-900">{stats.jobsPosted}</p>
                          <p className="text-sm text-slate-500">Jobs Posted</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <p className="text-2xl font-bold text-slate-900">{stats.questionsAsked}</p>
                          <p className="text-sm text-slate-500">Questions Asked</p>
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
                      <div className="bg-white rounded-xl p-12 border border-slate-200 text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Briefcase className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">No Jobs Posted</h3>
                        <p className="text-slate-500 mb-4">This student hasn't posted any tutoring jobs yet.</p>
                        {isOwnProfile && (
                          <button
                            onClick={() => navigate('/jobs/create')}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors"
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

              {/* Quick Actions Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-6 text-white"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">Looking for a Tutor?</h3>
                    <p className="text-indigo-200 text-sm">Find the perfect match</p>
                  </div>
                </div>

                <p className="text-indigo-100 text-sm mb-4">
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
                  className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Need Help?</h3>
                      <p className="text-slate-500 text-sm">Post a tutoring job</p>
                    </div>
                  </div>

                  <p className="text-slate-600 text-sm mb-4">
                    Create a job listing and let qualified tutors apply to help you.
                  </p>

                  <button
                    onClick={() => navigate('/jobs/create')}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
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
