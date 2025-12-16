// src/components/TutorCard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BuyCreditsModal from './BuyCreditsModal';
import { contactUnlockAPI } from '../utils/apiService';
import ProfileImageWithBg from './ProfileImageWithBg';
import StarRating from './StarRating';
import { MapPin, CheckCircle, Mail, Phone, Lock, Unlock, ArrowRight } from 'lucide-react';

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
      className={`group relative bg-white rounded-2xl overflow-hidden transition-all duration-300 ${
        featured
          ? 'border-2 border-amber-200 shadow-lg ring-4 ring-amber-50'
          : 'border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-100 hover:-translate-y-1'
      }`}
    >
      {/* Featured Badge */}
      {featured && (
        <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-400 to-amber-300 text-amber-900 text-xs font-bold px-4 py-1.5 rounded-bl-xl shadow-sm z-10 uppercase tracking-wider flex items-center gap-1">
           <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
           Top Rated
        </div>
      )}

      <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-8">
        {/* Left Column: Avatar & Quick Stats */}
        <div className="flex-shrink-0 flex flex-col items-center md:items-start space-y-4 md:w-56">
          <div className="relative group-hover:scale-105 transition-transform duration-300">
             {tutor.profile_picture ? (
                <ProfileImageWithBg imageUrl={tutor.profile_picture} size={110} className="rounded-2xl shadow-md" />
             ) : (
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-4xl font-bold text-white shadow-md">
                  {tutor.username?.charAt(0).toUpperCase() || 'T'}
                </div>
             )}
          </div>

          <div className="text-center md:text-left w-full space-y-2">
            <div className="flex items-center justify-center md:justify-start gap-1.5 text-slate-500 text-sm font-medium">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{tutor.location || 'Remote'}</span>
            </div>

            {tutor.hourly_rate && (
              <div className="inline-flex items-center justify-center md:justify-start px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-sm font-semibold text-slate-900 w-full md:w-auto">
                ${tutor.hourly_rate}/hr
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Main Info & Actions */}
        <div className="flex-grow flex flex-col min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
             <div>
                <div className="flex items-center gap-2 mb-1">
                   <h3 className="text-2xl font-bold text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer">
                      <Link to={`/profile/${tutor.username}`}>{tutor.username || 'Anonymous Tutor'}</Link>
                   </h3>
                   {tutor.is_verified && (
                     <span className="inline-flex items-center p-1 rounded-full bg-blue-50 text-blue-600" title="Verified Tutor">
                        <CheckCircle className="w-4 h-4" />
                     </span>
                   )}
                </div>
                <div className="flex items-center gap-3">
                   <StarRating rating={tutor.average_rating || 0} count={tutor.review_count || 0} size={16} />
                </div>
             </div>

             <div className="hidden sm:block">
                 {currentUserType === 'student' ? (
                   <Link
                      to={`/profile/${tutor.username}`}
                      className="btn btn-primary px-6 py-2 rounded-full shadow-md shadow-indigo-200 hover:shadow-lg transition-all text-sm"
                   >
                      View Profile
                   </Link>
                 ) : (
                    <Link
                      to={`/profile/${tutor.username}`}
                      className="btn btn-secondary px-6 py-2 rounded-full text-sm"
                   >
                      View Profile
                   </Link>
                 )}
             </div>
          </div>

          {/* Subjects Tags */}
          <div className="mb-4">
             <div className="flex flex-wrap gap-2">
                {tutor.subjects?.length > 0 ? (
                  tutor.subjects.slice(0, 5).map((subject, i) => (
                    <span key={i} className="px-3 py-1 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100">
                      {subject}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-400 italic">No subjects listed</span>
                )}
                {tutor.subjects?.length > 5 && (
                   <span className="px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-600 rounded-lg border border-slate-200">
                     +{tutor.subjects.length - 5}
                   </span>
                )}
             </div>
          </div>

          <p className="text-slate-600 text-sm leading-relaxed line-clamp-2 mb-6 flex-grow">
            {tutor.bio || "This tutor hasn't added a bio yet, but they are verified and ready to teach!"}
          </p>

          {/* Contact & Mobile Action */}
          <div className="mt-auto pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="w-full sm:w-auto">
                 {isUnlocked ? (
                    <div className="flex flex-col sm:flex-row gap-3 text-sm">
                       <div className="flex items-center gap-2 text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                          <Phone className="w-4 h-4 text-emerald-500" />
                          <span className="font-medium select-all">{contactInfo.phone || 'N/A'}</span>
                       </div>
                       <div className="flex items-center gap-2 text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                          <Mail className="w-4 h-4 text-blue-500" />
                          <span className="font-medium select-all">{contactInfo.email || 'N/A'}</span>
                       </div>
                    </div>
                 ) : (
                    <button
                      onClick={handleUnlockContact}
                      disabled={unlocking}
                      className="group flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                       <div className="p-1.5 bg-slate-100 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                          {unlocking ? <div className="animate-spin h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full" /> : <Lock className="w-4 h-4" />}
                       </div>
                       <span>{unlocking ? 'Unlocking...' : 'Unlock Contact Info (1 Point)'}</span>
                    </button>
                 )}
                 {error && <p className="text-xs text-rose-500 mt-2 font-medium bg-rose-50 px-2 py-1 rounded inline-block">{error}</p>}
              </div>

              <div className="sm:hidden w-full">
                 <Link
                    to={`/profile/${tutor.username}`}
                    className="flex items-center justify-center w-full px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold shadow-md"
                 >
                    View Profile <ArrowRight className="w-4 h-4 ml-2" />
                 </Link>
              </div>
          </div>
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
