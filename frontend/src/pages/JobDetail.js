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

  const [reviewRating, setReviewRating] = useState('');
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
      } else if (err.response?.data?.detail === 'You need an active gig with a matching subject to unlock this job.') {
        setUnlockErrorMessage(err.response.data.detail);
        setUnlockStatus('failed');
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
      return alert('Rating must be between 1 and 5.');
    }
    try {
      await jobAPI.submitJobReview(job.id, { rating: reviewRating, comment: reviewComment });
      alert('Review submitted!');
      setJob(prev => ({ ...prev, review: { rating: reviewRating, comment: reviewComment } }));
      setReviewRating('');
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

  const renderContent = () => {
    if (loading) return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-900"></div>
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
        <p className="text-slate-500 mb-6">The job you're looking for doesn't exist or may have been removed.</p>
        <a href="/jobs" className="inline-block px-6 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors">
          Browse Available Jobs
        </a>
      </div>
    );

    return (
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Job Header */}
        <div className="bg-blue-900 rounded-xl p-8 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{job.service_type}</h1>
              <div className="flex flex-wrap items-center space-x-4 text-slate-200 mt-2">
                <span className="flex items-center">
                  <FiUser className="mr-2" /> {job.student.username}
                </span>
                <span className="flex items-center">
                  <FiMapPin className="mr-2" /> {job.location || 'Remote'}
                </span>
                <span className="flex items-center">
                  <FiGlobe className="mr-2" /> {job.country || 'Unknown'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Subjects */}
              <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium">
                {job.subject_details?.join(', ')}
              </span>
              
              {/* Job Status */}
              <span
                className={`bg-white/20 px-4 py-2 rounded-full text-sm font-medium ${
                  job.status === 'Open' ? 'bg-blue-500 text-white' :
                  job.status === 'Assigned' ? 'bg-green-500 text-white' :
                  job.status === 'Completed' ? 'bg-gray-400 text-white' : 'bg-gray-200 text-gray-800'
                }`}
              >
                {job.status}
              </span>
            </div>
          </div>
        </div>

        {/* Job Details */}
        <div className="bg-white rounded-xl shadow-md divide-y divide-slate-200 overflow-hidden">
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-slate-700">
            <DetailItem icon={<FiCalendar />} label="Posted on" value={formatDate(job.created_at)} bg="blue" />
            <DetailItem icon={<FiDollarSign />} label="Budget" value={`${job.budget} USD`} bg="green" />
            <DetailItem icon={<FiClock />} label="Budget Type" value={job.budget_type} bg="purple" />
            <DetailItem icon={<FiBook />} label="Subjects" value={job.subject_details?.join(', ')} bg="amber" />
            <DetailItem icon={<FiUsers />} label="Mode" value={job.mode?.join(', ')} bg="indigo" />
            <DetailItem icon={<FiBook />} label="Languages" value={job.languages?.join(', ')} bg="teal" />
            <DetailItem icon={<FiBook />} label="Education Level" value={job.education_level} bg="pink" />
            <DetailItem icon={<FiUsers />} label="Gender Preference" value={job.gender_preference} bg="yellow" />
            <DetailItem icon={<FiUsers />} label="Applicants" value={job.applicants_count || 0} bg="cyan" />
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${jobUnlocked || !isTutor ? "bg-gray-100 text-gray-700" : "bg-gray-100 text-gray-400"}`}>
                <FiPhone className="text-lg" />
              </div>
              <div>
                <p className="text-sm">Phone</p>
                <p className="font-medium">{jobUnlocked || !isTutor ? (job.phone || "N/A") : "Unlock to view"}</p>
              </div>
            </div>
            {job.distance && <DetailItem icon={<FiMapPin />} label="Distance" value={`${job.distance} km`} bg="red" />}
          </div>

          {/* Description */}
          <div className="p-6 sm:p-8">
            <h3 className="text-xl font-semibold mb-4">Job Description</h3>
            <p className="text-slate-700">{job.description}</p>
          </div>

          {/* Tutor Unlock / Complete Section */}
          {isTutor && (
            <>
              {job.status === 'Open' && !jobUnlocked && (
                <div className="p-6 sm:p-8 bg-gray-50 rounded-b-xl text-center space-y-4">
                  <p className="text-slate-700 text-lg">
                    Unlock this job for <span className="font-semibold">{creditsNeeded} points</span>
                  </p>
                  <button
                    onClick={handleUnlockJob}
                    disabled={unlockStatus === 'loading' || unlockStatus === 'success' || unlockErrorMessage}
                    className={`px-6 py-3 rounded-lg font-semibold text-white ${
                      unlockStatus === 'success'
                        ? 'bg-green-700 hover:bg-green-800'
                        : 'bg-blue-900 hover:bg-blue-800'
                    } ${unlockStatus === 'loading' ? 'opacity-90 cursor-not-allowed' : ''} ${unlockErrorMessage ? 'bg-gray-400 cursor-not-allowed' : ''}`}
                  >
                    {unlockStatus === 'loading' ? 'Unlocking...' : unlockStatus === 'success' ? 'Unlocked!' : 'Unlock Job'}
                  </button>

                  {unlockErrorMessage && (
                    <div className="mt-4 flex items-center justify-center bg-yellow-50 border-l-4 border-yellow-400 p-4 text-yellow-800 rounded-md shadow-sm">
                      <FiAlertCircle className="mr-2 text-xl" />
                      <span className="text-sm font-medium">{unlockErrorMessage}</span>
                    </div>
                  )}
                </div>
              )}

              {job.status === 'Open' && jobUnlocked && (
                <div className="p-6 sm:p-8 bg-green-50 rounded-b-xl text-center text-green-700 font-semibold">
                  You have unlocked this job!
                </div>
              )}

              {job.status === 'Assigned' && job.assigned_tutor === currentUser?.id && (
                <div className="p-6 sm:p-8 bg-yellow-50 rounded-b-xl text-center space-y-4">
                  <button
                    onClick={handleMarkComplete}
                    className="px-6 py-3 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700"
                  >
                    Finish Job
                  </button>
                </div>
              )}
            </>
          )}

          {/* Student Review Section */}
          {isStudent && job.status === 'Completed' && !job.review && (
            <div className="p-6 sm:p-8 bg-gray-50 rounded-b-xl mt-4">
              <h3 className="text-xl font-semibold mb-4">Leave a Review</h3>
              <div className="flex flex-col space-y-2 max-w-md mx-auto">
                <input
                  type="number"
                  min="1"
                  max="5"
                  placeholder="Rating (1-5)"
                  value={reviewRating}
                  onChange={e => setReviewRating(e.target.value)}
                  className="p-2 border rounded"
                />
                <textarea
                  placeholder="Comment"
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  className="p-2 border rounded"
                />
                <button
                  onClick={handleSubmitReview}
                  className="px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-800"
                >
                  Submit Review
                </button>
              </div>
            </div>
          )}

          {job.review && (
            <div className="p-6 sm:p-8 bg-green-50 rounded-b-xl mt-4">
              <h3 className="text-xl font-semibold mb-2">Your Review</h3>
              <p className="font-medium">Rating: {job.review.rating} / 5</p>
              <p>{job.review.comment}</p>
            </div>
          )}

        </div>

        {job && <JobApplicants jobId={job.id} job={job} />}

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

// Small reusable detail card
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
