import React, { useEffect, useState, useMemo } from "react";
import TutorCard from "../components/TutorCard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { tutorAPI } from "../utils/apiService";

const PAGE_SIZE = 8;
const SEARCH_DEBOUNCE_MS = 300;

const TutorList = () => {
  const [tutors, setTutors] = useState([]);
  const [filteredTutors, setFilteredTutors] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter states
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [sortBy, setSortBy] = useState("popular");

  // Filter options
  const subjects = ["Math", "Science", "English", "History", "Programming", "Languages"];
  const levels = ["Elementary", "Middle School", "High School", "College", "Professional"];
  const priceRanges = [
    { label: "Under $20", value: "0-20" },
    { label: "$20 - $50", value: "20-50" },
    { label: "$50 - $100", value: "50-100" },
    { label: "Over $100", value: "100+" }
  ];

  // Debounce searchInput => searchQuery
  useEffect(() => {
    const id = setTimeout(() => setSearchQuery(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  // Fetch tutors (pagination)
  useEffect(() => {
    let cancelled = false;
    const fetchTutors = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = { page, page_size: PAGE_SIZE };
        const res = await tutorAPI.getTutors(params);
        const data = Array.isArray(res.data) ? res.data : res.data.results || [];

        if (cancelled) return;

        setTutors(prev => (page === 1 ? data : [...prev, ...data]));
        setHasMore(data.length === PAGE_SIZE);
      } catch (err) {
        setError("Failed to fetch tutors. Please try again later.");
        setHasMore(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchTutors();
    return () => {
      cancelled = true;
    };
  }, [page]);

  // Reset page when component mounts or when user clears everything
  useEffect(() => {
    // when filters or search change we do client-side filtering
    // but if we want fresh server results on filter change, we would set page(1) & refetch
    // currently we keep server fetch independent and apply client-side filters
  }, []);

  // Apply filters + sorting (client-side)
  useEffect(() => {
    const byTextMatch = (tutor, q) => {
      if (!q) return true;
      const lower = q.toLowerCase();
      const name = (tutor.username || tutor.name || "").toLowerCase();
      const bio = (tutor.bio || tutor.description || "").toLowerCase();
      const subjString = (Array.isArray(tutor.subjects) ? tutor.subjects.join(" ") : tutor.subject || "").toLowerCase();
      return name.includes(lower) || bio.includes(lower) || subjString.includes(lower);
    };

    const bySubject = (tutor, subject) => {
      if (!subject) return true;
      const subj = subject.toLowerCase();
      if (Array.isArray(tutor.subjects)) {
        return tutor.subjects.some(s => (s || "").toLowerCase() === subj);
      }
      return (tutor.subject || "").toLowerCase() === subj;
    };

    const byLevel = (tutor, level) => {
      if (!level) return true;
      const lev = level.toLowerCase();
      if (Array.isArray(tutor.levels)) {
        return tutor.levels.some(l => (l || "").toLowerCase() === lev);
      }
      return (tutor.level || "").toLowerCase() === lev;
    };

    const byPriceRange = (tutor, rangeVal) => {
      if (!rangeVal) return true;
      const price = parseFloat(tutor.hourly_rate ?? tutor.price ?? tutor.rate ?? 0) || 0;
      if (rangeVal.endsWith("+")) {
        const min = parseFloat(rangeVal.replace("+", ""));
        return price >= min;
      }
      const parts = rangeVal.split("-");
      if (parts.length === 2) {
        const min = parseFloat(parts[0]) || 0;
        const max = parseFloat(parts[1]) || Infinity;
        return price >= min && price <= max;
      }
      return true;
    };

    let result = tutors.slice();

    // Apply each filter
    result = result.filter(t => byTextMatch(t, searchQuery));
    result = result.filter(t => bySubject(t, selectedSubject));
    result = result.filter(t => byLevel(t, selectedLevel));
    result = result.filter(t => byPriceRange(t, priceRange));

    // Sorting
    const safeNumber = (v) => (typeof v === "number" ? v : parseFloat(v) || 0);
    switch (sortBy) {
      case "rating":
        result.sort((a, b) => safeNumber(b.rating) - safeNumber(a.rating));
        break;
      case "newest":
        result.sort((a, b) => new Date(b.created_at || b.date_joined || 0) - new Date(a.created_at || a.date_joined || 0));
        break;
      case "price-low":
        result.sort((a, b) => safeNumber(a.hourly_rate ?? a.price ?? a.rate) - safeNumber(b.hourly_rate ?? b.price ?? b.rate));
        break;
      case "price-high":
        result.sort((a, b) => safeNumber(b.hourly_rate ?? b.price ?? b.rate) - safeNumber(a.hourly_rate ?? a.price ?? a.rate));
        break;
      case "popular":
      default:
        result.sort((a, b) => (b.students_count || 0) - (a.students_count || 0));
        break;
    }

    setFilteredTutors(result);
  }, [tutors, searchQuery, selectedSubject, selectedLevel, priceRange, sortBy]);

  const handleResetFilters = () => {
    setSearchInput("");
    setSearchQuery("");
    setSelectedSubject("");
    setSelectedLevel("");
    setPriceRange("");
    setSortBy("popular");
  };

  const activeFiltersCount = useMemo(() => {
    return [searchQuery, selectedSubject, selectedLevel, priceRange].filter(Boolean).length;
  }, [searchQuery, selectedSubject, selectedLevel, priceRange]);

  return (
    <>
      <Navbar />

      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
              <span className="text-sm font-semibold">500+ Expert Tutors Available</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
              Find Your Perfect
              <span className="block bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
                Tutor Match
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-8">
              Connect with certified experts tailored to your learning goals
            </p>

            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by subject, name, or keyword..."
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-b sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>

              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Levels</option>
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>

              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Prices</option>
                {priceRanges.map(range => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </select>

              {activeFiltersCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Reset ({activeFiltersCount})
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {!loading && !error && filteredTutors.length > 0 && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {filteredTutors.length} {filteredTutors.length === 1 ? 'Tutor' : 'Tutors'} Found
              </h2>
            </div>
          )}

          {loading && page === 1 && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
              <p className="text-gray-600">Loading tutors...</p>
            </div>
          )}

          {error && (
            <div className="max-w-xl mx-auto bg-white rounded-xl border border-red-200 p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Error</h3>
                  <p className="text-gray-600 mt-1">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && filteredTutors.length === 0 && (
            <div className="max-w-xl mx-auto bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No tutors found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your filters to see more results
              </p>
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset Filters
              </button>
            </div>
          )}

          {!loading && !error && filteredTutors.length > 0 && (
            <div className="space-y-4">
              {filteredTutors.map((tutor) => (
                <TutorCard key={tutor.id} tutor={tutor} />
              ))}
            </div>
          )}

          {hasMore && !loading && !error && filteredTutors.length > 0 && (
            <div className="mt-12 text-center">
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={loading}
                className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
              >
                Load More Tutors
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default TutorList;
