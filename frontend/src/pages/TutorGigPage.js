import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { gigApi } from '../utils/apiService';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

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
    const credits = Number(creditsToSpend);
    if (!gig || isNaN(credits) || credits < 0) return;
    setPredictLoading(true);
    try {
      const { data } = await gigApi.getPredictedRank(gig.id, credits);
      setPredictedRank(data);
    } catch {
      toast.error('Failed to fetch predicted rank');
      setPredictedRank(null);
    } finally {
      setPredictLoading(false);
    }
  };

  const handleBoost = async () => {
    const credits = Number(creditsToSpend);
    if (!gig || isNaN(credits) || credits < 0) {
      toast.error('Please enter a valid number of credits.');
      return;
    }

    setBoosting(true);
    try {
      await gigApi.boostGig(gig.id, { credits });
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
    <div className="max-w-4xl mx-auto p-6 mt-24 mb-10">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
        <div className="p-6 border-b border-gray-100">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
        <div className="p-6 bg-gray-50">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="flex space-x-4">
            <div className="h-10 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) return (
    <div>
      <Navbar />
      <SkeletonLoader />
      <Footer />
    </div>
  );

  if (!gig) return (
    <div>
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 mt-24 mb-10">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Gig Not Found</h2>
          <p className="text-gray-600">The gig you're looking for doesn't exist or may have been removed.</p>
        </div>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-4xl mx-auto w-full p-4 mt-20 mb-10">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">

          {/* Gig Header */}
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {editing ? (
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="border p-2 rounded w-full text-2xl font-bold"
                />
              ) : (
                gig.subject || gig.title || 'Untitled Gig'
              )}
            </h1>
            <button
              onClick={() => setEditing(!editing)}
              className="bg-indigo-500 text-white px-4 py-2 rounded"
            >
              {editing ? 'Cancel' : 'Edit Gig'}
            </button>
          </div>

          {/* Gig Description / Edit Form */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Description</h2>
            {editing ? (
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full border p-2 rounded"
                rows={5}
              />
            ) : (
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {gig.description || 'No description provided.'}
              </p>
            )}
          </div>

          {/* Gig Details / Edit Form */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {['phone', 'education', 'experience', 'fee_details', 'subject'].map(field => (
              <div key={field}>
                <h3 className="text-sm font-medium text-gray-500 mb-1">{field.replace('_', ' ').toUpperCase()}</h3>
                {editing ? (
                  <input
                    type="text"
                    name={field}
                    value={formData[field] || ''}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded"
                  />
                ) : (
                  <p className="text-gray-900">{gig[field] || 'N/A'}</p>
                )}
              </div>
            ))}
          </div>

          {editing && (
            <div className="p-6 border-t border-gray-100 flex justify-end">
              <button
                onClick={handleSave}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Save Changes
              </button>
            </div>
          )}

          {/* Current Rank & Boost Section */}
          {gig.subject_active ? (
            <>
              <div className="p-6 border-t border-gray-100 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  Current Gig Rank
                </h2>
                {rankLoading ? (
                  <p className="text-gray-500">Loading rank...</p>
                ) : rankInfo ? (
                  <p className="text-indigo-700 text-lg font-medium">
                    Rank <span className="text-2xl font-bold">{rankInfo.rank}</span> of {rankInfo.total} in <strong>{rankInfo.subject}</strong>
                  </p>
                ) : (
                  <p className="text-gray-500">No rank data available.</p>
                )}
              </div>

              {/* Boost Section */}
              <div className="p-6 border-t border-gray-100">
                <div className="flex items-center space-x-2 mb-2">
                  <input
                    type="number"
                    min={0}
                    value={creditsToSpend}
                    onChange={(e) => setCreditsToSpend(e.target.value)}
                    placeholder="Credits to spend"
                    className="border p-2 rounded w-32"
                  />
                  <button
                    onClick={fetchPredictedRank}
                    disabled={predictLoading}
                    className="bg-indigo-500 text-white px-4 py-2 rounded"
                  >
                    {predictLoading ? 'Calculating...' : 'Predict Rank'}
                  </button>
                </div>
                {predictedRank && (
                  <p className="text-gray-700">
                    Predicted Rank: <strong>{predictedRank.predicted_rank}</strong> of {predictedRank.total}
                  </p>
                )}
                <button
                  onClick={handleBoost}
                  disabled={boosting}
                  className="mt-2 bg-green-500 text-white px-4 py-2 rounded"
                >
                  {boosting ? 'Boosting...' : 'Boost Gig'}
                </button>
              </div>
            </>
          ) : (
            <div className="p-6 border-t border-gray-100 bg-yellow-50 text-yellow-800 rounded-lg text-center">
              <p className="font-semibold">Pending</p>
              <p className="text-sm">This gig is not yet active. Boost and rank info will be available once approved.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TutorGigPage;
