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

  if (loading) return <p className="p-6 text-center text-gray-600">Loading gig details...</p>;
  if (!gig) return <p className="p-6 text-center text-red-600">Gig not found.</p>;

  return (
    <div>
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg mt-24 mb-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {gig.subject || gig.title || 'Untitled Gig'}
        </h1>

        <p className="text-gray-700 mb-6 whitespace-pre-line">
          {gig.description || 'No description provided.'}
        </p>

        {gig.message && (
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded">
            <p className="text-sm text-gray-600">Tutor Message:</p>
            <p className="text-gray-800 font-medium">{gig.message}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <p><span className="font-semibold text-gray-800">Phone:</span> {gig.phone || 'N/A'}</p>
            <p><span className="font-semibold text-gray-800">Education:</span> {gig.education || 'N/A'}</p>
            <p><span className="font-semibold text-gray-800">Experience:</span> {gig.experience || 'N/A'}</p>
          </div>
          <div className="space-y-2">
            <p><span className="font-semibold text-gray-800">Fee:</span> {gig.fee_details || 'N/A'}</p>
            <p><span className="font-semibold text-gray-800">Created:</span> {new Date(gig.created_at).toLocaleDateString()}</p>
            <p><span className="font-semibold text-gray-800">Used Credits:</span> {gig.used_credits}</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Current Gig Rank</h2>
          {rankLoading ? (
            <p className="text-gray-500">Loading rank...</p>
          ) : rankInfo ? (
            <p className="text-indigo-600 font-medium">
              Rank {rankInfo.rank} of {rankInfo.total} in <strong>{rankInfo.subject || 'N/A'}</strong>
            </p>
          ) : (
            <p className="text-gray-500">No rank data available.</p>
          )}
        </div>

        <div className="mb-6">
          <label htmlFor="credits" className="block font-medium text-gray-700 mb-1">
            Credits to Spend
          </label>
          <div className="flex items-center gap-3">
            <input
              id="credits"
              type="number"
              min={0}
              value={creditsToSpend}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d*$/.test(val)) {
                  setCreditsToSpend(val);
                  setPredictedRank(null);
                }
              }}
              className="w-30 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={boosting || predictLoading}
              placeholder="Enter credits"
            />
            <button
              onClick={fetchPredictedRank}
              disabled={predictLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              {predictLoading ? 'Checking...' : 'See Predicted Rank'}
            </button>
          </div>
        </div>

        {predictedRank && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
            <p className="text-gray-800 font-medium">
              Predicted Rank: {predictedRank.predicted_rank} of {predictedRank.total} in{' '}
              <strong>{predictedRank.subject || 'N/A'}</strong>
            </p>
          </div>
        )}

        <button
          onClick={handleBoost}
          disabled={boosting}
          className={`w-full py-3 font-semibold text-white rounded transition ${
            boosting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {boosting ? 'Boosting...' : `Boost Gig (Cost: ${creditsToSpend || 0} credits)`}
        </button>
      </div>
      <Footer />
    </div>
  );
};

export default TutorGigPage;
