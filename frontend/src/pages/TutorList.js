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

      {/* Enhanced Hero Section */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-sky-500 to-purple-600 text-white py-24 text-center overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-4xl mx-auto px-6">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 drop-shadow-lg bg-gradient-to-r from-white to-indigo-100 bg-clip-text text-transparent">
            Find Your Perfect Tutor
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-white/90 font-light max-w-2xl mx-auto leading-relaxed">
            Connect with certified experts who will help you achieve your academic goals
          </p>
          
          {/* Stats Bar */}
          <div className="mt-12 flex flex-wrap justify-center gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">500+</div>
              <div className="text-white/70 text-sm font-medium">Expert Tutors</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">50+</div>
              <div className="text-white/70 text-sm font-medium">Subjects</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">98%</div>
              <div className="text-white/70 text-sm font-medium">Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Main Content */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 py-16">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header with enhanced styling */}
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-sm border border-gray-200">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
              <h2 className="text-2xl font-bold text-gray-900">
                Available Tutors
                <span className="text-indigo-600 ml-2">({tutors.length})</span>
              </h2>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="relative">
                <div className="animate-spin h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full" />
                <div className="absolute inset-0 animate-ping h-16 w-16 border-4 border-indigo-100 rounded-full" />
              </div>
              <p className="text-gray-600 font-medium">Loading expert tutors...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="mb-8 rounded-2xl border border-red-200 bg-red-50/50 backdrop-blur-sm px-8 py-6 text-center">
              <div className="inline-flex items-center gap-3 text-red-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold">{error}</span>
              </div>
            </div>
          )}

          {/* Tutors Grid - Single Column Layout */}
          {!loading && !error && (
            <>
              {tutors.length === 0 ? (
                <div className="text-center py-20 rounded-3xl bg-white/80 backdrop-blur-sm shadow-xl border border-gray-200">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No tutors available</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    We're working on adding more expert tutors to our platform. Please check back soon.
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {tutors.map((tutor) => (
                    <div 
                      key={tutor.id} 
                      className="transform transition-all duration-300 hover:scale-[1.02]"
                    >
                      <TutorCard tutor={tutor} />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Enhanced Load More Button */}
          {hasMore && !loading && !error && tutors.length > 0 && (
            <div className="mt-16 text-center">
              <button
                onClick={() => setPage((p) => p + 1)}
                className="group relative inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-10 py-4 text-lg font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:from-indigo-700 hover:to-purple-700 transform hover:-translate-y-1"
              >
                <span>Load More Tutors</span>
                <svg 
                  className="w-5 h-5 transition-transform group-hover:translate-y-0.5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                
                {/* Animated background effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
              
              <p className="mt-4 text-gray-600 text-sm">
                Showing {tutors.length} tutors • Keep exploring to find your perfect match
              </p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default TutorList;