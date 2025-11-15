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
      className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md ${
        featured ? 'border-2 border-yellow-400' : ''
      }`}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
        <div className="bg-gray-50 p-5 flex flex-col items-center justify-center gap-4 border-r border-gray-200">
          <div
            className={`w-20 h-20 rounded-xl flex items-center justify-center text-3xl font-bold ${
              featured
                ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white'
                : 'bg-blue-600 text-white'
            }`}
          >
            {tutor.username?.charAt(0).toUpperCase() || 'T'}
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">Location</p>
            <p className="text-base font-medium text-gray-900 mt-1">
              {tutor.location || 'Not specified'}
            </p>
          </div>
        </div>

        <div className="md:col-span-2 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900 truncate">
              {tutor.username || 'Anonymous Tutor'}
            </h3>
            <div className="flex gap-2">
              {tutor.is_verified && (
                <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-800 rounded">
                  Verified
                </span>
              )}
              {tutor.is_premium && (
                <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded">
                  Premium
                </span>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Contact Information</h4>
            <div className="mt-2">
              {isUnlocked ? (
                <div className="space-y-1">
                  {contactInfo.phone && (
                    <p className="text-sm text-gray-900">{contactInfo.phone}</p>
                  )}
                  {contactInfo.email && (
                    <p className="text-sm text-gray-900">{contactInfo.email}</p>
                  )}
                  {!contactInfo.phone && !contactInfo.email && (
                    <p className="text-sm text-gray-500">Contact not available</p>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={handleUnlockContact}
                    disabled={unlocking}
                    className={`px-4 py-2 rounded-md text-white text-sm shadow-sm transition-all ${
                      unlocking
                        ? 'bg-blue-300 cursor-not-allowed'
                        : 'bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                    }`}
                  >
                    {unlocking ? 'Unlocking...' : 'Unlock (1 point)'}
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
            <div className="mt-2">
              {tutor.subjects?.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {tutor.subjects.slice(0, 3).map((subject, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded"
                    >
                      {subject}
                    </span>
                  ))}
                  {tutor.subjects.length > 3 && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                      +{tutor.subjects.length - 3} more
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No subjects listed</p>
              )}
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
            className="w-full flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium text-white bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            View Full Profile →
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
        onBuyCredits={() => (window.location.href = '/point-purchase')}
        message="You need more points to unlock contact information. Please purchase points to proceed."
      />
    </div>
  );
};

export default TutorCard;
