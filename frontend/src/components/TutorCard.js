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
  const [contactInfo, setContactInfo] = useState({ phone: '', email: '' });
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
      .get(`${process.env.REACT_APP_API_URL}/api/check-unlock-status/`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { student_id: user.user_id, tutor_id: tutor.id },
      })
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
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      if (!token || !user || user.user_type !== 'student') {
        setError('Only students can unlock tutor contact info. Please log in as a student.');
        setUnlocking(false);
        return;
      }

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/unlock-contact/`,
        { student_id: user.user_id, tutor_id: tutor.id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setContactInfo({
        phone: res.data.phone || '',
        email: res.data.email || '',
      });
      setIsUnlocked(true);
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

  const trustColor = {
    emerald: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    amber: 'bg-amber-100 text-amber-800 border-amber-300',
    rose: 'bg-rose-100 text-rose-800 border-rose-300',
  }[trust.color] || 'bg-gray-100 text-gray-800 border-gray-300';

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md ${featured ? 'border-2 border-yellow-400' : ''}`}>
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${featured ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' : 'bg-blue-600 text-white'}`}>
            {tutor.username?.charAt(0).toUpperCase() || 'T'}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{tutor.username || 'Anonymous Tutor'}</h3>
            <p className="text-sm text-gray-500">{tutor.location || 'Location not specified'}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {tutor.is_verified && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-300">
                  ✅ Verified
                </span>
              )}
              {tutor.is_premium && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300">
                  🌟 Premium
                </span>
              )}
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${trustColor}`}>
                {trust.emoji} {trust.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200"></div>

      <div className="p-5 space-y-3">
        <div>
          <h4 className="text-sm font-medium text-gray-500">Contact Information</h4>
          <div className="mt-1">
            {isUnlocked ? (
              <div className="space-y-1">
                {contactInfo.phone && (
                  <p className="text-sm text-gray-900 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h1.586a1 1 0 01.707.293l2.121 2.121a1 1 0 01.293.707V7a1 1 0 01-.293.707l-1.293 1.293a10.97 10.97 0 005.657 5.657l1.293-1.293A1 1 0 0117 12h1.879a1 1 0 01.707.293l2.121 2.121a1 1 0 01.293.707V19a2 2 0 01-2 2h-1C10.611 21 3 13.389 3 4V5z" />
                    </svg>
                    {contactInfo.phone}
                  </p>
                )}
                {contactInfo.email && (
                  <p className="text-sm text-gray-900 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {contactInfo.email}
                  </p>
                )}
                {!contactInfo.phone && !contactInfo.email && (
                  <p className="text-sm text-gray-500">Contact not available</p>
                )}
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 whitespace-nowrap">
                <button
                  onClick={handleUnlockContact}
                  disabled={unlocking}
                  className={`px-4 py-2 rounded-md text-white font-medium text-sm shadow-sm transition-all ${
                    unlocking
                      ? 'bg-blue-300 cursor-not-allowed'
                      : 'bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                  } flex items-center justify-center`}
                >
                  {unlocking ? 'Unlocking...' : 'Unlock (1 credit)'}
                </button>
                <span className="text-xs text-gray-500">View contact</span>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div>
          <h4 className="text-sm font-medium text-gray-500">Subjects</h4>
          <div className="mt-1">
            {tutor.subjects?.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {tutor.subjects.slice(0, 3).map((subject, i) => (
                  <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
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
              <span className="text-sm font-medium text-gray-900">{tutor.average_rating?.toFixed(1) || 'N/A'}</span>
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

      <div className="bg-gray-50 px-5 py-3 border-t border-gray-200">
        {currentUserType === 'student' ? (
          <Link
            to={`/tutors/${tutor.id}`}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            View Full Profile →
          </Link>
        ) : (
          <div className="text-center text-sm text-gray-500">Log in as student to view full profile</div>
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
