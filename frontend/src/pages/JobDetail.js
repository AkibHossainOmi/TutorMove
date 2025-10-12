import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BuyCreditsModal from '../components/BuyCreditsModal';
import { 
  FiBriefcase, FiMapPin, FiBook, FiUser, FiCalendar, 
  FiAlertCircle, FiDollarSign, FiClock, FiGlobe, FiPhone, FiUsers 
} from 'react-icons/fi';
import { jobAPI } from '../utils/apiService';
import JobApplicants from '../components/JobApplicants';
import { FaStar } from 'react-icons/fa';

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

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setCurrentUser(JSON.parse(userData));
  }, []);

  const isTutor = currentUser?.user_type === 'tutor';
  const isStudent = currentUser?.user_type === 'student';

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
      setJob(prev => ({ ...prev, applicants_count: (prev.applicants_count || 0) + 1 }));
    } catch (err) {
      console.error('Error unlocking job:', err);
      if (err.response?.data?.detail === 'Insufficient points') {
        setShowBuyCreditsModal(true);
      } else if (err.response?.data?.detail) {
        setUnlockErrorMessage(err.response.data.detail);
      } else {
        setUnlockStatus('failed');
      }
    }
  };

  const handleMarkComplete = async () => {
    try {
      await jobAPI.completeJob(job.id);
      setJob(prev => ({ ...prev, status: 'Completed' }));
    } catch (err) {
      console.error('Error completing job:', err);
      alert('Failed to mark job as completed.');
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewRating || reviewRating < 1 || reviewRating > 5) {
      return alert('Please select a rating between 1 and 5 stars.');
    }
    try {
      await jobAPI.submitJobReview(job.id, { rating: reviewRating, comment: reviewComment });
      alert('Review submitted!');
      setJob(prev => ({ ...prev, review: { rating: reviewRating, comment: reviewComment } }));
      setReviewRating(0);
      setReviewComment('');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || 'Failed to submit review.');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // ⭐ Star rating UI component
  const StarRating = ({ rating, setRating }) => (
    <div className="flex space-x-1 justify-center mb-3">
      {[1, 2, 3, 4, 5].map(star => (
        <FaStar
          key={star}
          className={`cursor-pointer text-3xl transition-all duration-200 ${
            star <= rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'
          }`}
          onClick={() => setRating(star)}
        />
      ))}
    </div>
  );

  const renderContent = () => {
    if (loading) return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-blue-900"></div>
        <p className="mt-4 text-lg text-slate-600">Loading job details...</p>
      </div>
    );

    if (error) return (
      <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-sm border border-red-200 text-center">
        <FiAlertCircle className="text-red-700 text-4xl mb-4 mx-auto" />
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Oops! Something went wrong</h3>
        <p className="text-slate-600 mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors">
          Try Again
        </button>
      </div>
    );

    if (!job) return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-sm text-center">
        <FiBriefcase className="text-blue-900 text-3xl mb-4 mx-auto" />
        <h3 className="text-2xl font-semibold text-slate-900 mb-2">Job Not Found</h3>
        <p className="text-slate-500 mb-6">This job doesn’t exist or may have been removed.</p>
        <a href="/jobs" className="inline-block px-6 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors">
          Browse Jobs
        </a>
      </div>
    );

    return (
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-2xl p-8 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{job.service_type}</h1>
              <div className="flex flex-wrap items-center gap-4 text-slate-200 text-sm">
                <span className="flex items-center"><FiUser className="mr-2" /> {job.student.username}</span>
                <span className="flex items-center"><FiMapPin className="mr-2" /> {job.location || 'Remote'}</span>
                <span className="flex items-center"><FiGlobe className="mr-2" /> {job.country || 'Unknown'}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium">
                {job.subject_details?.join(', ')}
              </span>
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                job.status === 'Open' ? 'bg-green-500' :
                job.status === 'Assigned' ? 'bg-yellow-500' :
                'bg-gray-400'
              } text-white`}>
                {job.status}
              </span>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden divide-y divide-slate-200">
          <div className="p-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <DetailItem icon={<FiCalendar />} label="Posted on" value={formatDate(job.created_at)} bg="blue" />
            <DetailItem icon={<FiDollarSign />} label="Budget" value={`${job.budget} USD`} bg="green" />
            <DetailItem icon={<FiClock />} label="Type" value={job.budget_type} bg="purple" />
            <DetailItem icon={<FiBook />} label="Subjects" value={job.subject_details?.join(', ')} bg="amber" />
            <DetailItem icon={<FiUsers />} label="Mode" value={job.mode?.join(', ')} bg="indigo" />
            <DetailItem icon={<FiBook />} label="Languages" value={job.languages?.join(', ')} bg="teal" />
            <DetailItem icon={<FiBook />} label="Education" value={job.education_level} bg="pink" />
            <DetailItem icon={<FiUsers />} label="Gender" value={job.gender_preference} bg="yellow" />
            <DetailItem icon={<FiUsers />} label="Applicants" value={job.applicants_count || 0} bg="cyan" />
            <DetailItem icon={<FiPhone />} label="Phone" value={jobUnlocked || !isTutor ? (job.phone || 'N/A') : 'Unlock to view'} bg="gray" />
          </div>

          {/* Description */}
          <div className="p-8">
            <h3 className="text-xl font-semibold mb-3">Job Description</h3>
            <p className="text-slate-700 leading-relaxed">{job.description}</p>
          </div>

          {/* Unlock / Complete Section */}
          {isTutor && (
            <>
              {job.status === 'Open' && !jobUnlocked && (
                <div className="p-8 bg-gray-50 text-center space-y-4">
                  <p className="text-slate-700 text-lg">
                    Unlock this job for <span className="font-semibold">{creditsNeeded} points</span>
                  </p>
                  <button
                    onClick={handleUnlockJob}
                    disabled={unlockStatus === 'loading' || unlockErrorMessage}
                    className={`px-6 py-3 rounded-lg font-semibold text-white ${
                      unlockStatus === 'success'
                        ? 'bg-green-700 hover:bg-green-800'
                        : 'bg-blue-900 hover:bg-blue-800'
                    } ${unlockStatus === 'loading' ? 'opacity-90 cursor-not-allowed' : ''}`}
                  >
                    {unlockStatus === 'loading' ? 'Unlocking...' : unlockStatus === 'success' ? 'Unlocked!' : 'Unlock Job'}
                  </button>
                  {unlockErrorMessage && (
                    <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md text-yellow-800 flex items-center justify-center space-x-2">
                      <FiAlertCircle className="text-xl" />
                      <span>{unlockErrorMessage}</span>
                    </div>
                  )}
                </div>
              )}

              {job.status === 'Assigned' && job.assigned_tutor === currentUser?.id && (
                <div className="p-8 bg-green-50 text-center">
                  <button
                    onClick={handleMarkComplete}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                  >
                    Mark as Complete
                  </button>
                </div>
              )}
            </>
          )}

          {/* Review Section (Stars) */}
          {isStudent && job.status === 'Completed' && !job.review && (
            <div className="p-8 bg-gray-50">
              <h3 className="text-xl font-semibold mb-4 text-center">Leave a Review</h3>
              <div className="max-w-md mx-auto text-center space-y-4">
                <StarRating rating={reviewRating} setRating={setReviewRating} />
                <textarea
                  placeholder="Write your feedback..."
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
                <button
                  onClick={handleSubmitReview}
                  className="w-full px-4 py-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition"
                >
                  Submit Review
                </button>
              </div>
            </div>
          )}

          {job.review && (
            <div className="p-8 bg-green-50 text-center">
              <h3 className="text-xl font-semibold mb-2">Your Review</h3>
              <div className="flex justify-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={`text-2xl ${i < job.review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <p className="text-slate-700">{job.review.comment}</p>
            </div>
          )}
        </div>

        {job && <JobApplicants jobId={job.id} job={job} />}

        {isTutor && (
          <BuyCreditsModal
            show={showBuyCreditsModal}
            onClose={() => setShowBuyCreditsModal(false)}
            onBuyCredits={() => (window.location.href = '/buy-points')}
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

const DetailItem = ({ icon, label, value, bg }) => (
  <div className="flex items-start space-x-3">
    <div className={`bg-${bg}-100 p-2 rounded-lg text-${bg}-700 flex-shrink-0`}>{icon}</div>
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="font-medium text-slate-800">{value || 'N/A'}</p>
    </div>
  </div>
);

export default JobDetail;
