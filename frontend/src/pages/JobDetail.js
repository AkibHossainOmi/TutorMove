import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BuyCreditsModal from '../components/BuyCreditsModal';
import { 
  FiBriefcase, FiMapPin, FiBook, FiUser, FiCalendar, 
  FiAlertCircle, FiDollarSign, FiClock, FiGlobe, FiPhone, FiUsers,
  FiStar, FiCheckCircle, FiLock, FiUnlock, FiX, FiTrendingUp, FiArrowLeft
} from 'react-icons/fi';
import { jobAPI, pointsAPI } from '../utils/apiService';
import JobApplicants from '../components/JobApplicants';
import GiftCoinModal from '../components/GiftCoinModal';
import StarRating from '../components/StarRating';

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobUnlocked, setJobUnlocked] = useState(false);
  const [creditsNeeded, setCreditsNeeded] = useState(0);
  const [nextCreditsNeeded, setNextCreditsNeeded] = useState(0);
  const [unlockStatus, setUnlockStatus] = useState('idle');
  const [showBuyCreditsModal, setShowBuyCreditsModal] = useState(false);
  const [unlockErrorMessage, setUnlockErrorMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isInPriorityWindow, setIsInPriorityWindow] = useState(false);
  const [unlockRestricted, setUnlockRestricted] = useState(false);

  // Rating states
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  // Gift Coin State
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [userCreditBalance, setUserCreditBalance] = useState(0);

  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setCurrentUser(JSON.parse(userData));
  }, []);

  const isTutor = currentUser?.user_type === 'tutor';
  const isStudent = currentUser?.user_type === 'student';

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 4000);
  };

  useEffect(() => {
    let isMounted = true;

    const fetchJobData = async () => {
      try {
        const response = await jobAPI.getJobDetail(id);
        if (!isMounted) return;
        setJob(response.data);

        if (isTutor) {
          const unlockRes = await jobAPI.getJobUnlockPreview(id);
          if (!isMounted) return;
          setJobUnlocked(unlockRes.data.unlocked);
          setCreditsNeeded(unlockRes.data.points_needed);
          setNextCreditsNeeded(unlockRes.data.future_points_needed)
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Error fetching job:', err);
        setError('Failed to fetch job details.');
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    fetchJobData();
    return () => { isMounted = false; };
  }, [id, isTutor]);

  useEffect(() => {
    if (!job?.created_at) return;

    const createdTime = new Date(job.created_at).getTime();
    const endTime = createdTime + 60 * 60 * 1000; // 1 hour

    const updateTimer = () => {
      const now = Date.now();
      const diff = endTime - now;

      if (diff <= 0) {
        setTimeLeft(0);
        setIsInPriorityWindow(false);
        return;
      }

      setIsInPriorityWindow(true);

      const mins = Math.floor(diff / 1000 / 60);
      const secs = Math.floor((diff / 1000) % 60);

      setTimeLeft(`${mins}m ${secs}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [job]);

  const handleUnlockJob = async () => {
    setUnlockStatus('loading');
    setUnlockErrorMessage('');
    try {
      await jobAPI.unlockJob(id);
      setJobUnlocked(true);
      setUnlockStatus('success');
      setCreditsNeeded(0);
      setJob(prev => ({ ...prev, applicants_count: (prev?.applicants_count || 0) + 1 }));
      showToast('Job unlocked successfully!', 'success');
    } catch (err) {
      console.error('Error unlocking job:', err);
      if (err.response?.status === 403) {
        setUnlockRestricted(true);
        setUnlockStatus('failed');
        showToast(
          "Be the top tutors to apply for this job. Unlocking is currently restricted for you."
        );
        return;
      }
      else if (err.response?.data?.detail === 'Insufficient points') {
        setShowBuyCreditsModal(true);
        setUnlockStatus('failed');
      } else if (err.response?.data?.detail === 'You need an active gig with a matching subject to unlock this job.') {
        setUnlockErrorMessage(err.response.data.detail);
        setUnlockStatus('failed');
        showToast(err.response.data.detail, 'error');
      } else {
        setUnlockStatus('failed');
        showToast('Failed to unlock job. Please try again.', 'error');
      }
    }
  };

  const handleMarkComplete = async () => {
    try {
      await jobAPI.completeJob(job.id);
      setJob(prev => ({ ...prev, status: 'Completed' }));
      showToast('Job marked as completed!', 'success');
    } catch (err) {
      console.error('Error completing job:', err);
      showToast('Failed to mark job as completed.', 'error');
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewRating || reviewRating < 1 || reviewRating > 5) {
      return showToast('Please select a rating between 1 and 5 stars.', 'error');
    }
    try {
      await jobAPI.submitJobReview(job.id, { rating: reviewRating, comment: reviewComment });
      showToast('Review submitted successfully!', 'success');
      setJob(prev => ({ ...prev, review: { rating: reviewRating, comment: reviewComment } }));
      setReviewRating(0);
      setReviewComment('');
      setHoverRating(0);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.detail || 'Failed to submit review.', 'error');
    }
  };

  const handleGiftClick = async () => {
      try {
          const res = await pointsAPI.getBalance();
          setUserCreditBalance(res.data.balance);
          setIsGiftModalOpen(true);
      } catch (err) {
          console.error("Failed to fetch balance", err);
      }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const renderStars = (rating = 0, interactive = false, onRate = () => {}) => {
    return (
      <div className="flex items-center space-x-1" role={interactive ? 'radiogroup' : undefined}>
        {[1,2,3,4,5].map(star => {
          const isActive = star <= (interactive ? (hoverRating || reviewRating) : rating);
          return (
            <button
              key={star}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onRate(star)}
              onMouseEnter={() => interactive && setHoverRating(star)}
              onMouseLeave={() => interactive && setHoverRating(0)}
              className={`
                focus:outline-none transition-all
                ${interactive ? 'cursor-pointer hover:scale-110' : ''}
                ${isActive ? 'text-yellow-400' : 'text-gray-200 dark:text-gray-600'}
              `}
            >
              <FiStar size={interactive ? 24 : 16} className={`${isActive ? 'fill-current' : ''}`} />
            </button>
          );
        })}
      </div>
    );
  };

  const Toast = ({ message, type, onClose }) => {
    const bgColor = type === 'error' ? 'bg-rose-500' : 'bg-emerald-500';
    return (
      <div className={`fixed top-24 right-6 z-50 ${bgColor} text-white px-5 py-3 rounded-xl shadow-lg animate-fade-in-up`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {type === 'error' ? <FiAlertCircle /> : <FiCheckCircle />}
            <span className="text-sm font-medium">{message}</span>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 rounded-full p-1 transition-colors">
            <FiX />
          </button>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
        <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium">Loading details...</p>
      </div>
    );

    if (error) return (
      <div className="max-w-md mx-auto bg-white dark:bg-dark-card p-10 rounded-2xl shadow-sm border border-gray-200 dark:border-dark-border text-center mt-20">
        <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/30 text-rose-500 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiAlertCircle size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Something went wrong</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-8">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
        >
          Try Again
        </button>
      </div>
    );

    if (!job) return (
      <div className="max-w-md mx-auto bg-white dark:bg-dark-card p-10 rounded-2xl shadow-sm border border-gray-200 dark:border-dark-border text-center mt-20">
        <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/30 text-primary-500 dark:text-primary-400 rounded-full flex items-center justify-center mx-auto mb-4">
           <FiBriefcase size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Job Not Found</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-8">The job you're looking for doesn't exist or may have been removed.</p>
        <Link to="/jobs" className="inline-block px-6 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors">
          Browse Available Jobs
        </Link>
      </div>
    );

    return (
      <div className="max-w-7xl mx-auto space-y-6">
        {toast.show && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast({ show: false, message: '', type: '' })}
          />
        )}

        <Link to="/jobs" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-2">
           <FiArrowLeft /> Back to Jobs
        </Link>

        {isTutor && isInPriorityWindow && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 p-4 rounded-xl flex items-start gap-3">
             <FiClock className="text-amber-600 dark:text-amber-400 mt-1 flex-shrink-0" />
             <div>
                <p className="text-sm text-amber-900 dark:text-amber-100 font-semibold">
                  Priority Access: <span className="font-bold">{timeLeft}</span> left
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  Only top tutors can unlock this job during the priority window.
                </p>
             </div>
          </div>
        )}

        {/* Job Header */}
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-200 dark:border-dark-border p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 dark:bg-primary-900/10 rounded-full -mr-16 -mt-16 blur-2xl opacity-50"></div>

          <div className="flex flex-col lg:flex-row justify-between gap-8 relative z-10">
            <div className="flex-1">
              <div className="flex items-start gap-5 mb-6">
                <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center border border-primary-100 dark:border-primary-800/30 shadow-sm flex-shrink-0">
                  <FiBriefcase className="text-primary-600 dark:text-primary-400 text-2xl" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{job.service_type || 'Tutoring Job'}</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                     <FiCalendar className="text-gray-400 dark:text-gray-500" /> Posted {formatDate(job.created_at)}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
                <Link to={`/profile/${job.student.username}`} className="flex items-center gap-2 bg-gray-50 dark:bg-dark-bg-tertiary border border-gray-200 dark:border-dark-border px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-dark-card hover:border-primary-300 dark:hover:border-primary-700 hover:text-primary-600 dark:hover:text-primary-400 transition-all">
                  <div className="w-5 h-5 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-xs text-gray-600 dark:text-gray-300">
                     {job.student.username[0].toUpperCase()}
                  </div>
                  {job.student.username}
                </Link>
                <span className="flex items-center gap-2 bg-gray-50 dark:bg-dark-bg-tertiary border border-gray-200 dark:border-dark-border px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200">
                  <FiMapPin className="text-gray-400 dark:text-gray-500" />
                  {job.location || 'Remote'}
                </span>
                {job.country && (
                   <span className="flex items-center gap-2 bg-gray-50 dark:bg-dark-bg-tertiary border border-gray-200 dark:border-dark-border px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200">
                    <FiGlobe className="text-gray-400 dark:text-gray-500" />
                    {job.country}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex flex-col items-start lg:items-end gap-2 bg-gray-50/50 dark:bg-dark-bg-secondary/50 p-6 rounded-2xl border border-gray-100 dark:border-dark-border lg:bg-transparent lg:p-0 lg:border-0">
               <span className={`px-4 py-1.5 rounded-full text-sm font-bold border tracking-wide uppercase ${
                  job.status === 'Open' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/30' :
                  job.status === 'Assigned' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800/30' :
                  'bg-gray-100 dark:bg-dark-bg-tertiary text-gray-600 dark:text-gray-400 border-gray-200 dark:border-dark-border'
               }`}>
                  {job.status}
               </span>
               <div className="lg:text-right mt-2">
                  <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider font-bold mb-1">Budget</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{job.budget || 'Negotiable'} <span className="text-base font-medium text-gray-500 dark:text-gray-400">USD</span></p>
               </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">

            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-200 dark:border-dark-border overflow-hidden">
              <div className="px-8 py-5 border-b border-gray-100 dark:border-dark-border bg-gray-50/30 dark:bg-dark-bg-secondary/30 flex items-center gap-3">
                <FiBook className="text-primary-500" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Job Overview</h2>
              </div>
              <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                <DetailItem icon={<FiDollarSign />} label="Budget" value={`${job.budget} USD`} />
                <DetailItem icon={<FiClock />} label="Budget Type" value={job.budget_type} />
                <DetailItem icon={<FiBook />} label="Subjects" value={job.subject_details?.join(', ')} />
                <DetailItem icon={<FiUsers />} label="Mode" value={job.mode?.join(', ')} />
                <DetailItem icon={<FiBook />} label="Level" value={job.education_level} />
                <DetailItem icon={<FiUsers />} label="Gender Pref." value={job.gender_preference} />
                
                <div className="col-span-1 sm:col-span-2 p-4 bg-primary-50/50 dark:bg-primary-900/10 rounded-xl border border-primary-100 dark:border-primary-800/30 flex items-start gap-4">
                  <div className="p-2.5 bg-white dark:bg-dark-bg-tertiary rounded-lg text-primary-600 dark:text-primary-400 shadow-sm">
                    <FiPhone size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">WhatsApp / Contact</p>
                    <p className="text-base font-bold text-gray-900 dark:text-white">
                      {jobUnlocked || !isTutor ? (job.phone || "N/A") : "Unlock to view"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-200 dark:border-dark-border overflow-hidden">
              <div className="px-8 py-5 border-b border-gray-100 dark:border-dark-border bg-gray-50/30 dark:bg-dark-bg-secondary/30 flex items-center gap-3">
                 <FiBriefcase className="text-primary-500" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Description</h2>
              </div>
              <div className="p-8">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line text-lg">{job.description}</p>
              </div>
            </div>

            {/* Recommendation Section */}
            {isTutor && job.status === "Open" && (
            <div className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-2xl border border-primary-100 dark:border-primary-800/30 p-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                  <FiTrendingUp size={100} />
               </div>
              <div className="flex items-start gap-4 mb-4 relative z-10">
                <div className="w-10 h-10 bg-white dark:bg-dark-bg-tertiary rounded-xl flex items-center justify-center shadow-sm text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-800/30">
                  <FiTrendingUp size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tutor Insights</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Why you should apply now</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10 mt-4">
                 <InsightCard
                    label="Competition"
                    value={`${job.applicants_count} Applied`}
                    icon={<FiUsers className="text-blue-500" />}
                 />
                 <InsightCard
                    label="Unlock Cost"
                    value={`${creditsNeeded} Points`}
                    icon={<FiLock className="text-amber-500" />}
                 />
                 <InsightCard
                    label="Next Price"
                    value={`${nextCreditsNeeded} Points`}
                    icon={<FiTrendingUp className="text-rose-500" />}
                 />
              </div>
            </div>
            )}

            {/* Actions for Tutor */}
            {isTutor && (
              <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-200 dark:border-dark-border p-8 text-center">
                  {job.status === 'Open' && !jobUnlocked && (
                    <div className="max-w-md mx-auto">
                      <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600 dark:text-primary-400 text-2xl border border-primary-100 dark:border-primary-800/30">
                        <FiLock />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Unlock Contact Details</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-8">
                        Unlock this job for <span className="font-bold text-gray-900 dark:text-white">{creditsNeeded} points</span> to view student contact info.
                      </p>
                      <button
                        onClick={handleUnlockJob}
                        disabled={unlockStatus === 'loading' || unlockStatus === 'success' || unlockErrorMessage}
                        className={`
                          w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-primary-500/20 transition-all transform active:scale-95
                          ${unlockStatus === 'success'
                            ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30'
                            : unlockStatus === 'loading' || unlockErrorMessage
                            ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed text-gray-500 dark:text-gray-400 shadow-none'
                            : 'bg-primary-600 hover:bg-primary-700 hover:-translate-y-1'
                          }
                        `}
                      >
                        {unlockStatus === 'loading' ? 'Unlocking...' : unlockStatus === 'success' ? 'Unlocked Successfully!' : 'Unlock Now'}
                      </button>

                      {unlockErrorMessage && (
                        <div className="mt-6 p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 text-sm rounded-xl border border-rose-100 dark:border-rose-800/30 flex items-center justify-center gap-2">
                           <FiAlertCircle />
                          {unlockErrorMessage}
                        </div>
                      )}
                    </div>
                  )}

                  {job.status === 'Open' && jobUnlocked && (
                    <div className="p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-center gap-3 text-lg">
                        <FiCheckCircle size={24} /> You have unlocked this job!
                    </div>
                  )}

                  {job.status === 'Assigned' && job.assigned_tutor === currentUser?.id && (
                     <div className="max-w-md mx-auto">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Job in Progress</h3>
                        <button
                          onClick={handleMarkComplete}
                          className="w-full py-3.5 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/30"
                        >
                          Mark as Completed
                        </button>
                     </div>
                  )}
              </div>
            )}

            {/* Review Section */}
            {(isStudent && job.status === 'Completed' && !job.review) || job.review ? (
              <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-200 dark:border-dark-border overflow-hidden">
                 <div className="px-8 py-5 border-b border-gray-100 dark:border-dark-border bg-gray-50/30 dark:bg-dark-bg-secondary/30 flex items-center gap-3">
                    <FiStar className="text-amber-400" />
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                       {job.review ? 'Review' : 'Leave a Review'}
                    </h2>
                 </div>
                 <div className="p-8">
                    {job.review ? (
                       <div className="bg-gray-50 dark:bg-dark-bg-secondary rounded-xl p-6 border border-gray-100 dark:border-dark-border">
                          <div className="flex items-center gap-3 mb-4">
                             <StarRating rating={job.review.rating} showCount={false} size={24} />
                             <span className="font-bold text-gray-900 dark:text-white text-lg">{job.review.rating}.0</span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 italic text-lg leading-relaxed">"{job.review.comment}"</p>
                       </div>
                    ) : (
                       <div className="space-y-6">
                          <div>
                             <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Rate your experience</label>
                             {renderStars(reviewRating, true, setReviewRating)}
                          </div>
                          <div>
                             <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Your Feedback</label>
                             <textarea
                                className="w-full p-4 border border-gray-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 dark:bg-dark-bg-secondary transition-all outline-none resize-none dark:text-white"
                                rows="4"
                                placeholder="How was your experience with this tutor?"
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                             />
                          </div>
                          <button
                             onClick={handleSubmitReview}
                             disabled={!reviewRating}
                             className="px-8 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition shadow-md hover:shadow-primary-500/30"
                          >
                             Submit Review
                          </button>
                       </div>
                    )}
                 </div>
              </div>
            ) : null}

            {/* Gift Coin Button */}
             {isStudent && job.status === 'Completed' && job.assigned_tutor && (
                <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-200 dark:border-dark-border p-8 text-center">
                    <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-500">
                       <FiStar size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Appreciate your Tutor?</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">Send them a gift of coins as a token of appreciation for their hard work.</p>
                    <button
                        onClick={handleGiftClick}
                        className="inline-flex items-center px-8 py-3.5 border border-transparent text-base font-bold rounded-xl shadow-lg shadow-amber-500/30 text-white bg-amber-500 hover:bg-amber-600 focus:outline-none transition-all transform hover:-translate-y-1"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7.858 5.485a1 1 0 00-1.715 1.03L7.633 9H7a1 1 0 100 2h1.838l.179 1.074c.128.766.726 1.347 1.488 1.446l.495.064c.783.102 1.446-.543 1.345-1.326l-.064-.495a1.2 1.2 0 00-1.22-1.042l-1.954-.253-.178-1.074H13a1 1 0 100-2h-2.383l1.49-2.485a1 1 0 00-1.715-1.03L8.91 8.243 7.858 5.485z" clipRule="evenodd" />
                         </svg>
                        Send Gift Coins
                    </button>
                </div>
            )}
          </div>

          {/* Right Column - Applicants */}
          <div className="lg:col-span-1">
             <div className="sticky top-24">
                <JobApplicants jobId={job.id} job={job} />
             </div>
          </div>
        </div>

        {isTutor && (
          <BuyCreditsModal
            show={showBuyCreditsModal}
            onClose={() => setShowBuyCreditsModal(false)}
            onBuyCredits={() => { window.location.href = '/buy-points'; }}
            message={`You need ${creditsNeeded} points to unlock this job.`}
          />
        )}

        {/* Gift Modal */}
        {job?.assigned_tutor && (
            <GiftCoinModal
                isOpen={isGiftModalOpen}
                onClose={() => setIsGiftModalOpen(false)}
                tutorId={job.assigned_tutor}
                tutorName="the Tutor"
                currentBalance={userCreditBalance}
            />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-dark-bg font-sans transition-colors duration-300">
      <Navbar />
      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
};

// Minimal DetailItem component
const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-dark-bg-secondary border border-gray-100 dark:border-dark-border hover:bg-white dark:hover:bg-dark-card hover:border-primary-100 dark:hover:border-primary-800/30 hover:shadow-sm transition-all group">
    <div className="p-2 bg-white dark:bg-dark-bg-tertiary text-gray-400 dark:text-gray-500 rounded-lg flex-shrink-0 shadow-sm border border-gray-100 dark:border-dark-border group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
      {React.cloneElement(icon, { size: 20 })}
    </div>
    <div className="min-w-0">
      <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate block">{value || 'N/A'}</p>
    </div>
  </div>
);

const InsightCard = ({ label, value, icon }) => (
   <div className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-sm p-3 rounded-xl border border-white/50 dark:border-dark-border shadow-sm flex flex-col items-center text-center">
      <div className="mb-1">{icon}</div>
      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
      <p className="text-sm font-bold text-gray-900 dark:text-white">{value}</p>
   </div>
);

export default JobDetail;