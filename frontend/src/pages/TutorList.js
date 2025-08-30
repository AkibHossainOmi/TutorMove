import React, { useEffect, useState } from 'react';
import TutorCard from '../components/TutorCard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';
import { subjectApi, tutorAPI } from '../utils/apiService';

const PAGE_SIZE = 8;

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
  const [filtersVisible, setFiltersVisible] = useState(true);

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
        const params = {
          page,
          page_size: PAGE_SIZE,
          ...(selectedSubject && { subject: selectedSubject }),
          ...(selectedLocation && { location: selectedLocation }),
          ...(premiumOnly && { premium: true })
        };
        
        const res = await tutorAPI.getTutors(params);
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
  }, [page, premiumOnly, selectedSubject, selectedLocation]);

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

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-16 md:py-20 text-center">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-md">
            Discover Expert Tutors
          </h1>
          <p className="text-lg md:text-xl mb-6 opacity-95 max-w-2xl mx-auto">
            Connect with qualified tutors tailored to your learning goals and schedule
          </p>
          <button 
            onClick={() => setFiltersVisible(!filtersVisible)}
            className="bg-white text-indigo-700 font-semibold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center mx-auto"
          >
            {filtersVisible ? 'Hide Filters' : 'Show Filters'} 
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ml-2 transition-transform ${filtersVisible ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 -mt-10 md:-mt-16 relative z-10">
        {/* Filters Section */}
        <section className={`bg-white rounded-2xl shadow-lg p-6 mb-8 transition-all duration-300 ${filtersVisible ? 'block' : 'hidden'}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-800">Filter Tutors</h2>
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Reset Filters
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <div className="relative">
                <select
                  id="subject"
                  value={selectedSubject}
                  onChange={e => setSelectedSubject(e.target.value)}
                  disabled={subjects.length === 0}
                  className="w-full py-3 px-4 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
                >
                  <option value="">All Subjects</option>
                  {subjects.map(sub => (
                    <option key={sub.id || sub} value={sub.name || sub}>{sub.name || sub}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <div className="relative">
                <select
                  id="location"
                  value={selectedLocation}
                  onChange={e => setSelectedLocation(e.target.value)}
                  disabled={locations.length === 0}
                  className="w-full py-3 px-4 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
                >
                  <option value="">All Locations</option>
                  {locations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-start md:justify-end">
              <div className="flex items-center h-12 bg-gray-50 rounded-lg px-4 border border-gray-200">
                <input
                  type="checkbox"
                  id="premium-only"
                  checked={premiumOnly}
                  onChange={e => setPremiumOnly(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="premium-only" className="ml-2 text-sm font-medium text-gray-700">Premium Tutors Only</label>
              </div>
            </div>
          </div>
        </section>

        {/* Active Filters Display */}
        {(selectedSubject || selectedLocation || premiumOnly) && (
          <div className="bg-blue-50 rounded-lg p-4 mb-8 flex flex-wrap items-center">
            <span className="text-sm font-medium text-gray-700 mr-3">Active filters:</span>
            {selectedSubject && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full mr-2 mb-2 flex items-center">
                Subject: {selectedSubject}
                <button 
                  onClick={() => setSelectedSubject('')}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            )}
            {selectedLocation && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full mr-2 mb-2 flex items-center">
                Location: {selectedLocation}
                <button 
                  onClick={() => setSelectedLocation('')}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            )}
            {premiumOnly && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full mr-2 mb-2 flex items-center">
                Premium Only
                <button 
                  onClick={() => setPremiumOnly(false)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="flex flex-col items-center">
              <div className="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full mb-4" />
              <p className="text-gray-600">Loading tutors...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-8">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Tutors */}
        {!loading && !error && (
          tutors.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tutors found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search filters</p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">
                  Available Tutors <span className="text-indigo-600">({tutors.length})</span>
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tutors.map(tutor => (
                  <TutorCard key={tutor.id} tutor={tutor} />
                ))}
              </div>
            </>
          )
        )}

        {/* Load More */}
        {hasMore && !loading && !error && tutors.length > 0 && (
          <div className="mt-12 text-center">
            <button
              onClick={() => setPage(p => p + 1)}
              className="px-8 py-3 text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-md hover:from-indigo-700 hover:to-purple-700 transition transform hover:-translate-y-1"
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