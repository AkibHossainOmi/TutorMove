import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BuyCreditsModal from '../components/BuyCreditsModal';
import { 
  FiBriefcase, FiMapPin, FiBook, FiUser, FiCalendar, 
  FiAlertCircle, FiDollarSign, FiClock, FiGlobe, FiPhone, FiUsers,
  FiStar, FiCheckCircle, FiLock, FiUnlock, FiX, FiTrendingUp
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
                ${isActive ? 'text-yellow-400' : 'text-gray-300'}
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
    const bgColor = type === 'error' ? 'bg-red-500' : 'bg-green-500';
    return (
      <div className={`fixed top-24 right-6 z-50 ${bgColor} text-white px-5 py-3 rounded-lg shadow-lg`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {type === 'error' ? <FiAlertCircle /> : <FiCheckCircle />}
            <span className="text-sm font-medium">{message}</span>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 rounded p-1">
            <FiX />
          </button>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-3 border-blue-600 border-t-transparent"></div>
        <p className="mt-4 text-gray-600">Loading job details...</p>
      </div>
    );

    if (error) return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
        <FiAlertCircle className="text-red-500 text-4xl mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );

    if (!job) return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
        <FiBriefcase className="text-blue-600 text-4xl mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Job Not Found</h3>
        <p className="text-gray-500 mb-6">The job you're looking for doesn't exist or may have been removed.</p>
        <a href="/jobs" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Browse Available Jobs
        </a>
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

        {isTutor && isInPriorityWindow && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
             <FiClock className="text-amber-600 mt-1" />
             <div>
                <p className="text-sm text-amber-900 font-semibold">
                  Priority Access: <span className="font-bold">{timeLeft}</span> left
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Only top tutors can unlock this job during the priority window.
                </p>
             </div>
          </div>
        )}

        {/* Job Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex flex-col lg:flex-row justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <FiBriefcase className="text-blue-600 text-xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{job.service_type || 'Tutoring Job'}</h1>
                  <p className="text-sm text-gray-500">Posted {formatDate(job.created_at)}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-full">
                  <FiUser className="text-gray-400" /> 
                  {job.student.username}
                </span>
                <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-full">
                  <FiMapPin className="text-gray-400" /> 
                  {job.location || 'Remote'}
                </span>
                {job.country && (
                   <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-full">
                    <FiGlobe className="text-gray-400" />
                    {job.country}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-3">
               <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${
                  job.status === 'Open' ? 'bg-green-50 text-green-700 border-green-100' :
                  job.status === 'Assigned' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                  'bg-gray-50 text-gray-700 border-gray-100'
               }`}>
                  {job.status}
               </span>
               <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Budget</p>
                  <p className="text-2xl font-bold text-gray-900">{job.budget || 'Negotiable'} <span className="text-sm font-normal text-gray-500">USD</span></p>
               </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-8 py-5 border-b border-gray-50 bg-gray-50/50">
                <h2 className="text-lg font-bold text-gray-900">Job Overview</h2>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <DetailItem icon={<FiDollarSign />} label="Budget" value={`${job.budget} USD`} />
                <DetailItem icon={<FiClock />} label="Budget Type" value={job.budget_type} />
                <DetailItem icon={<FiBook />} label="Subjects" value={job.subject_details?.join(', ')} />
                <DetailItem icon={<FiUsers />} label="Mode" value={job.mode?.join(', ')} />
                <DetailItem icon={<FiBook />} label="Level" value={job.education_level} />
                <DetailItem icon={<FiUsers />} label="Gender Pref." value={job.gender_preference} />
                
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 mt-0.5">
                    <FiPhone size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">WhatsApp</p>
                    <p className="text-sm font-medium text-gray-900">
                      {jobUnlocked || !isTutor ? (job.phone || "N/A") : "Unlock to view"}
                    </p>
                  </div>
                </div>

                {job.distance && (
                  <DetailItem icon={<FiMapPin />} label="Distance" value={`${job.distance} km`} />
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-8 py-5 border-b border-gray-50 bg-gray-50/50">
                <h2 className="text-lg font-bold text-gray-900">Description</h2>
              </div>
              <div className="p-8">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{job.description}</p>
              </div>
            </div>

            {/* Recommendation Section */}
            {isTutor && job.status === "Open" && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-blue-600">
                  <FiTrendingUp size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Tutor Insights</h3>
                  <p className="text-sm text-gray-600">Why you should apply now</p>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-white/50 shadow-sm">
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <FiCheckCircle className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <span><strong>{job.applicants_count} teachers</strong> have applied.</span>
                  </li>
                  <li className="flex items-start gap-2">
                     <FiCheckCircle className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Next unlock price: <strong>{nextCreditsNeeded} points</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                     <FiCheckCircle className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Unlock cost increases with demand.</span>
                  </li>
                </ul>
              </div>
            </div>
            )}

            {/* Actions for Tutor */}
            {isTutor && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                  {job.status === 'Open' && !jobUnlocked && (
                    <div className="max-w-md mx-auto">
                      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 text-2xl">
                        <FiLock />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Unlock Contact Details</h3>
                      <p className="text-gray-500 mb-6">
                        Unlock this job for <span className="font-bold text-gray-900">{creditsNeeded} points</span> to view student contact info.
                      </p>
                      <button
                        onClick={handleUnlockJob}
                        disabled={unlockStatus === 'loading' || unlockStatus === 'success' || unlockErrorMessage}
                        className={`
                          w-full py-3.5 rounded-xl font-semibold text-white shadow-sm transition-all transform active:scale-95
                          ${unlockStatus === 'success'
                            ? 'bg-green-600 hover:bg-green-700'
                            : unlockStatus === 'loading' || unlockErrorMessage
                            ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                            : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-md'
                          }
                        `}
                      >
                        {unlockStatus === 'loading' ? 'Unlocking...' : unlockStatus === 'success' ? 'Unlocked!' : 'Unlock Now'}
                      </button>

                      {unlockErrorMessage && (
                        <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                          {unlockErrorMessage}
                        </div>
                      )}
                    </div>
                  )}

                  {job.status === 'Open' && jobUnlocked && (
                    <div className="p-4 bg-green-50 rounded-xl border border-green-100 text-green-800 font-medium flex items-center justify-center gap-2">
                        <FiCheckCircle /> You have unlocked this job!
                    </div>
                  )}

                  {job.status === 'Assigned' && job.assigned_tutor === currentUser?.id && (
                     <div className="max-w-md mx-auto">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Job in Progress</h3>
                        <button
                          onClick={handleMarkComplete}
                          className="w-full py-3 rounded-xl font-semibold bg-green-600 text-white hover:bg-green-700 transition shadow-sm"
                        >
                          Mark as Completed
                        </button>
                     </div>
                  )}
              </div>
            )}

            {/* Review Section */}
            {(isStudent && job.status === 'Completed' && !job.review) || job.review ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                 <div className="px-8 py-5 border-b border-gray-50 bg-gray-50/50">
                    <h2 className="text-lg font-bold text-gray-900">
                       {job.review ? 'Review' : 'Leave a Review'}
                    </h2>
                 </div>
                 <div className="p-8">
                    {job.review ? (
                       <div>
                          <div className="flex items-center gap-2 mb-3">
                             <StarRating rating={job.review.rating} showCount={false} size={20} />
                             <span className="font-bold text-gray-900 ml-2">{job.review.rating}.0</span>
                          </div>
                          <p className="text-gray-700 italic">"{job.review.comment}"</p>
                       </div>
                    ) : (
                       <div className="space-y-4">
                          <div>
                             <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                             {renderStars(reviewRating, true, setReviewRating)}
                          </div>
                          <div>
                             <label className="block text-sm font-medium text-gray-700 mb-2">Your Feedback</label>
                             <textarea
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                rows="4"
                                placeholder="How was your experience?"
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                             />
                          </div>
                          <button
                             onClick={handleSubmitReview}
                             disabled={!reviewRating}
                             className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
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
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Appreciate your Tutor?</h3>
                    <p className="text-gray-600 mb-6">Send them a gift of coins as a token of appreciation.</p>
                    <button
                        onClick={handleGiftClick}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7.858 5.485a1 1 0 00-1.715 1.03L7.633 9H7a1 1 0 100 2h1.838l.179 1.074c.128.766.726 1.347 1.488 1.446l.495.064c.783.102 1.446-.543 1.345-1.326l-.064-.495a1.2 1.2 0 00-1.22-1.042l-1.954-.253-.178-1.074H13a1 1 0 100-2h-2.383l1.49-2.485a1 1 0 00-1.715-1.03L8.91 8.243 7.858 5.485z" clipRule="evenodd" />
                         </svg>
                        Gift Coins
                    </button>
                </div>
            )}
          </div>

          {/* Right Column - Applicants */}
          <div className="lg:col-span-1">
             <JobApplicants jobId={job.id} job={job} />
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
    <div className="min-h-screen flex flex-col bg-gray-50">
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
  <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100/50 hover:bg-white hover:shadow-sm transition-all">
    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg flex-shrink-0">
      {React.cloneElement(icon, { size: 20 })}
    </div>
    <div className="min-w-0">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm font-semibold text-gray-900 truncate block">{value || 'N/A'}</p>
    </div>
  </div>
);

export default JobDetail;