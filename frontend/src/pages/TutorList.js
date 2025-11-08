import React, { useEffect, useState } from "react";
import TutorCard from "../components/TutorCard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { tutorAPI } from "../utils/apiService";

const PAGE_SIZE = 8;

const TutorList = () => {
  const [tutors, setTutors] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTutors = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = { page, page_size: PAGE_SIZE };
        const res = await tutorAPI.getTutors(params);
        const data = Array.isArray(res.data)
          ? res.data
          : res.data.results || [];
        setTutors((prev) => (page === 1 ? data : [...prev, ...data]));
        setHasMore(data.length === PAGE_SIZE);
      } catch {
        setError("Failed to fetch tutors. Please try again later.");
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };
    fetchTutors();
  }, [page]);

  return (
    <>
      <Navbar />

      {/* Modern Hero Section with Animated Background */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
        </div>

        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
              <span className="text-sm font-semibold text-white">500+ Expert Tutors Available</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="block">Find Your Perfect</span>
              <span className="block bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 bg-clip-text text-transparent">
                Tutor Match
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-12 leading-relaxed">
              Connect with certified experts tailored to your learning style and academic goals
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-12">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by subject, level, or tutor name..."
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/95 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/30 transition-all shadow-2xl"
                />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-white/20">
                <div className="text-3xl md:text-4xl font-bold mb-2">500+</div>
                <div className="text-white/80 text-sm md:text-base font-medium">Expert Tutors</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-white/20">
                <div className="text-3xl md:text-4xl font-bold mb-2">50+</div>
                <div className="text-white/80 text-sm md:text-base font-medium">Subjects</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-white/20">
                <div className="text-3xl md:text-4xl font-bold mb-2">10k+</div>
                <div className="text-white/80 text-sm md:text-base font-medium">Students</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-white/20">
                <div className="text-3xl md:text-4xl font-bold mb-2">98%</div>
                <div className="text-white/80 text-sm md:text-base font-medium">Success Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="white"/>
          </svg>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 font-medium hover:bg-indigo-100 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                Subject
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                Level
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                Price Range
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select className="px-3 py-2 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors">
                <option>Most Popular</option>
                <option>Highest Rated</option>
                <option>Newest</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Header */}
          {!loading && !error && tutors.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Available Tutors
                  <span className="ml-2 text-lg font-normal text-gray-600">
                    ({tutors.length} {tutors.length === 1 ? 'tutor' : 'tutors'} found)
                  </span>
                </h2>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg border border-gray-300 hover:bg-white transition-colors">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <button className="p-2 rounded-lg border border-gray-300 hover:bg-white transition-colors">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="relative mb-6">
                <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-purple-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Finding the best tutors for you...</h3>
              <p className="text-gray-600">This will only take a moment</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl border border-red-200 shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 border-b border-red-200">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-red-900">Something went wrong</h3>
                      <p className="text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-white">
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && tutors.length === 0 && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">No tutors found</h3>
                <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                  We couldn't find any tutors matching your criteria. Try adjusting your filters or check back later.
                </p>
                <button className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset Filters
                </button>
              </div>
            </div>
          )}

          {/* Tutors Grid */}
          {!loading && !error && tutors.length > 0 && (
            <div className="space-y-6">
              {tutors.map((tutor) => (
                <div 
                  key={tutor.id} 
                  className="transform transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl"
                >
                  <TutorCard tutor={tutor} />
                </div>
              ))}
            </div>
          )}

          {/* Load More Button */}
          {hasMore && !loading && !error && tutors.length > 0 && (
            <div className="mt-12 text-center">
              <button
                onClick={() => setPage((p) => p + 1)}
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:from-indigo-700 hover:to-purple-700 transform hover:-translate-y-1 overflow-hidden"
              >
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                
                <span className="relative">Load More Tutors</span>
                <svg 
                  className="relative w-5 h-5 transition-transform group-hover:translate-y-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
              
              <p className="mt-4 text-gray-600">
                Viewing {tutors.length} of many expert tutors
              </p>
            </div>
          )}

          {/* Call to Action Section */}
          {!loading && !error && tutors.length > 0 && (
            <div className="mt-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-8 md:p-12 text-white text-center shadow-2xl">
              <h3 className="text-3xl md:text-4xl font-bold mb-4">Can't find the perfect tutor?</h3>
              <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Let us help you find the ideal match for your learning needs. Our team will personally recommend the best tutors for you.
              </p>
              <button className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg">
                Get Personalized Recommendations
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>
    </>
  );
};

export default TutorList;