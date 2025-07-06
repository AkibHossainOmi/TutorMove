import React, { useEffect, useState } from 'react';
import TutorCard from '../components/TutorCard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';
import { subjectApi, tutorAPI } from '../utils/apiService';

const PAGE_SIZE = 12;

const TutorList = () => {
  const [tutors, setTutors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [premiumOnly, setPremiumOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch subjects separately
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await subjectApi.getSubjects();
        const list = Array.isArray(response.data)
          ? response.data
          : response.data?.results || [];
        setSubjects(list);
      } catch (err) {
        console.warn('Failed to load subjects, ignoring...', err);
        setSubjects([]);
      }
    };
    fetchSubjects();
  }, []);

  // Fetch locations separately
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/locations/`);
        setLocations(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.warn('Failed to load locations, ignoring...', err);
        setLocations([]);
      }
    };
    fetchLocations();
  }, []);

  // Fetch tutors based on available filters
  useEffect(() => {
  const fetchTutors = async () => {
    setLoading(true);
    setError(null);

    try {
      // const params = {
      //   page,
      //   page_size: PAGE_SIZE,
      //   ...(premiumOnly && { is_premium: true }),
      //   ...(selectedSubject && subjects.length > 0 ? { subject: selectedSubject } : {}),
      //   ...(selectedLocation && locations.length > 0 ? { location: selectedLocation } : {}),
      // };

      const res = await tutorAPI.getTutors();
      const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
      setTutors(page === 1 ? data : prev => [...prev, ...data]);
      setHasMore(data.length === PAGE_SIZE);
    } catch (err) {
      console.error('Failed to fetch tutors:', err);
      setError('Failed to fetch tutors. Please try again later.');
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  fetchTutors();
}, [page, premiumOnly, selectedSubject, selectedLocation, subjects.length, locations.length]);

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1);
    setTutors([]);
    setHasMore(true);
  }, [premiumOnly, selectedSubject, selectedLocation]);

  const resetFilters = () => {
    setSelectedSubject('');
    setSelectedLocation('');
    setPremiumOnly(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="h-24" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Find Your Perfect Tutor</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore our curated list of tutors and discover the right match for your learning needs.
          </p>
        </header>

        {/* Filters */}
        <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Subject Filter */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select
                  id="subject"
                  value={selectedSubject}
                  onChange={e => setSelectedSubject(e.target.value)}
                  disabled={subjects.length === 0}
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50"
                >
                  <option value="">All Subjects</option>
                  {subjects.map(sub => (
                    <option key={sub.id || sub} value={sub.name || sub}>
                      {sub.name || sub}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <select
                  id="location"
                  value={selectedLocation}
                  onChange={e => setSelectedLocation(e.target.value)}
                  disabled={locations.length === 0}
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50"
                >
                  <option value="">All Locations</option>
                  {locations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              {/* Premium Checkbox */}
              <div className="flex items-center mt-5">
                <input
                  type="checkbox"
                  id="premium-only"
                  checked={premiumOnly}
                  onChange={e => setPremiumOnly(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="premium-only" className="ml-2 text-sm text-gray-700">
                  Premium Tutors Only
                </label>
              </div>
            </div>

            <div className="flex items-end mt-2">
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </section>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded mb-8">{error}</div>
        )}

        {/* Tutors */}
        {!loading && !error && (
          tutors.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <h3 className="text-lg font-medium">No tutors found</h3>
              <p>Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tutors.map(tutor => (
                <TutorCard key={tutor.id} tutor={tutor} />
              ))}
            </div>
          )
        )}

        {/* Load More */}
        {hasMore && !loading && !error && (
          <div className="mt-12 text-center">
            <button
              onClick={() => setPage(p => p + 1)}
              className="px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-md shadow hover:bg-blue-700 transition"
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
