import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tutorAPI } from '../utils/apiService';
import LoadingSpinner from '../components/LoadingSpinner';
import StarRating from '../components/StarRating';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  FiMapPin,
  FiBook,
  FiPhone,
  FiClock,
  FiUser,
  FiUnlock,
  FiAlertCircle,
  FiBriefcase,
  FiAward
} from 'react-icons/fi';

const GigDetails = () => {
  const { id } = useParams();
  const [gig, setGig] = useState(null);
  const [contactInfo, setContactInfo] = useState(null);
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    const fetchGig = async () => {
      setLoading(true);
      try {
        const res = await tutorAPI.getTutor(id);
        setGig(res.data);
        // Check if contact info is already unlocked (e.g. based on response data structure)
        // Adjust logic based on your actual API response
        if (res.data.contact_info && !res.data.contact_info.includes('Locked')) {
           setContactInfo(res.data.contact_info);
           setIsUnlocked(true);
        } else {
           setContactInfo('[Locked. Buy points to view.]');
           setIsUnlocked(false);
        }
      } catch (err) {
        setError('Failed to load gig details.');
      } finally {
        setLoading(false);
      }
    };
    fetchGig();
  }, [id]);

  const handleUnlockContact = async () => {
    setUnlocking(true);
    setError('');
    try {
      const res = await tutorAPI.unlockContact(id);
      setContactInfo(res.data.contact_info);
      setIsUnlocked(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to unlock contact info. Ensure you have enough points.');
    } finally {
      setUnlocking(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-dark-bg font-sans">
      <Navbar />
      <div className="flex-grow flex items-center justify-center">
         <LoadingSpinner />
      </div>
      <Footer />
    </div>
  );

  if (!gig) return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-dark-bg font-sans">
       <Navbar />
       <div className="flex-grow flex items-center justify-center">
          <div className="text-center p-8 bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-200 dark:border-dark-border">
             <FiAlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
             <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Gig Not Found</h3>
             <p className="text-gray-500 dark:text-gray-400 mb-6">The gig you are looking for does not exist.</p>
             <Link to="/tutors" className="px-6 py-2 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition">
                Browse Tutors
             </Link>
          </div>
       </div>
       <Footer />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-dark-bg font-sans text-gray-900 dark:text-gray-300 transition-colors duration-300">
      <Navbar />

      <main className="flex-grow max-w-5xl mx-auto w-full px-6 py-12 mt-20">

        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
           <Link to="/tutors" className="hover:text-primary-600 dark:hover:text-primary-400 transition">Tutors</Link>
           <span>/</span>
           <span className="text-gray-900 dark:text-white truncate max-w-[200px]">{gig.title || 'Gig Details'}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

           {/* Left Column: Gig Info */}
           <div className="lg:col-span-2 space-y-6">

              <div className="bg-white dark:bg-dark-card rounded-3xl shadow-sm border border-gray-200 dark:border-dark-border p-8">
                 <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{gig.title || 'Untitled Gig'}</h1>

                 <div className="flex flex-wrap items-center gap-4 mb-6">
                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-dark-bg-tertiary px-3 py-1.5 rounded-lg border border-gray-100 dark:border-dark-border">
                       <FiUser className="text-gray-400 dark:text-gray-500" />
                       <Link to={`/profile/${gig.teacher?.username}`} className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                          {gig.teacher?.username || 'Tutor'}
                       </Link>
                    </div>
                    {gig.teacher && (
                       <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-lg border border-amber-100 dark:border-amber-800/30">
                          <StarRating rating={gig.teacher.average_rating || 0} count={gig.teacher.review_count || 0} size={16} />
                       </div>
                    )}
                 </div>

                 <div className="prose prose-gray dark:prose-invert max-w-none">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                       <FiBriefcase className="text-primary-500" /> Description
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line text-lg">
                       {gig.description}
                    </p>
                 </div>
              </div>

              <div className="bg-white dark:bg-dark-card rounded-3xl shadow-sm border border-gray-200 dark:border-dark-border p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                 <InfoItem icon={<FiBook />} label="Subject" value={gig.subject} />
                 <InfoItem icon={<FiMapPin />} label="Location" value={gig.location} />
                 <InfoItem icon={<FiBriefcase />} label="Experience" value={gig.experience} />
                 <InfoItem icon={<FiAward />} label="Education" value={gig.education} />
                 <InfoItem icon={<FiClock />} label="Posted" value={new Date(gig.created_at).toLocaleDateString()} />
              </div>

           </div>

           {/* Right Column: Contact & Actions */}
           <div className="lg:col-span-1 space-y-6">

              <div className="bg-white dark:bg-dark-card rounded-3xl shadow-sm border border-gray-200 dark:border-dark-border p-8 text-center sticky top-24">
                 <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600 dark:text-primary-400">
                    {isUnlocked ? <FiPhone size={28} /> : <FiUnlock size={28} />}
                 </div>

                 <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Contact Info</h3>

                 {isUnlocked ? (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200 p-4 rounded-xl font-bold text-lg mb-4 border border-emerald-100 dark:border-emerald-800/30">
                       {contactInfo}
                    </div>
                 ) : (
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                       Unlock this tutor's contact details to get in touch directly.
                    </p>
                 )}

                 {!isUnlocked && (
                    <button
                       onClick={handleUnlockContact}
                       disabled={unlocking}
                       className="w-full bg-primary-600 text-white py-3.5 rounded-xl font-bold hover:bg-primary-700 transition shadow-lg shadow-primary-500/30 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                    >
                       {unlocking ? 'Unlocking...' : 'Unlock Contact (1 Point)'}
                    </button>
                 )}

                 {error && (
                    <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-sm rounded-lg border border-rose-100 dark:border-rose-800/30 flex items-center justify-center gap-2">
                       <FiAlertCircle /> {error}
                    </div>
                 )}

                 <div className="mt-6 pt-6 border-t border-gray-100 dark:border-dark-border">
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                       Safety Tip: Always communicate through our platform initially for your safety.
                    </p>
                 </div>
              </div>

           </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

const InfoItem = ({ icon, label, value }) => (
   <div className="flex items-start gap-3">
      <div className="p-2.5 bg-gray-50 dark:bg-dark-bg-tertiary rounded-lg text-gray-400 dark:text-gray-500 border border-gray-100 dark:border-dark-border mt-1">
         {React.cloneElement(icon, { size: 18 })}
      </div>
      <div>
         <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">{label}</p>
         <p className="text-base font-bold text-gray-900 dark:text-white">{value || 'N/A'}</p>
      </div>
   </div>
);

export default GigDetails;
