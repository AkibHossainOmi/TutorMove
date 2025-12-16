import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { gigApi } from '../utils/apiService';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  ChevronDown,
  ChevronUp,
  Edit3,
  Save,
  X,
  Briefcase,
  Phone,
  Book,
  Clock,
  Award,
  FileText,
  TrendingUp,
  Zap,
  AlertCircle
} from 'lucide-react';

const TutorGigPage = () => {
  const { id } = useParams();
  const [gig, setGig] = useState(null);
  const [rankInfo, setRankInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rankLoading, setRankLoading] = useState(false);
  const [boosting, setBoosting] = useState(false);
  const [creditsToSpend, setCreditsToSpend] = useState('');
  const [predictedRank, setPredictedRank] = useState(null);
  const [predictLoading, setPredictLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    description: '',
    fee_details: '',
    education: '',
    experience: '',
    message: '',
    phone: ''
  });

  const fetchRank = useCallback(async (gigId) => {
    setRankLoading(true);
    try {
      const { data } = await gigApi.getGigRank(gigId);
      setRankInfo(data);
    } catch {
      toast.error('Failed to fetch current rank');
    } finally {
      setRankLoading(false);
    }
  }, []);

  const fetchGig = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await gigApi.getGig(id);
      setGig(data);
      fetchRank(data.id);
      setPredictedRank(null);
    } catch {
      toast.error('Failed to load gig details');
      setGig(null);
    } finally {
      setLoading(false);
    }
  }, [id, fetchRank]);

  useEffect(() => {
    fetchGig();
  }, [fetchGig]);

  useEffect(() => {
    if (gig) {
      setFormData({
        title: gig.title || '',
        subject: gig.subject || '',
        description: gig.description || '',
        fee_details: gig.fee_details || '',
        education: gig.education || '',
        experience: gig.experience || '',
        message: gig.message || '',
        phone: gig.phone || ''
      });
    }
  }, [gig]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await gigApi.updateGig(gig.id, formData);
      toast.success('Gig updated successfully');
      setEditing(false);
      fetchGig();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to update gig');
    }
  };

  const fetchPredictedRank = async () => {
    const points = Number(creditsToSpend);
    if (!gig || isNaN(points) || points < 0) return;
    setPredictLoading(true);
    try {
      const { data } = await gigApi.getPredictedRank(gig.id, points);
      setPredictedRank(data);
    } catch {
      toast.error('Failed to fetch predicted rank');
      setPredictedRank(null);
    } finally {
      setPredictLoading(false);
    }
  };

  const handleBoost = async () => {
    const points = Number(creditsToSpend);
    if (!gig || isNaN(points) || points < 0) {
      toast.error('Please enter a valid number of points.');
      return;
    }

    setBoosting(true);
    try {
      await gigApi.boostGig(gig.id, { points });
      toast.success('Gig boosted successfully');
      await fetchGig();
      setPredictedRank(null);
      setCreditsToSpend('');
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Boost failed');
    } finally {
      setBoosting(false);
    }
  };

  const SkeletonLoader = () => (
    <div className="max-w-5xl mx-auto p-6 mt-24 mb-10 animate-pulse">
      <div className="h-48 bg-slate-200 rounded-3xl mb-8"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
           <div className="h-6 bg-slate-200 rounded w-3/4"></div>
           <div className="h-32 bg-slate-200 rounded"></div>
           <div className="h-32 bg-slate-200 rounded"></div>
        </div>
        <div className="h-64 bg-slate-200 rounded-3xl"></div>
      </div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <SkeletonLoader />
      <Footer />
    </div>
  );

  if (!gig) return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 mt-32 mb-10 text-center">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-12">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
             <AlertCircle className="text-rose-500 w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Gig Not Found</h2>
          <p className="text-slate-500 mb-8">The gig you're looking for doesn't exist or may have been removed.</p>
          <Link to="/teacher-dashboard" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition">
             Back to Dashboard
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Navbar />

      <main className="flex-grow max-w-6xl mx-auto w-full px-6 py-12 mt-20">

        {/* Header Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 mb-8 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-20 -mt-20 blur-3xl opacity-50"></div>

           <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                 {editing ? (
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="border border-slate-300 p-3 rounded-xl w-full text-2xl font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none mb-2"
                      placeholder="Gig Title"
                    />
                 ) : (
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                       {gig.subject || gig.title || 'Untitled Gig'}
                    </h1>
                 )}
                 <p className="text-slate-500 font-medium flex items-center gap-2">
                    <Briefcase className="w-4 h-4" /> Gig ID: {gig.id}
                 </p>
              </div>

              <div className="flex gap-3">
                 {editing ? (
                    <>
                       <button
                          onClick={handleSave}
                          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-lg shadow-emerald-200"
                       >
                          <Save className="w-4 h-4" /> Save
                       </button>
                       <button
                          onClick={() => setEditing(false)}
                          className="flex items-center gap-2 px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold transition"
                       >
                          <X className="w-4 h-4" /> Cancel
                       </button>
                    </>
                 ) : (
                    <button
                       onClick={() => setEditing(true)}
                       className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition shadow-lg shadow-indigo-200"
                    >
                       <Edit3 className="w-4 h-4" /> Edit Gig
                    </button>
                 )}
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

           {/* Left Column: Details */}
           <div className="lg:col-span-2 space-y-8">

              {/* Description */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                 <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <FileText className="text-indigo-600" /> Description
                 </h2>
                 {editing ? (
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full border border-slate-300 p-4 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none min-h-[150px]"
                      rows={6}
                    />
                 ) : (
                    <p className="text-slate-600 leading-relaxed whitespace-pre-line text-lg">
                      {gig.description || 'No description provided.'}
                    </p>
                 )}
              </div>

              {/* Attributes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <DetailCard
                    icon={<Phone className="text-indigo-600" />}
                    label="Phone"
                    name="phone"
                    value={gig.phone}
                    editing={editing}
                    formData={formData}
                    onChange={handleInputChange}
                 />
                 <DetailCard
                    icon={<Award className="text-indigo-600" />}
                    label="Education"
                    name="education"
                    value={gig.education}
                    editing={editing}
                    formData={formData}
                    onChange={handleInputChange}
                 />
                 <DetailCard
                    icon={<Briefcase className="text-indigo-600" />}
                    label="Experience"
                    name="experience"
                    value={gig.experience}
                    editing={editing}
                    formData={formData}
                    onChange={handleInputChange}
                 />
                 <DetailCard
                    icon={<Book className="text-indigo-600" />}
                    label="Fee Details"
                    name="fee_details"
                    value={gig.fee_details}
                    editing={editing}
                    formData={formData}
                    onChange={handleInputChange}
                 />
              </div>

           </div>

           {/* Right Column: Status & Boosting */}
           <div className="lg:col-span-1 space-y-8">

              {/* Status Card */}
              <div className={`rounded-3xl p-8 border ${
                 gig.subject_active
                    ? 'bg-emerald-50 border-emerald-100'
                    : 'bg-amber-50 border-amber-100'
              }`}>
                 <h3 className={`text-lg font-bold mb-2 flex items-center gap-2 ${
                    gig.subject_active ? 'text-emerald-800' : 'text-amber-800'
                 }`}>
                    {gig.subject_active ? (
                       <><TrendingUp className="w-5 h-5" /> Active & Live</>
                    ) : (
                       <><Clock className="w-5 h-5" /> Pending Approval</>
                    )}
                 </h3>
                 <p className={`text-sm ${
                    gig.subject_active ? 'text-emerald-600' : 'text-amber-600'
                 }`}>
                    {gig.subject_active
                       ? 'Your gig is live and visible to students.'
                       : 'This gig is waiting for admin approval.'}
                 </p>
              </div>

              {/* Rank Info */}
              {gig.subject_active && (
                 <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                       <TrendingUp className="text-indigo-600" /> Current Rank
                    </h3>

                    {rankLoading ? (
                       <div className="animate-pulse h-12 bg-slate-100 rounded-xl"></div>
                    ) : rankInfo ? (
                       <div className="text-center py-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                          <p className="text-indigo-900 text-sm font-semibold uppercase tracking-wide mb-1">Position</p>
                          <div className="text-4xl font-extrabold text-indigo-600 mb-2">
                             #{rankInfo.rank} <span className="text-base font-normal text-slate-500">of {rankInfo.total}</span>
                          </div>
                          <p className="text-slate-600 font-medium text-sm">in {rankInfo.subject}</p>
                       </div>
                    ) : (
                       <p className="text-slate-500 italic">No rank data available.</p>
                    )}
                 </div>
              )}

              {/* Boosting Panel */}
              {gig.subject_active && (
                 <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl shadow-xl text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-2xl"></div>

                    <button
                       onClick={() => setDropdownOpen(!dropdownOpen)}
                       className="w-full flex justify-between items-center p-8 focus:outline-none"
                    >
                       <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                             <Zap className="w-6 h-6 text-yellow-300 fill-current" />
                          </div>
                          <div className="text-left">
                             <h3 className="font-bold text-lg">Boost Visibility</h3>
                             <p className="text-indigo-200 text-sm">Get more students</p>
                          </div>
                       </div>
                       {dropdownOpen ? <ChevronUp /> : <ChevronDown />}
                    </button>

                    {dropdownOpen && (
                       <div className="px-8 pb-8 animate-fade-in">
                          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 mb-4">
                             <label className="text-sm font-medium text-indigo-200 mb-2 block">
                                Spend Points
                             </label>
                             <div className="flex gap-2">
                                <input
                                   type="number"
                                   min={0}
                                   value={creditsToSpend}
                                   onChange={(e) => setCreditsToSpend(e.target.value)}
                                   placeholder="0"
                                   className="w-full bg-white/20 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-white/50"
                                />
                                <button
                                   onClick={fetchPredictedRank}
                                   disabled={predictLoading}
                                   className="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-xl font-bold transition disabled:opacity-50 text-sm whitespace-nowrap"
                                >
                                   {predictLoading ? '...' : 'Predict'}
                                </button>
                             </div>
                          </div>

                          {predictedRank && (
                             <div className="mb-4 text-center bg-emerald-500/20 rounded-xl p-3 border border-emerald-500/30">
                                <p className="text-emerald-100 text-sm">Predicted Rank</p>
                                <p className="text-2xl font-bold text-white">#{predictedRank.predicted_rank}</p>
                             </div>
                          )}

                          <button
                             onClick={handleBoost}
                             disabled={boosting}
                             className="w-full bg-white text-indigo-600 hover:bg-indigo-50 px-6 py-3 rounded-xl font-bold transition disabled:opacity-70 shadow-lg"
                          >
                             {boosting ? 'Boosting...' : 'Boost Now'}
                          </button>
                       </div>
                    )}
                 </div>
              )}
           </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

const DetailCard = ({ icon, label, name, value, editing, formData, onChange }) => (
   <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-3 text-slate-500 font-semibold text-sm uppercase tracking-wider">
         {icon} {label}
      </div>
      {editing ? (
         <input
           type="text"
           name={name}
           value={formData[name] || ''}
           onChange={onChange}
           className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
         />
      ) : (
         <p className="text-slate-900 font-medium text-lg">{value || 'N/A'}</p>
      )}
   </div>
);

export default TutorGigPage;
