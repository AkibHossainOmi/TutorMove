import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BuyCreditsModal from '../components/BuyCreditsModal';
import { FiBriefcase, FiMapPin, FiBook, FiUser, FiCalendar, FiAlertCircle, FiDollarSign, FiClock, FiGlobe, FiPhone, FiUsers } from 'react-icons/fi';
import { jobAPI } from '../utils/apiService';

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobUnlocked, setJobUnlocked] = useState(false);
  const [creditsNeeded, setCreditsNeeded] = useState(0);
  const [unlockStatus, setUnlockStatus] = useState('idle'); // idle | loading | success | failed
  const [showBuyCreditsModal, setShowBuyCreditsModal] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchJobData = async () => {
      try {
        const response = await jobAPI.getJobDetail(id);
        if (!isMounted) return;
        setJob(response.data);

        const unlockRes = await jobAPI.getJobUnlockPreview(id);
        if (!isMounted) return;
        setJobUnlocked(unlockRes.data.unlocked);
        setCreditsNeeded(unlockRes.data.points_needed);
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
  }, [id]);

  const handleUnlockJob = async () => {
    setUnlockStatus('loading');
    try {
      await jobAPI.unlockJob(id);
      setJobUnlocked(true);
      setUnlockStatus('success');
      setCreditsNeeded(0);
    } catch (err) {
      console.error('Error unlocking job:', err);
      if (err.response?.data?.detail === 'Insufficient credits') {
        setShowBuyCreditsModal(true);
      } else {
        setUnlockStatus('failed');
      }
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
      <div className="max-w-4xl mx-auto">
        {/* Job Header */}
        <div className="bg-blue-900 rounded-t-xl p-8 text-white">
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
            <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium">
              {job.subject_details?.join(', ')}
            </span>
          </div>
        </div>

        {/* Job Details */}
        <div className="bg-white rounded-b-xl shadow-md divide-y divide-slate-200">
          <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-slate-700">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg text-blue-900"><FiCalendar className="text-lg" /></div>
              <div>
                <p className="text-sm">Posted on</p>
                <p className="font-medium">{formatDate(job.created_at)}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-green-100 p-2 rounded-lg text-green-700"><FiDollarSign className="text-lg" /></div>
              <div>
                <p className="text-sm">Budget</p>
                <p className="font-medium">{job.budget} USD</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-purple-100 p-2 rounded-lg text-purple-700"><FiClock className="text-lg" /></div>
              <div>
                <p className="text-sm">Budget Type</p>
                <p className="font-medium">{job.budget_type}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-amber-100 p-2 rounded-lg text-amber-700"><FiBook className="text-lg" /></div>
              <div>
                <p className="text-sm">Subjects</p>
                <p className="font-medium">{job.subject_details?.join(', ')}</p>
              </div>
            </div>

            {/* Additional Fields */}
            <div className="flex items-start space-x-3">
              <div className="bg-indigo-100 p-2 rounded-lg text-indigo-700"><FiUsers className="text-lg" /></div>
              <div>
                <p className="text-sm">Mode</p>
                <p className="font-medium">{job.mode?.join(', ')}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-teal-100 p-2 rounded-lg text-teal-700"><FiBook className="text-lg" /></div>
              <div>
                <p className="text-sm">Languages</p>
                <p className="font-medium">{job.languages?.join(', ')}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-pink-100 p-2 rounded-lg text-pink-700"><FiBook className="text-lg" /></div>
              <div>
                <p className="text-sm">Education Level</p>
                <p className="font-medium">{job.education_level}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-yellow-100 p-2 rounded-lg text-yellow-700"><FiUsers className="text-lg" /></div>
              <div>
                <p className="text-sm">Gender Preference</p>
                <p className="font-medium">{job.gender_preference}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-gray-100 p-2 rounded-lg text-gray-700"><FiPhone className="text-lg" /></div>
              <div>
                <p className="text-sm">Phone</p>
                <p className="font-medium">{job.phone || 'N/A'}</p>
              </div>
            </div>

            {job.distance && (
              <div className="flex items-start space-x-3">
                <div className="bg-red-100 p-2 rounded-lg text-red-700"><FiMapPin className="text-lg" /></div>
                <div>
                  <p className="text-sm">Distance</p>
                  <p className="font-medium">{job.distance} km</p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="p-6 sm:p-8">
            <h3 className="text-xl font-semibold mb-4">Job Description</h3>
            <p className="text-slate-700">{job.description}</p>
          </div>

          {/* Unlock Section */}
          {!jobUnlocked && (
            <div className="p-6 sm:p-8 bg-gray-50 rounded-b-xl text-center">
              <p className="mb-4 text-slate-700">
                Unlock this job for <span className="font-semibold">{creditsNeeded} credits</span>
              </p>
              <button
                onClick={handleUnlockJob}
                disabled={unlockStatus === 'loading' || unlockStatus === 'success'}
                className={`px-6 py-3 rounded-lg font-semibold text-white ${
                  unlockStatus === 'success'
                    ? 'bg-green-700 hover:bg-green-800'
                    : 'bg-blue-900 hover:bg-blue-800'
                } ${unlockStatus === 'loading' ? 'opacity-90 cursor-not-allowed' : ''}`}
              >
                {unlockStatus === 'loading' ? 'Unlocking...' : unlockStatus === 'success' ? 'Unlocked!' : 'Unlock Job'}
              </button>
              {unlockStatus === 'failed' && <p className="mt-2 text-red-600">Unlock failed. Try again.</p>}
            </div>
          )}

          {jobUnlocked && (
            <div className="p-6 sm:p-8 bg-green-50 rounded-b-xl text-center text-green-700 font-semibold">
              You have unlocked this job!
            </div>
          )}
        </div>

        {/* Buy Credits Modal */}
        <BuyCreditsModal
          show={showBuyCreditsModal}
          onClose={() => setShowBuyCreditsModal(false)}
          onBuyCredits={() => { window.location.href = '/buy-credits'; }}
          message={`You need ${creditsNeeded} credits to unlock this job.`}
        />
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

export default JobDetail;
