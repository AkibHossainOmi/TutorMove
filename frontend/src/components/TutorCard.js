// src/components/TutorCard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BuyCreditsModal from './BuyCreditsModal';
import { contactUnlockAPI } from '../utils/apiService';
import ProfileImageWithBg from './ProfileImageWithBg';
import StarRating from './StarRating';
import { MapPin, CheckCircle, Mail, Phone, Lock, Unlock, ArrowRight, BookOpen } from 'lucide-react';
import Card from './ui/Card';
import Badge from './ui/Badge';
import Button from './ui/Button';

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
        setError('Only students can unlock contact info.');
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
    <Card
      className={`group h-full flex flex-col ${featured ? 'ring-2 ring-amber-400/50 dark:ring-amber-500/30' : ''}`}
      hover={true}
      noPadding={false}
    >
      {/* Featured Badge */}
      {featured && (
        <div className="absolute top-0 right-0 z-10">
          <div className="bg-gradient-to-l from-amber-400 to-amber-300 text-amber-950 text-[10px] font-extrabold px-3 py-1 rounded-bl-xl shadow-sm uppercase tracking-wider flex items-center gap-1">
             <StarRating rating={1} count={0} size={10} className="text-amber-900" />
             Top Rated
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column: Avatar & Quick Stats */}
        <div className="flex-shrink-0 flex flex-col items-center md:items-start space-y-4 md:w-48">
          <div className="relative group-hover:scale-105 transition-transform duration-300">
             {tutor.profile_picture ? (
                <ProfileImageWithBg imageUrl={tutor.profile_picture} size={96} className="rounded-2xl shadow-md border-2 border-white dark:border-dark-bg" />
             ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 flex items-center justify-center text-3xl font-bold text-white shadow-md border-2 border-white dark:border-dark-bg">
                  {tutor.username?.charAt(0).toUpperCase() || 'T'}
                </div>
             )}
             {tutor.is_verified && (
                <div className="absolute -bottom-2 -right-2 bg-white dark:bg-dark-bg p-1 rounded-full shadow-sm">
                   <CheckCircle className="w-5 h-5 text-blue-500 fill-blue-50 dark:fill-blue-900/30" />
                </div>
             )}
          </div>

          <div className="text-center md:text-left w-full space-y-3">
            <div className="flex items-center justify-center md:justify-start gap-1.5 text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wide">
              <MapPin className="w-3.5 h-3.5" />
              <span>{tutor.location || 'Remote'}</span>
            </div>

            {tutor.hourly_rate && (
              <div className="flex flex-col items-center md:items-start">
                 <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">
                    ${tutor.hourly_rate}
                 </span>
                 <span className="text-xs text-slate-400 font-medium">per hour</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Main Info & Actions */}
        <div className="flex-grow flex flex-col min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-3">
             <div>
                <Link
                   to={`/profile/${tutor.username}`}
                   className="text-xl font-bold text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-1"
                >
                   {tutor.username || 'Anonymous Tutor'}
                </Link>
                <div className="flex items-center gap-2 mt-1">
                   <StarRating rating={tutor.average_rating || 0} count={tutor.review_count || 0} size={14} />
                </div>
             </div>
          </div>

          {/* Subjects Tags */}
          <div className="mb-4">
             <div className="flex flex-wrap gap-1.5">
                {tutor.subjects?.length > 0 ? (
                  tutor.subjects.slice(0, 4).map((subject, i) => (
                    <Badge key={i} variant="primary" icon={BookOpen}>
                      {subject}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-slate-400 italic">No subjects listed</span>
                )}
                {tutor.subjects?.length > 4 && (
                   <Badge variant="neutral">+{tutor.subjects.length - 4}</Badge>
                )}
             </div>
          </div>

          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed line-clamp-3 mb-6 flex-grow">
            {tutor.bio || "This tutor hasn't added a bio yet, but they are verified and ready to teach!"}
          </p>

          {/* Contact & Mobile Action */}
          <div className="mt-auto pt-6 border-t border-slate-100 dark:border-white/5 flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                      {isUnlocked ? (
                          <div className="flex flex-col gap-2">
                             <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                                <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                                   <Phone className="w-3.5 h-3.5" />
                                </div>
                                <span className="font-medium select-all">{contactInfo.phone || 'N/A'}</span>
                             </div>
                             <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                                <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                                   <Mail className="w-3.5 h-3.5" />
                                </div>
                                <span className="font-medium select-all">{contactInfo.email || 'N/A'}</span>
                             </div>
                          </div>
                       ) : (
                          <Button
                             variant="ghost"
                             size="sm"
                             className="text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 pl-0"
                             onClick={handleUnlockContact}
                             isLoading={unlocking}
                             leftIcon={!unlocking && <Lock className="w-4 h-4" />}
                             disabled={currentUserType !== 'student'}
                          >
                             {currentUserType === 'student' ? 'Unlock Contact (1 Pt)' : 'Students Only'}
                          </Button>
                       )}
                       {error && <p className="text-xs text-rose-500 mt-1 font-medium">{error}</p>}
                  </div>

                  <Link to={`/profile/${tutor.username}`}>
                     <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                        View Profile
                     </Button>
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
    </Card>
  );
};

export default TutorCard;
