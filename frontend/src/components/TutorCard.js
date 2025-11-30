import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BuyCreditsModal from './BuyCreditsModal';
import { contactUnlockAPI } from '../utils/apiService';
import ProfileImageWithBg from './ProfileImageWithBg';
import StarRating from './StarRating';

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
      className={`bg-white rounded-2xl p-6 transition-all duration-300 border ${
        featured
          ? 'border-yellow-200 shadow-md ring-1 ring-yellow-100'
          : 'border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-100'
      }`}
    >
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left: Avatar & Location */}
        <div className="flex-shrink-0 flex flex-col items-center md:w-48">
          <div className="relative mb-3">
             {tutor.profile_picture ? (
                <ProfileImageWithBg imageUrl={tutor.profile_picture} size={96} />
             ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-inner">
                  {tutor.username?.charAt(0).toUpperCase() || 'T'}
                </div>
             )}
            {featured && (
              <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm uppercase tracking-wider">
                Featured
              </div>
            )}
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-500 text-sm mb-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{tutor.location || 'Remote'}</span>
            </div>
            {tutor.hourly_rate && (
              <div className="font-semibold text-gray-900">
                ${tutor.hourly_rate}/hr
              </div>
            )}
          </div>
        </div>

        {/* Middle: Info */}
        <div className="flex-grow min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <h3 className="text-xl font-bold text-gray-900 truncate">
              {tutor.username || 'Anonymous Tutor'}
            </h3>
            <div className="flex items-center gap-2">
              {tutor.is_verified && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                  <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Verified
                </span>
              )}
            </div>
          </div>

          {/* Rating Display */}
          <div className="mb-3">
             <StarRating rating={tutor.average_rating || 0} count={tutor.review_count || 0} />
          </div>

          <p className="text-gray-600 text-sm line-clamp-2 mb-4">
            {tutor.bio || "No bio available."}
          </p>

          <div className="space-y-3">
             <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Teaches</h4>
                 <div className="flex flex-wrap gap-2">
                  {tutor.subjects?.length > 0 ? (
                    tutor.subjects.slice(0, 5).map((subject, i) => (
                      <span key={i} className="px-2.5 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-lg">
                        {subject}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500 italic">No subjects listed</span>
                  )}
                  {tutor.subjects?.length > 5 && (
                     <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-lg">
                       +{tutor.subjects.length - 5}
                     </span>
                  )}
                </div>
             </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-col gap-3 min-w-[200px] border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 justify-center">
            {currentUserType === 'student' ? (
              <Link
                to={`/tutors/${tutor.id}`}
                className="w-full text-center px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition shadow-sm hover:shadow"
              >
                View Profile
              </Link>
            ) : (
               <Link
                to={`/tutors/${tutor.id}`}
                 className="w-full text-center px-4 py-2.5 rounded-xl border border-indigo-200 text-indigo-700 bg-indigo-50 text-sm font-semibold hover:bg-indigo-100 transition"
               >
                 View Profile
               </Link>
            )}

            <div className="bg-gray-50 rounded-xl p-3">
               {isUnlocked ? (
                  <div className="text-sm space-y-1">
                     <div className="flex items-center gap-2 text-gray-700">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="truncate">{contactInfo.phone}</span>
                     </div>
                     <div className="flex items-center gap-2 text-gray-700">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="truncate">{contactInfo.email}</span>
                     </div>
                  </div>
               ) : (
                  <button
                    onClick={handleUnlockContact}
                    disabled={unlocking}
                    className="w-full text-center text-sm text-gray-600 hover:text-indigo-600 font-medium transition flex items-center justify-center gap-1"
                  >
                     {unlocking ? (
                        <span>Unlocking...</span>
                     ) : (
                        <>
                           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                           </svg>
                           Unlock Contact (1 pt)
                        </>
                     )}
                  </button>
               )}
            </div>
             {error && <p className="text-xs text-red-600 text-center">{error}</p>}
        </div>
      </div>

      <BuyCreditsModal
        show={showBuyCredits}
        onClose={() => setShowBuyCredits(false)}
        onBuyCredits={() => (window.location.href = '/buy-points')}
        message="You need more points to unlock contact information."
      />
    </div>
  );
};

export default TutorCard;