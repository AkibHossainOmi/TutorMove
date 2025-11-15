import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BuyCreditsModal from './BuyCreditsModal';
import { contactUnlockAPI } from '../utils/apiService';

const TutorCard = ({ tutor, featured = false }) => {
  const [contactInfo, setContactInfo] = useState({ phone: '', email: '' });
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [showBuyCredits, setShowBuyCredits] = useState(false);
  const [currentUserType, setCurrentUserType] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUserType(user?.user_type || '');

    if (!user || user.user_type !== 'student') return;

    contactUnlockAPI
      .checkUnlockStatus(tutor.id)
      .then((res) => {
        if (res.data.unlocked) {
          setIsUnlocked(true);
          setContactInfo({
            phone: tutor.phone_number || '',
            email: tutor.email || '',
          });
        }
      })
      .catch(() => {});
  }, [tutor.id, tutor.email, tutor.phone_number]);

  const handleUnlockContact = async () => {
    setUnlocking(true);
    setError('');
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || user.user_type !== 'student') {
        setError('Only students can unlock tutor contact info. Please log in as a student.');
        setUnlocking(false);
        return;
      }

      const res = await contactUnlockAPI.unlockContact(tutor.id);

      setContactInfo({
        phone: res.data.phone || tutor.phone_number || '',
        email: res.data.email || tutor.email || '',
      });
      setIsUnlocked(true);
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        (typeof err.response?.data === 'string' ? err.response.data : '') ||
        'Failed to unlock contact info.';
      setError(msg);

      if (msg.toLowerCase().includes('point') || err.response?.status === 402) {
        setShowBuyCredits(true);
      }
    } finally {
      setUnlocking(false);
    }
  };

  return (
    <div
      className={`bg-white rounded-lg overflow-hidden transition-all duration-200 ${
        featured
          ? 'shadow-lg border-2 border-amber-400 hover:shadow-xl'
          : 'shadow-md hover:shadow-lg border border-gray-200'
      }`}
    >
      <div className="flex flex-col sm:flex-row">
        {/* LEFT COLUMN - Avatar & Location */}
        <div className={`w-full sm:w-1/3 p-6 flex flex-col items-center justify-start ${
          featured ? 'bg-gradient-to-br from-amber-50 to-orange-50' : 'bg-gray-50'
        }`}>
          {/* Avatar */}
          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold shadow-md ${
              featured
                ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white'
                : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
            }`}
          >
            {tutor.username?.charAt(0).toUpperCase() || 'T'}
          </div>

          {/* Location */}
          <div className="mt-4 text-center">
            <div className="flex items-center justify-center gap-1 text-gray-600">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <p className="text-sm font-medium">{tutor.location || 'Location not specified'}</p>
            </div>
          </div>

          {/* Badges */}
          <div className="mt-4 flex flex-col gap-2 w-full">
            {tutor.is_verified && (
              <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-300">
                <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Verified
              </span>
            )}
            {tutor.is_premium && (
              <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-300">
                <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Premium
              </span>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN - All Other Information */}
        <div className="w-full sm:w-2/3 p-6 flex flex-col">
          {/* Name */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {tutor.username || 'Anonymous Tutor'}
            </h3>
            <p className="text-sm text-gray-500">
              Member since{' '}
              {tutor.date_joined
                ? new Date(tutor.date_joined).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                  })
                : 'recently'}
            </p>
          </div>

          {/* Subjects */}
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Subjects
            </h4>
            {tutor.subjects?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tutor.subjects.slice(0, 4).map((subject, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    {subject}
                  </span>
                ))}
                {tutor.subjects.length > 4 && (
                  <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                    +{tutor.subjects.length - 4} more
                  </span>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">No subjects listed</p>
            )}
          </div>

          {/* Contact Information */}
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Contact Information
            </h4>
            {isUnlocked ? (
              <div className="space-y-2 bg-gray-50 rounded-lg p-3 border border-gray-200">
                {contactInfo.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-900">
                    <svg
                      className="w-4 h-4 text-gray-500 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 5a2 2 0 012-2h1.586a1 1 0 01.707.293l2.121 2.121a1 1 0 01.293.707V7a1 1 0 01-.293.707l-1.293 1.293a10.97 10.97 0 005.657 5.657l1.293-1.293A1 1 0 0117 12h1.879a1 1 0 01.707.293l2.121 2.121a1 1 0 01.293.707V19a2 2 0 01-2 2h-1C10.611 21 3 13.389 3 4V5z"
                      />
                    </svg>
                    <span className="font-medium">{contactInfo.phone}</span>
                  </div>
                )}
                {contactInfo.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-900">
                    <svg
                      className="w-4 h-4 text-gray-500 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="font-medium">{contactInfo.email}</span>
                  </div>
                )}
                {!contactInfo.phone && !contactInfo.email && (
                  <p className="text-sm text-gray-400 italic">Contact information not available</p>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleUnlockContact}
                  disabled={unlocking}
                  className={`px-4 py-2 rounded-md text-sm font-semibold text-white transition-all ${
                    unlocking
                      ? 'bg-blue-300 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm hover:shadow'
                  }`}
                >
                  {unlocking ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Unlocking...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                      </svg>
                      Unlock Contact (1 point)
                    </span>
                  )}
                </button>
                <span className="text-xs text-gray-500">View phone & email</span>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 rounded">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="mt-auto pt-4">
            {currentUserType === 'student' ? (
              <Link
                to={`/tutors/${tutor.id}`}
                className="w-full inline-flex items-center justify-center px-5 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all"
              >
                View Full Profile
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ) : (
              <div className="text-center py-2 px-4 bg-gray-100 rounded-md">
                <p className="text-sm text-gray-600 font-medium">
                  Log in as a student to view full profile
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <BuyCreditsModal
        show={showBuyCredits}
        onClose={() => setShowBuyCredits(false)}
        onBuyCredits={() => (window.location.href = '/point-purchase')}
        message="You need more points to unlock contact information. Please purchase points to proceed."
      />
    </div>
  );
};

export default TutorCard;