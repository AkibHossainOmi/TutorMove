import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FiBriefcase, FiMapPin, FiBook, FiUser, FiCalendar, FiAlertCircle, FiDollarSign, FiClock } from 'react-icons/fi';

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applyStatus, setApplyStatus] = useState('idle');

  // Get user from localStorage
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await axios.get(`/api/jobs/${id}/`);
        setJob(response.data);
      } catch (err) {
        setError('Failed to fetch job details.');
        console.error('Error fetching job:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleApply = async () => {
    if (!user || !user.user_id) {
      alert('You must be logged in to apply.');
      return;
    }
    if (!job || !job.student) {
      alert('Job data incomplete: no poster info found.');
      return;
    }

    setApplyStatus('loading');
    try {
      await axios.post('http://localhost:8000/api/credit/update/', {
        user_id: user.user_id,
        amount: 1,
        isincrease: false,
      });

      await axios.post('http://localhost:8000/api/notifications/create/', {
        from_user: user.user_id,
        to_user: job.student,
        message: `${user.username} applied to your job "${job.title}"`,
      });

      setApplyStatus('success');
    } catch (err) {
      console.error('Error during apply:', err.response?.data || err.message);
      setApplyStatus('failed');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-900"></div>
          <p className="mt-4 text-lg text-slate-600">Loading job details...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-sm border border-red-200">
          <div className="flex flex-col items-center text-center">
            <FiAlertCircle className="text-red-700 text-4xl mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Oops! Something went wrong</h3>
            <p className="text-slate-600">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    if (!job) {
      return (
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-sm text-center">
          <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiBriefcase className="text-blue-900 text-3xl" />
          </div>
          <h3 className="text-2xl font-semibold text-slate-900 mb-2">Job Not Found</h3>
          <p className="text-slate-500 mb-6">The job you're looking for doesn't exist or may have been removed.</p>
          <a 
            href="/jobs" 
            className="inline-block px-6 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors"
          >
            Browse Available Jobs
          </a>
        </div>
      );
    }

    return (
      <div className="max-w-3xl mx-auto">
        {/* Job Header */}
        <div className="bg-blue-900 rounded-t-xl p-8 text-white">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
              <div className="flex items-center space-x-6 text-slate-200">
                <span className="flex items-center">
                  <FiUser className="mr-2" />
                  {job.student_name || 'Unknown'}
                </span>
                <span className="flex items-center">
                  <FiMapPin className="mr-2" />
                  {job.location || 'Remote'}
                </span>
              </div>
            </div>
            <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium">
              {typeof job.subject === 'object' ? job.subject.name : job.subject}
            </span>
          </div>
        </div>

        {/* Job Details */}
        <div className="bg-white rounded-b-xl shadow-md divide-y divide-slate-200">
          {/* Meta Information */}
          <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-slate-700">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg text-blue-900">
                <FiCalendar className="text-lg" />
              </div>
              <div>
                <p className="text-sm">Posted on</p>
                <p className="font-medium">{formatDate(job.created_at)}</p>
              </div>
            </div>

            {job.salary && (
              <div className="flex items-start space-x-3">
                <div className="bg-green-100 p-2 rounded-lg text-green-700">
                  <FiDollarSign className="text-lg" />
                </div>
                <div>
                  <p className="text-sm">Salary</p>
                  <p className="font-medium">{job.salary}</p>
                </div>
              </div>
            )}

            <div className="flex items-start space-x-3">
              <div className="bg-purple-100 p-2 rounded-lg text-purple-700">
                <FiClock className="text-lg" />
              </div>
              <div>
                <p className="text-sm">Job Type</p>
                <p className="font-medium">{job.job_type || 'Not specified'}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-amber-100 p-2 rounded-lg text-amber-700">
                <FiBook className="text-lg" />
              </div>
              <div>
                <p className="text-sm">Subject</p>
                <p className="font-medium">
                  {typeof job.subject === 'object' ? job.subject.name : job.subject}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="p-6 sm:p-8">
            <div className="prose max-w-none text-slate-800">
              <h3 className="text-xl font-semibold mb-6 pb-2 border-b border-slate-200">
                Job Description
              </h3>
              <div className="space-y-4">
                {job.description.split('\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Apply Section */}
          <div className="p-6 sm:p-8 bg-gray-50 rounded-b-xl">
            <div className="max-w-full mx-auto text-center">

              <button
                onClick={handleApply}
                disabled={applyStatus === 'loading' || applyStatus === 'success'}
                className={`w-full px-6 py-3 rounded-lg font-semibold text-white shadow-sm transition-all duration-200 flex items-center justify-center ${
                  applyStatus === 'success'
                    ? 'bg-green-700 hover:bg-green-800'
                    : 'bg-blue-900 hover:bg-blue-800'
                } ${
                  (applyStatus === 'loading' || applyStatus === 'success') ? 'opacity-90 cursor-not-allowed' : ''
                }`}
              >
                {applyStatus === 'loading' ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing Application...
                  </>
                ) : applyStatus === 'success' ? (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Successfully Applied!
                  </>
                ) : (
                  'Apply Now'
                )}
              </button>

              {applyStatus === 'failed' && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center justify-center">
                  <FiAlertCircle className="mr-2" />
                  Application failed. Please try again.
                </div>
              )}
              <div className="mt-6 space-y-4 bg-white/50 p-4 rounded-lg border border-slate-200">
                <h3 className="text-base font-semibold text-slate-700 flex items-center">
                  <svg 
                    className="w-5 h-5 mr-2 text-blue-500" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                  </svg>
                  Interested in this position?
                </h3>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {user ? (
                      <svg 
                        className="h-5 w-5 text-green-500 mt-0.5 mr-2" 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path 
                          fillRule="evenodd" 
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                    ) : (
                      <svg 
                        className="h-5 w-5 text-amber-500 mt-0.5 mr-2" 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path 
                          fillRule="evenodd" 
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                    )}
                  </div>
                  <p className="text-sm text-slate-600">
                    {user ? (
                      <>
                        <span className="font-medium text-slate-700">1 credit</span> will be deducted from your account upon application
                      </>
                    ) : (
                      <>
                        You need to <span className="font-medium text-slate-700">login</span> to apply for this position
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
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
