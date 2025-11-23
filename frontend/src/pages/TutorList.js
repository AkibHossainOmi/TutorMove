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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-white border-b border-gray-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Find Your Perfect <span className="text-indigo-600">Tutor</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
            Connect with certified experts tailored to your learning goals.
          </p>

          <div className="max-w-xl mx-auto relative">
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
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-shadow"
            />
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto hide-scrollbar">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>

              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Levels</option>
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>

              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Prices</option>
                {priceRanges.map(range => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </select>

              {activeFiltersCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="px-3 py-2 text-sm text-indigo-600 font-medium hover:text-indigo-800 whitespace-nowrap"
                >
                  Reset Filters
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <span className="text-sm text-gray-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 text-sm rounded-lg border-none bg-gray-50 text-gray-700 font-medium hover:bg-gray-100 focus:ring-0 cursor-pointer"
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

      {/* Results Section */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {!loading && !error && filteredTutors.length > 0 && (
          <div className="mb-6 text-gray-500 text-sm font-medium">
            Showing {filteredTutors.length} results
          </div>
        )}

        {loading && page === 1 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
            <p className="text-gray-500 text-sm">Finding best tutors for you...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-lg mx-auto mt-8">
            <svg className="w-12 h-12 text-red-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-medium text-red-800 mb-1">Something went wrong</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && filteredTutors.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center max-w-lg mx-auto mt-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No tutors found</h3>
            <p className="text-gray-500 mb-6">We couldn't find any tutors matching your search criteria.</p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
            >
              Clear all filters
            </button>
          </div>
        )}

        <div className="grid gap-6">
          {filteredTutors.map((tutor) => (
            <TutorCard key={tutor.id} tutor={tutor} />
          ))}
        </div>

        {hasMore && !loading && !error && filteredTutors.length > 0 && (
          <div className="mt-10 text-center">
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={loading}
              className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:text-gray-900 transition shadow-sm"
            >
              {loading ? "Loading..." : "Load More Tutors"}
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default TutorList;