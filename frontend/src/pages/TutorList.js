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

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await subjectApi.getSubjects();
        const list = Array.isArray(response.data)
          ? response.data
          : response.data?.results || [];
        setSubjects(list);
      } catch {
        setSubjects([]);
      }
    };
    fetchSubjects();
  }, []);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/locations/`);
        setLocations(Array.isArray(res.data) ? res.data : []);
      } catch {
        setLocations([]);
      }
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    const fetchTutors = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await tutorAPI.getTutors();
        const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
        setTutors(page === 1 ? data : prev => [...prev, ...data]);
        setHasMore(data.length === PAGE_SIZE);
      } catch {
        setError('Failed to fetch tutors. Please try again later.');
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };
    fetchTutors();
  }, [page, premiumOnly, selectedSubject, selectedLocation, subjects.length, locations.length]);

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

      {/* Hero */}
      <section className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-20 text-center shadow-lg">
        <h1 className="text-5xl md:text-6xl font-extrabold drop-shadow-lg">
          Find Your Perfect Tutor
        </h1>
        <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto drop-shadow">
          Explore our curated list of tutors and discover the right match for your learning needs.
        </p>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 -mt-16 relative z-10">
        {/* Filters */}
        <section className="bg-white rounded-3xl shadow-xl p-6 mb-12 border border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
              <select
                id="subject"
                value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value)}
                disabled={subjects.length === 0}
                className="w-full py-2 px-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition"
              >
                <option value="">All Subjects</option>
                {subjects.map(sub => (
                  <option key={sub.id || sub} value={sub.name || sub}>{sub.name || sub}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
              <select
                id="location"
                value={selectedLocation}
                onChange={e => setSelectedLocation(e.target.value)}
                disabled={locations.length === 0}
                className="w-full py-2 px-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition"
              >
                <option value="">All Locations</option>
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center mt-5 md:mt-0">
              <input
                type="checkbox"
                id="premium-only"
                checked={premiumOnly}
                onChange={e => setPremiumOnly(e.target.checked)}
                className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="premium-only" className="ml-2 text-sm font-medium text-gray-700">Premium Tutors Only</label>
            </div>
          </div>

          <div className="flex items-end md:mt-0 mt-4">
            <button
              onClick={resetFilters}
              className="px-5 py-2 text-sm font-medium text-indigo-600 bg-indigo-100 hover:bg-indigo-200 rounded-xl transition"
            >
              Reset Filters
            </button>
          </div>
        </section>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded mb-8 text-center">{error}</div>
        )}

        {/* Tutors */}
        {!loading && !error && (
          tutors.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <h3 className="text-lg font-medium">No tutors found</h3>
              <p>Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
              className="px-8 py-3 text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-500 rounded-2xl shadow-lg hover:from-indigo-700 hover:to-blue-600 transition"
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
