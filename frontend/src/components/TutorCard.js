import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import BuyCreditsModal from './BuyCreditsModal';

const getTrustLabel = (score) => {
  const numericScore = parseFloat(score) || 1.0;
  if (numericScore >= 1.5) return { label: 'High Trust', color: 'emerald', emoji: '⭐' };
  if (numericScore >= 1.0) return { label: 'Moderate Trust', color: 'amber', emoji: '👍' };
  return { label: 'Low Trust', color: 'rose', emoji: '⚠️' };
};

const TutorCard = ({ tutor, featured = false }) => {
  const [contactInfo, setContactInfo] = useState('[Locked. Buy credits to view.]');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [showBuyCredits, setShowBuyCredits] = useState(false);
  const [currentUserType, setCurrentUserType] = useState('');
  const [error, setError] = useState('');

  const trust = getTrustLabel(tutor.trust_score);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUserType(user?.user_type || '');

    if (!token || !user || user.user_type !== 'student') return;

    axios
      .get(`http://localhost:8000/api/check-unlock-status/`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { student_id: user.user_id, tutor_id: tutor.id },
      })
      .then((res) => {
        if (res.data.unlocked) {
          setIsUnlocked(true);
          setContactInfo(tutor.phone_number || tutor.email || 'Contact not available');
        }
      })
      .catch(() => {
        // fail silently
      });
  }, [tutor.id]);

  const handleUnlockContact = async () => {
    setUnlocking(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      if (!token || !user || user.user_type !== 'student') {
        setError('Only students can unlock tutor contact info. Please log in as a student.');
        setUnlocking(false);
        return;
      }

      const res = await axios.post(
        'http://localhost:8000/api/unlock-contact/',
        { student_id: user.user_id, tutor_id: tutor.id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const contact = res.data.phone || res.data.email;
      setContactInfo(contact || 'Contact not available');
      setIsUnlocked(true);
      setError('');
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        (typeof err.response?.data === 'string' ? err.response.data : '') ||
        'Failed to unlock contact info.';
      setError(msg);

      if (msg.toLowerCase().includes('credit') || err.response?.status === 402) {
        setShowBuyCredits(true);
      }
    } finally {
      setUnlocking(false);
    }
  };

  // Color classes for different elements
  const colorClasses = {
    emerald: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-800',
      border: 'border-emerald-300',
      badge: 'bg-emerald-600 text-white',
    },
    amber: {
      bg: 'bg-amber-100',
      text: 'text-amber-800',
      border: 'border-amber-300',
      badge: 'bg-amber-400 text-gray-900',
    },
    rose: {
      bg: 'bg-rose-100',
      text: 'text-rose-800',
      border: 'border-rose-300',
      badge: 'bg-rose-600 text-white',
    },
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-300',
      badge: 'bg-blue-600 text-white',
    },
    gray: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      border: 'border-gray-300',
      badge: 'bg-gray-400 text-white',
    },
  };

  const trustColor = colorClasses[trust.color] || colorClasses.gray;

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md ${
      featured ? 'border-2 border-yellow-400' : ''
    }`}>
      {/* Header with tutor info */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
            featured ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' : 'bg-blue-600 text-white'
          }`}>
            {tutor.username ? tutor.username.charAt(0).toUpperCase() : 'T'}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{tutor.username || 'Anonymous Tutor'}</h3>
            <p className="text-sm text-gray-500">{tutor.location || 'Location not specified'}</p>
            
            {/* Badges row */}
            <div className="flex flex-wrap gap-2 mt-2">
              {tutor.is_verified && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorClasses.emerald.bg} ${colorClasses.emerald.text} ${colorClasses.emerald.border}`}>
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified
                </span>
              )}
              {tutor.is_premium && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorClasses.amber.bg} ${colorClasses.amber.text} ${colorClasses.amber.border}`}>
                  <span className="mr-1">🌟</span>
                  Featured
                </span>
              )}
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${trustColor.bg} ${trustColor.text} ${trustColor.border}`}>
                <span className="mr-1">{trust.emoji}</span>
                {trust.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200"></div>

      {/* Details section */}
      <div className="p-5">
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Contact Information</h4>
            <div className="mt-1">
              {isUnlocked ? (
                <p className="text-sm text-gray-900">{contactInfo}</p>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 whitespace-nowrap">
                  <button
                    onClick={handleUnlockContact}
                    disabled={unlocking}
                    className={`px-4 py-2 rounded-md text-white font-medium text-sm shadow-sm transition-all ${
                      unlocking
                        ? 'bg-blue-300 cursor-not-allowed'
                        : 'bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:translate-y-0.5'
                    } flex items-center justify-center`}
                  >
                    {unlocking ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Unlocking...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                        </svg>
                        Unlock (1 credit)
                      </>
                    )}
                  </button>
                  <span className="text-xs text-gray-500 text-center sm:text-left">View contact</span>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <div>
            <h4 className="text-sm font-medium text-gray-500">Subjects</h4>
            <div className="mt-1">
              {tutor.subjects?.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {tutor.subjects.slice(0, 3).map((subject, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {subject}
                    </span>
                  ))}
                  {tutor.subjects.length > 3 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      +{tutor.subjects.length - 3} more
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No subjects listed</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Rating</h4>
              <div className="mt-1 flex items-center">
                <span className="text-yellow-500 mr-1">⭐</span>
                <span className="text-sm font-medium text-gray-900">
                  {tutor.average_rating ? tutor.average_rating.toFixed(1) : 'N/A'}
                </span>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Member Since</h4>
              <p className="mt-1 text-sm text-gray-900">
                {tutor.date_joined
                  ? new Date(tutor.date_joined).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                    })
                  : 'Recently'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with view profile button */}
      <div className="bg-gray-50 px-5 py-3 border-t border-gray-200">
        {currentUserType === 'student' ? (
          <Link
            to={`/tutors/${tutor.id}`}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            View Full Profile
            <svg className="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        ) : (
          <div className="text-center text-sm text-gray-500">
            Log in as student to view full profile
          </div>
        )}
      </div>

      <BuyCreditsModal
        show={showBuyCredits}
        onClose={() => setShowBuyCredits(false)}
        onBuyCredits={() => (window.location.href = '/credit-purchase')}
        message="You need more credits to unlock contact information. Please purchase credits to proceed."
      />
    </div>
  );
};

export default TutorCard;