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
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Navbar />
      <div className="flex-grow flex items-center justify-center">
         <LoadingSpinner />
      </div>
      <Footer />
    </div>
  );

  if (!gig) return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
       <Navbar />
       <div className="flex-grow flex items-center justify-center">
          <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
             <FiAlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
             <h3 className="text-xl font-bold text-slate-900 mb-2">Gig Not Found</h3>
             <p className="text-slate-500 mb-6">The gig you are looking for does not exist.</p>
             <Link to="/tutors" className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition">
                Browse Tutors
             </Link>
          </div>
       </div>
       <Footer />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
      <Navbar />

      <main className="flex-grow max-w-5xl mx-auto w-full px-6 py-12 mt-20">

        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-slate-500 font-medium">
           <Link to="/tutors" className="hover:text-indigo-600 transition">Tutors</Link>
           <span>/</span>
           <span className="text-slate-900 truncate max-w-[200px]">{gig.title || 'Gig Details'}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

           {/* Left Column: Gig Info */}
           <div className="lg:col-span-2 space-y-6">

              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                 <h1 className="text-3xl font-bold text-slate-900 mb-3">{gig.title || 'Untitled Gig'}</h1>

                 <div className="flex flex-wrap items-center gap-4 mb-6">
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                       <FiUser className="text-slate-400" />
                       <Link to={`/profile/${gig.teacher?.username}`} className="text-indigo-600 font-semibold hover:underline">
                          {gig.teacher?.username || 'Tutor'}
                       </Link>
                    </div>
                    {gig.teacher && (
                       <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                          <StarRating rating={gig.teacher.average_rating || 0} count={gig.teacher.review_count || 0} size={16} />
                       </div>
                    )}
                 </div>

                 <div className="prose prose-slate max-w-none">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                       <FiBriefcase className="text-indigo-500" /> Description
                    </h3>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-line text-lg">
                       {gig.description}
                    </p>
                 </div>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                 <InfoItem icon={<FiBook />} label="Subject" value={gig.subject} />
                 <InfoItem icon={<FiMapPin />} label="Location" value={gig.location} />
                 <InfoItem icon={<FiBriefcase />} label="Experience" value={gig.experience} />
                 <InfoItem icon={<FiAward />} label="Education" value={gig.education} />
                 <InfoItem icon={<FiClock />} label="Posted" value={new Date(gig.created_at).toLocaleDateString()} />
              </div>

           </div>

           {/* Right Column: Contact & Actions */}
           <div className="lg:col-span-1 space-y-6">

              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 text-center sticky top-24">
                 <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
                    {isUnlocked ? <FiPhone size={28} /> : <FiUnlock size={28} />}
                 </div>

                 <h3 className="text-xl font-bold text-slate-900 mb-2">Contact Info</h3>

                 {isUnlocked ? (
                    <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl font-bold text-lg mb-4 border border-emerald-100">
                       {contactInfo}
                    </div>
                 ) : (
                    <p className="text-slate-500 mb-6">
                       Unlock this tutor's contact details to get in touch directly.
                    </p>
                 )}

                 {!isUnlocked && (
                    <button
                       onClick={handleUnlockContact}
                       disabled={unlocking}
                       className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 disabled:bg-slate-300 disabled:cursor-not-allowed"
                    >
                       {unlocking ? 'Unlocking...' : 'Unlock Contact (1 Point)'}
                    </button>
                 )}

                 {error && (
                    <div className="mt-4 p-3 bg-rose-50 text-rose-600 text-sm rounded-lg border border-rose-100 flex items-center justify-center gap-2">
                       <FiAlertCircle /> {error}
                    </div>
                 )}

                 <div className="mt-6 pt-6 border-t border-slate-100">
                    <p className="text-xs text-slate-400">
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
      <div className="p-2.5 bg-slate-50 rounded-lg text-slate-400 border border-slate-100 mt-1">
         {React.cloneElement(icon, { size: 18 })}
      </div>
      <div>
         <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
         <p className="text-base font-bold text-slate-900">{value || 'N/A'}</p>
      </div>
   </div>
);

export default GigDetails;
