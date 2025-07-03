import React, { useEffect, useState } from 'react';
import TutorCard from '../components/TutorCard';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PAGE_SIZE = 12;

const TutorList = () => {
  const [tutors, setTutors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [premiumOnly, setPremiumOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch subjects and locations
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/subjects/`)
      .then(res => setSubjects(res.data))
      .catch(() => setSubjects([]));

    axios.get(`${process.env.REACT_APP_API_URL}/api/locations/`)
      .then(res => setLocations(res.data))
      .catch(() => setLocations([]));
  }, []);

  // Fetch tutors with filters
  useEffect(() => {
    setLoading(true);
    setError(null);

    let url = `${process.env.REACT_APP_API_URL}/api/tutors/?page=${page}&page_size=${PAGE_SIZE}`;
    if (premiumOnly) url += '&is_premium=true';
    if (selectedSubject) url += `&subject=${encodeURIComponent(selectedSubject)}`;
    if (selectedLocation) url += `&location=${encodeURIComponent(selectedLocation)}`;

    axios.get(url)
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
        setTutors(prev => page === 1 ? data : [...prev, ...data]);
        setHasMore(data.length === PAGE_SIZE);
      })
      .catch(err => {
        console.error("Failed to fetch tutors:", err);
        setError('Failed to fetch tutors. Please try again later.');
        setHasMore(false);
      })
      .finally(() => setLoading(false));
  }, [premiumOnly, selectedSubject, selectedLocation, page]);

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1);
    setTutors([]);
    setHasMore(true);
  }, [premiumOnly, selectedSubject, selectedLocation]);

  const featuredTutors = tutors.filter(t => t.is_premium);
  const regularTutors = tutors.filter(t => !t.is_premium);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="h-24"></div> {/* Spacer for navbar */}
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-center text-gray-900 mb-4">
            Find Your Perfect Tutor
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Explore our curated list of tutors and discover the right match for your learning needs.
            </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-10 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Subject Filter */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <div className="relative">
                  <select
                    id="subject"
                    value={selectedSubject}
                    onChange={e => setSelectedSubject(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg bg-white border shadow-sm"
                  >
                    <option value="">All Subjects</option>
                    {subjects.map(sub => (
                      <option key={sub.id || sub} value={sub.name || sub}>
                        {sub.name || sub}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location Filter */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <div className="relative">
                  <select
                    id="location"
                    value={selectedLocation}
                    onChange={e => setSelectedLocation(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg bg-white border shadow-sm"
                  >
                    <option value="">All Locations</option>
                    {locations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Premium Filter */}
              <div className="flex items-center mt-5">
                <div className="flex items-center h-5">
                  <input
                    id="premium-only"
                    type="checkbox"
                    checked={premiumOnly}
                    onChange={e => setPremiumOnly(e.target.checked)}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <label htmlFor="premium-only" className="ml-2 block text-sm text-gray-700">
                  Premium Tutors Only
                </label>
              </div>
            </div>

            <div className="flex items-end mt-2">
              <button
                onClick={() => {
                  setSelectedSubject('');
                  setSelectedLocation('');
                  setPremiumOnly(false);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Featured Tutors Section */}
        {!loading && !error && !premiumOnly && featuredTutors.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <svg className="w-6 h-6 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Featured Tutors
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredTutors.map(tutor => (
                <TutorCard key={tutor.id} tutor={tutor} featured />
              ))}
            </div>
          </div>
        )}

        {/* Main Tutors List */}
        {!loading && !error && (
          <div>
            {tutors.length === 0 && !loading && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No tutors found</h3>
                <p className="mt-1 text-gray-500">Try adjusting your search filters</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {(premiumOnly ? featuredTutors : regularTutors).map(tutor => (
                <TutorCard key={tutor.id} tutor={tutor} />
              ))}
            </div>
          </div>
        )}

        {/* Load More Button */}
        {hasMore && !loading && !error && (
          <div className="mt-12 text-center">
            <button
              onClick={() => setPage(p => p + 1)}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Load More Tutors
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default TutorList;