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

  // Skeleton loader component
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
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {gig.subject || gig.title || 'Untitled Gig'}
            </h1>
            <div className="flex items-center text-gray-500 text-sm">
              <span>Created: {new Date(gig.created_at).toLocaleDateString()}</span>
              <span className="mx-2">•</span>
              <span>Used Credits: {gig.used_credits}</span>
            </div>
          </div>

          {/* Gig Description */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Description</h2>
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">
              {gig.description || 'No description provided.'}
            </p>
          </div>

          {/* Tutor Message */}
          {gig.message && (
            <div className="p-6 border-b border-gray-100 bg-amber-50">
              <h2 className="text-lg font-semibold text-amber-800 mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Tutor Message
              </h2>
              <p className="text-amber-700 bg-amber-100 p-4 rounded-lg">{gig.message}</p>
            </div>
          )}

          {/* Gig Details */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Phone</h3>
                <p className="text-gray-900">{gig.phone || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Education</h3>
                <p className="text-gray-900">{gig.education || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Experience</h3>
                <p className="text-gray-900">{gig.experience || 'N/A'}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Fee Details</h3>
                <p className="text-gray-900">{gig.fee_details || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Subject</h3>
                <p className="text-gray-900">{gig.subject || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Current Rank */}
          <div className="p-6 border-t border-gray-100 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Current Gig Rank
            </h2>
            
            {rankLoading ? (
              <div className="flex items-center">
                <div className="h-4 w-4 bg-indigo-200 rounded-full mr-2 animate-pulse"></div>
                <span className="text-gray-500">Loading rank...</span>
              </div>
            ) : rankInfo ? (
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <p className="text-lg font-medium text-indigo-700">
                  Rank <span className="text-2xl font-bold">{rankInfo.rank}</span> of {rankInfo.total}
                </p>
                <p className="text-gray-600 mt-1">in <strong>{rankInfo.subject || 'N/A'}</strong></p>
              </div>
            ) : (
              <p className="text-gray-500">No rank data available.</p>
            )}
          </div>

          {/* Boost Section */}
          <div className="p-6 border-t border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Boost This Gig</h2>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-blue-700 text-sm">Spend credits to improve your gig's visibility and ranking in search results.</p>
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="credits" className="block text-sm font-medium text-gray-700 mb-2">
                Credits to Spend
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
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
                  className="flex-grow px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  disabled={boosting || predictLoading}
                  placeholder="Enter number of credits"
                />
                <button
                  onClick={fetchPredictedRank}
                  disabled={predictLoading || !creditsToSpend}
                  className="px-5 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {predictLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Calculating...
                    </>
                  ) : (
                    'See Predicted Rank'
                  )}
                </button>
              </div>
            </div>

            {predictedRank && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Predicted Rank: {predictedRank.predicted_rank} of {predictedRank.total} in{' '}
                  <strong>{predictedRank.subject || 'N/A'}</strong>
                </p>
              </div>
            )}

            <button
              onClick={handleBoost}
              disabled={boosting || !creditsToSpend}
              className={`w-full py-3 px-4 font-semibold rounded-lg transition flex items-center justify-center ${
                boosting || !creditsToSpend
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800'
              }`}
            >
              {boosting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Boosting...
                </>
              ) : (
                `Boost Gig (Cost: ${creditsToSpend || 0} credits)`
              )}
            </button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TutorGigPage;