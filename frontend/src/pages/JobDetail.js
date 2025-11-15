import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BuyCreditsModal from '../components/BuyCreditsModal';
import { 
  FiBriefcase, FiMapPin, FiBook, FiUser, FiCalendar, 
  FiAlertCircle, FiDollarSign, FiClock, FiGlobe, FiPhone, FiUsers,
  FiStar, FiCheckCircle, FiLock, FiUnlock, FiX, FiTrendingUp,
  FiInfo
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

  // Toast notification function
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

  const renderStars = (rating = 0, interactive = false, onRate = () => {}) => {
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
      <div className="flex items-center space-x-1" role={interactive ? 'radiogroup' : undefined}>
        {[1,2,3,4,5].map(star => {
          const isActive = star <= currentVisual;
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
        <a 
          href="/jobs" 
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Browse Available Jobs
        </a>
      </div>
    );

    return (
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Toast Notification */}
        {toast.show && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast({ show: false, message: '', type: '' })}
          />
        )}

        {/* Job Header - Minimal Style */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <FiBriefcase className="text-blue-600" />
                </div>
                <h1 className="text-2xl font-semibold text-gray-900">{job.service_type}</h1>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <span className="flex items-center gap-1.5">
                  <FiUser className="text-gray-400" /> 
                  {job.student.username}
                </span>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-1.5">
                  <FiMapPin className="text-gray-400" /> 
                  {job.location || 'Remote'}
                </span>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-1.5">
                  <FiGlobe className="text-gray-400" /> 
                  {job.country || 'Unknown'}
                </span>
              </div>
            </div>
            
            <div className="flex flex-wrap items-start gap-2">
              <div className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md text-sm font-medium">
                {job.subject_details?.join(', ')}
              </div>
              
              <div className={`
                px-3 py-1.5 rounded-md text-sm font-medium
                ${job.status === 'Open' ? 'bg-green-50 text-green-700' :
                  job.status === 'Assigned' ? 'bg-yellow-50 text-yellow-700' :
                  job.status === 'Completed' ? 'bg-gray-100 text-gray-700' : 'bg-gray-50 text-gray-600'}
              `}>
                {job.status}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Job Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Details Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Job Details</h2>
              </div>
              
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem 
                  icon={<FiCalendar className="text-gray-600" />} 
                  label="Posted on" 
                  value={formatDate(job.created_at)} 
                />
                <DetailItem 
                  icon={<FiDollarSign className="text-gray-600" />} 
                  label="Budget" 
                  value={`${job.budget} USD`} 
                />
                <DetailItem 
                  icon={<FiClock className="text-gray-600" />} 
                  label="Budget Type" 
                  value={job.budget_type} 
                />
                <DetailItem 
                  icon={<FiBook className="text-gray-600" />} 
                  label="Subjects" 
                  value={job.subject_details?.join(', ')} 
                />
                <DetailItem 
                  icon={<FiUsers className="text-gray-600" />} 
                  label="Mode" 
                  value={job.mode?.join(', ')} 
                />
                <DetailItem 
                  icon={<FiBook className="text-gray-600" />} 
                  label="Education Level" 
                  value={job.education_level} 
                />
                <DetailItem 
                  icon={<FiUsers className="text-gray-600" />} 
                  label="Gender Preference" 
                  value={job.gender_preference} 
                />
                {/* <DetailItem 
                  icon={<FiUsers className="text-gray-600" />} 
                  label="Applicants" 
                  value={job.applicants_count || 0} 
                /> */}
                
                {/* Phone Number with Conditional Access */}
                <div className="flex items-start gap-3">
                  <div className="text-gray-600 mt-0.5">
                    <FiPhone size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-0.5">WhatsApp</p>
                    <p className="text-sm font-medium text-gray-900">
                      {jobUnlocked || !isTutor ? (job.phone || "N/A") : "Unlock to view"}
                    </p>
                  </div>
                </div>

                {job.distance && (
                  <DetailItem 
                    icon={<FiMapPin className="text-gray-600" />} 
                    label="Distance" 
                    value={`${job.distance} km`} 
                  />
                )}
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Job Description</h2>
              </div>
              <div className="p-6">
                <p className="text-gray-700 leading-relaxed text-sm">{job.description}</p>
              </div>
            </div>

            {/* Recommendation Section - Only for Tutors */}
            {isTutor && job.status === 'Open' && (
              <div className="bg-blue-50 rounded-lg border border-blue-100 p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FiTrendingUp className="text-blue-600" size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1">Recommendation</h3>
                    <p className="text-sm text-gray-700 font-medium mb-3">
                      Be the first one to apply. You have a very high chance of securing this student.
                    </p>
                  </div>
                </div>
                
                <div className="bg-white/60 rounded-lg p-4 border border-blue-100">
                  <p className="text-xs font-medium text-gray-600 mb-3">
                    Above Recommendation is made automatically based on the following data:
                  </p>
                  <ul className="space-y-2 text-xs text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span><strong>{job.applicants_count} teachers</strong> contacted the student.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>Price may <strong>decrease to 0 coins</strong> in 36 hours.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>Price will <strong>increase</strong> as more teachers apply.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>Student verified phone number and can be called. Therefore, <strong className="text-red-600">no coins will be refunded</strong> even if student doesn't look at your message.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Action Sections */}
            {/* Tutor Unlock / Complete Section */}
            {isTutor && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  {job.status === 'Open' && !jobUnlocked && (
                    <div className="text-center space-y-4">
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <FiLock className="text-xl text-gray-600" />
                        <h3 className="text-base font-semibold text-gray-900">Unlock Job Details</h3>
                      </div>
                      <p className="text-sm text-gray-600">
                        Unlock this job for <span className="font-semibold text-blue-600">{creditsNeeded} points</span>
                      </p>
                      <button
                        onClick={handleUnlockJob}
                        disabled={unlockStatus === 'loading' || unlockStatus === 'success' || unlockErrorMessage}
                        className={`
                          w-full max-w-xs px-6 py-3 rounded-md font-medium text-white text-sm
                          transition-colors
                          ${unlockStatus === 'success'
                            ? 'bg-green-600 hover:bg-green-700'
                            : unlockStatus === 'loading' || unlockErrorMessage
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                          }
                        `}
                      >
                        {unlockStatus === 'loading' ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Unlocking...
                          </span>
                        ) : unlockStatus === 'success' ? (
                          <span className="flex items-center justify-center gap-2">
                            <FiCheckCircle />
                            Unlocked!
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            <FiUnlock />
                            Unlock Job
                          </span>
                        )}
                      </button>

                      {unlockErrorMessage && (
                        <div className="mt-4 flex items-start gap-2 bg-yellow-50 border border-yellow-200 p-4 text-yellow-800 rounded-lg">
                          <FiAlertCircle className="flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{unlockErrorMessage}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {job.status === 'Open' && jobUnlocked && (
                    <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-center gap-2 text-green-700">
                        <FiCheckCircle />
                        <span className="text-sm font-medium">You have unlocked this job!</span>
                      </div>
                    </div>
                  )}

                  {job.status === 'Assigned' && job.assigned_tutor === currentUser?.id && (
                    <div className="text-center space-y-3">
                      <h3 className="text-base font-semibold text-gray-900">Job in Progress</h3>
                      <button
                        onClick={handleMarkComplete}
                        className="px-6 py-3 rounded-md font-medium bg-green-600 text-white hover:bg-green-700 transition-colors text-sm"
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
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">Leave a Review</h2>
                </div>
                <div className="p-6">
                  <div className="max-w-md space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                      {renderStars(reviewRating, true, setReviewRating)}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                      <textarea
                        placeholder="Share your experience with this tutor..."
                        value={reviewComment}
                        onChange={e => setReviewComment(e.target.value)}
                        rows="4"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                    <button
                      onClick={handleSubmitReview}
                      disabled={!reviewRating}
                      className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    >
                      Submit Review
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Existing Review Display */}
            {job.review && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">Your Review</h2>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    {renderStars(job.review.rating)}
                    <span className="text-sm font-medium text-gray-700">{job.review.rating}/5</span>
                  </div>
                  <p className="text-sm text-gray-700">{job.review.comment}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Applicants */}
          <div className="lg:col-span-1">
            {job && <JobApplicants jobId={job.id} job={job} />}
          </div>
        </div>

        {/* Buy Points Modal */}
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
      <main className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        {renderContent()}
      </main>
      <Footer />
    </>
  );
};

// Minimal DetailItem component
const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="text-gray-600 mt-0.5">
      {React.cloneElement(icon, { size: 18 })}
    </div>
    <div>
      <p className="text-xs font-medium text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value || 'N/A'}</p>
    </div>
  </div>
);

export default JobDetail;