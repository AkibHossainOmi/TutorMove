import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BuyCreditsModal from '../components/BuyCreditsModal';
import { 
  FiBriefcase, FiMapPin, FiBook, FiUser, FiCalendar, 
  FiAlertCircle, FiDollarSign, FiClock, FiGlobe, FiPhone, FiUsers,
  FiStar, FiCheckCircle, FiLock, FiUnlock, FiX
} from 'react-icons/fi';
import { jobAPI } from '../utils/apiService';
import JobApplicants from '../components/JobApplicants';

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobUnlocked, setJobUnlocked] = useState(false);
  const [creditsNeeded, setCreditsNeeded] = useState(0);
  const [unlockStatus, setUnlockStatus] = useState('idle');
  const [showBuyCreditsModal, setShowBuyCreditsModal] = useState(false);
  const [unlockErrorMessage, setUnlockErrorMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // Rating states
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setCurrentUser(JSON.parse(userData));
  }, []);

  const isTutor = currentUser?.user_type === 'tutor';
  const isStudent = currentUser?.user_type === 'student';

  // Toast notification function (kept as simple internal toast)
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
      if (err.response?.data?.detail === 'Insufficient points') {
        setShowBuyCreditsModal(true);
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

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  /**
   * renderStars:
   * - rating: numeric for display-only mode
   * - interactive: whether stars can be clicked/hovered (for review)
   * - onRate: function to set rating
   *
   * Behavior:
   * - Hover shows hoverRating
   * - Selected rating (reviewRating) displays a star-shaped border around the selected stars so user can see what they'll submit
   * - Keyboard accessible (Arrow keys + Enter/Space)
   */
  const renderStars = (rating = 0, interactive = false, onRate = () => {}) => {
    // Determine current visual rating: hover takes precedence while hovering
    const currentVisual = interactive ? (hoverRating || reviewRating) : rating;

    const handleKeyDown = (e, star) => {
      if (!interactive) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onRate(star);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault();
        const next = Math.max(1, (interactive ? (hoverRating || reviewRating) : rating) - 1);
        onRate(next);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault();
        const next = Math.min(5, (interactive ? (hoverRating || reviewRating) : rating) + 1);
        onRate(next);
      }
    };

    return (
      <div className="flex items-center space-x-2" role={interactive ? 'radiogroup' : undefined}>
        {[1,2,3,4,5].map(star => {
          const isActive = star <= currentVisual; // filled color
          const isSelected = interactive ? star <= reviewRating : star <= rating; // permanent selected (for border)
          const isFocusedBorder = interactive && hoverRating === star; // if hovering over this star
          return (
            <button
              key={star}
              type="button"
              aria-label={`${star} star${star > 1 ? 's' : ''}`}
              aria-checked={interactive ? (reviewRating === star) : undefined}
              role={interactive ? 'radio' : undefined}
              onClick={() => interactive && onRate(star)}
              onMouseEnter={() => interactive && setHoverRating(star)}
              onMouseLeave={() => interactive && setHoverRating(0)}
              onFocus={() => interactive && setHoverRating(star)}
              onBlur={() => interactive && setHoverRating(0)}
              onKeyDown={(e) => handleKeyDown(e, star)}
              className={`
                relative flex items-center justify-center
                focus:outline-none
                transition-transform duration-150
                ${interactive ? 'cursor-pointer hover:scale-110 active:scale-95' : ''}
                ${isActive ? 'text-yellow-400' : 'text-gray-300'}
                p-1 rounded-md
                `}
              style={{ width: interactive ? 44 : 28, height: interactive ? 44 : 28 }}
            >
              {/* The base star icon (outline or colored) */}
              <FiStar size={interactive ? 28 : 18} className={`${isActive ? 'fill-current' : ''}`} />

              {/* Star-shaped stroked border for selected stars (visible before submit) */}
              {(isSelected || isFocusedBorder) && (
                <svg
                  viewBox="0 0 24 24"
                  className={`
                    absolute inset-0 pointer-events-none
                    ${isFocusedBorder ? 'animate-pulse' : ''}
                  `}
                  width={interactive ? 44 : 28}
                  height={interactive ? 44 : 28}
                >
                  <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    fill="none"
                    stroke={isActive ? '#f59e0b' : '#cbd5e1'} /* yellow for active, soft gray otherwise */
                    strokeWidth={isFocusedBorder ? 2.5 : 1.8}
                    strokeLinejoin="round"
                  />
                </svg>
              )}

              {/* Subtle ring for keyboard focus (accessible) */}
              <span className="sr-only">{interactive ? `Rate ${star} star` : `${star} star`}</span>
            </button>
          );
        })}
      </div>
    );
  };

  const Toast = ({ message, type, onClose }) => {
    const bgColor = type === 'error' ? 'bg-red-500' : 'bg-green-500';
    const borderColor = type === 'error' ? 'border-red-400' : 'border-green-400';
    
    return (
      <div className={`fixed top-24 right-6 z-50 ${bgColor} text-white px-6 py-4 rounded-xl shadow-2xl border ${borderColor} transform max-w-sm`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {type === 'error' ? (
              <FiAlertCircle className="text-xl flex-shrink-0" />
            ) : (
              <FiCheckCircle className="text-xl flex-shrink-0" />
            )}
            <span className="font-medium">{message}</span>
          </div>
          <button
            onClick={onClose}
            className="ml-4 hover:bg-white/20 rounded-full p-1 transition-colors"
            aria-label="Close notification"
          >
            <FiX className="text-lg" />
          </button>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        <p className="mt-4 text-lg text-gray-600 font-medium">Loading job details...</p>
      </div>
    );

    if (error) return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg border border-red-100 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiAlertCircle className="text-red-600 text-2xl" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
        >
          Try Again
        </button>
      </div>
    );

    if (!job) return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiBriefcase className="text-blue-600 text-2xl" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h3>
        <p className="text-gray-500 mb-6">The job you're looking for doesn't exist or may have been removed.</p>
        <a 
          href="/jobs" 
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
        >
          Browse Available Jobs
        </a>
      </div>
    );

    return (
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Toast Notification */}
        {toast.show && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast({ show: false, message: '', type: '' })}
          />
        )}

        {/* Job Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white shadow-2xl">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <FiBriefcase className="text-xl" />
                </div>
                <h1 className="text-3xl font-bold">{job.service_type}</h1>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-blue-100 mt-4">
                <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-sm">
                  <FiUser className="text-base" /> 
                  {job.student.username}
                </span>
                <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-sm">
                  <FiMapPin className="text-base" /> 
                  {job.location || 'Remote'}
                </span>
                <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-sm">
                  <FiGlobe className="text-base" /> 
                  {job.country || 'Unknown'}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* Subjects */}
              <div className="bg-white/20 px-4 py-2 rounded-full">
                <span className="text-sm font-semibold">{job.subject_details?.join(', ')}</span>
              </div>
              
              {/* Job Status */}
              <div className={`
                px-4 py-2 rounded-full text-sm font-semibold
                ${job.status === 'Open' ? 'bg-green-500 text-white' :
                  job.status === 'Assigned' ? 'bg-yellow-500 text-white' :
                  job.status === 'Completed' ? 'bg-gray-500 text-white' : 'bg-gray-300 text-gray-700'}
              `}>
                {job.status}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Job Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Details Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Job Details</h2>
              </div>
              
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <DetailItem 
                  icon={<FiCalendar className="text-blue-600" />} 
                  label="Posted on" 
                  value={formatDate(job.created_at)} 
                />
                <DetailItem 
                  icon={<FiDollarSign className="text-green-600" />} 
                  label="Budget" 
                  value={`${job.budget} USD`} 
                />
                <DetailItem 
                  icon={<FiClock className="text-purple-600" />} 
                  label="Budget Type" 
                  value={job.budget_type} 
                />
                <DetailItem 
                  icon={<FiBook className="text-amber-600" />} 
                  label="Subjects" 
                  value={job.subject_details?.join(', ')} 
                />
                <DetailItem 
                  icon={<FiUsers className="text-indigo-600" />} 
                  label="Mode" 
                  value={job.mode?.join(', ')} 
                />
                <DetailItem 
                  icon={<FiBook className="text-teal-600" />} 
                  label="Languages" 
                  value={job.languages?.join(', ')} 
                />
                <DetailItem 
                  icon={<FiBook className="text-pink-600" />} 
                  label="Education Level" 
                  value={job.education_level} 
                />
                <DetailItem 
                  icon={<FiUsers className="text-yellow-600" />} 
                  label="Gender Preference" 
                  value={job.gender_preference} 
                />
                <DetailItem 
                  icon={<FiUsers className="text-cyan-600" />} 
                  label="Applicants" 
                  value={job.applicants_count || 0} 
                />
                
                {/* Phone Number with Conditional Access */}
                <div className="flex items-start space-x-3">
                  <div className="bg-gray-100 p-3 rounded-xl">
                    <FiPhone className="text-gray-700 text-lg" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Phone</p>
                    <p className="font-semibold text-gray-900">
                      {jobUnlocked || !isTutor ? (job.phone || "N/A") : "Unlock to view"}
                    </p>
                  </div>
                </div>

                {job.distance && (
                  <DetailItem 
                    icon={<FiMapPin className="text-red-600" />} 
                    label="Distance" 
                    value={`${job.distance} km`} 
                  />
                )}
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Job Description</h2>
              </div>
              <div className="p-6">
                <p className="text-gray-700 leading-relaxed">{job.description}</p>
              </div>
            </div>

            {/* Action Sections */}
            {/* Tutor Unlock / Complete Section */}
            {isTutor && (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-6">
                  {job.status === 'Open' && !jobUnlocked && (
                    <div className="text-center space-y-4">
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <FiLock className="text-2xl text-gray-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Unlock Job Details</h3>
                      </div>
                      <p className="text-gray-600">
                        Unlock this job for <span className="font-bold text-blue-600">{creditsNeeded} points</span>
                      </p>
                      <button
                        onClick={handleUnlockJob}
                        disabled={unlockStatus === 'loading' || unlockStatus === 'success' || unlockErrorMessage}
                        className={`
                          w-full max-w-xs px-8 py-4 rounded-xl font-semibold text-white 
                          transition-all duration-200 transform hover:scale-105
                          ${unlockStatus === 'success'
                            ? 'bg-green-600 hover:bg-green-700'
                            : unlockStatus === 'loading' || unlockErrorMessage
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                          }
                          shadow-lg hover:shadow-xl
                        `}
                      >
                        {unlockStatus === 'loading' ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Unlocking...
                          </div>
                        ) : unlockStatus === 'success' ? (
                          <div className="flex items-center justify-center gap-2">
                            <FiCheckCircle className="text-lg" />
                            Unlocked!
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <FiUnlock className="text-lg" />
                            Unlock Job
                          </div>
                        )}
                      </button>

                      {unlockErrorMessage && (
                        <div className="mt-4 flex items-center justify-center bg-yellow-50 border border-yellow-200 p-4 text-yellow-800 rounded-xl">
                          <FiAlertCircle className="mr-2 text-xl flex-shrink-0" />
                          <span className="text-sm font-medium">{unlockErrorMessage}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {job.status === 'Open' && jobUnlocked && (
                    <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200">
                      <div className="flex items-center justify-center gap-2 text-green-700">
                        <FiCheckCircle className="text-xl" />
                        <span className="font-semibold">You have unlocked this job!</span>
                      </div>
                    </div>
                  )}

                  {job.status === 'Assigned' && job.assigned_tutor === currentUser?.id && (
                    <div className="text-center space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Job in Progress</h3>
                      <button
                        onClick={handleMarkComplete}
                        className="px-8 py-4 rounded-xl font-semibold bg-green-600 text-white hover:bg-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        Mark as Completed
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Student Review Section */}
            {isStudent && job.status === 'Completed' && !job.review && (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900">Leave a Review</h2>
                </div>
                <div className="p-6">
                  <div className="max-w-md space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                      <div className="flex items-center gap-4">
                        {renderStars(reviewRating, true, (value) => setReviewRating(value))}
                        <span className="text-lg font-semibold text-gray-700">
                          {reviewRating > 0 ? `${reviewRating}/5` : 'Select rating'}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">Use mouse or keyboard (← →) and press Enter/Space to set rating.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                      <textarea
                        placeholder="Share your experience with this tutor..."
                        value={reviewComment}
                        onChange={e => setReviewComment(e.target.value)}
                        rows="4"
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      />
                    </div>
                    <button
                      onClick={handleSubmitReview}
                      disabled={!reviewRating}
                      className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                    >
                      Submit Review
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Existing Review Display */}
            {job.review && (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900">Your Review</h2>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-3">
                    {renderStars(job.review.rating)}
                    <span className="text-lg font-semibold text-gray-700">{job.review.rating}/5</span>
                  </div>
                  <p className="text-gray-700">{job.review.comment}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Applicants */}
          <div className="lg:col-span-1">
            {job && <JobApplicants jobId={job.id} job={job} />}
          </div>
        </div>

        {/* Buy Credits Modal */}
        {isTutor && (
          <BuyCreditsModal
            show={showBuyCreditsModal}
            onClose={() => setShowBuyCreditsModal(false)}
            onBuyCredits={() => { window.location.href = '/buy-points'; }}
            message={`You need ${creditsNeeded} points to unlock this job.`}
          />
        )}
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        {renderContent()}
      </main>
      <Footer />
    </>
  );
};

// Enhanced DetailItem component
const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-xl transition-colors duration-200">
    <div className="bg-gray-100 p-3 rounded-xl flex-shrink-0">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
      <p className="font-semibold text-gray-900 truncate">{value || 'N/A'}</p>
    </div>
  </div>
);

export default JobDetail;
