import React, { useEffect, useState, useMemo } from "react";
import TutorCard from "../components/TutorCard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { tutorAPI } from "../utils/apiService";
import { FiSearch, FiFilter, FiRefreshCw, FiAlertCircle } from "react-icons/fi";

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
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
      <Navbar />

      {/* Hero Section */}
      <div className="relative bg-indigo-900 text-white pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900 opacity-90"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-violet-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        <div className="relative max-w-6xl mx-auto px-6 text-center z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            Find Your Perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-violet-200">Tutor</span>
          </h1>
          <p className="text-lg md:text-xl text-indigo-100 max-w-2xl mx-auto mb-10">
             Connect with certified experts tailored to your specific learning goals and schedule.
          </p>

          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all shadow-lg"
              placeholder="Search by subject, name, or keyword..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto hide-scrollbar">
              <FilterSelect
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                options={subjects}
                placeholder="All Subjects"
              />

              <FilterSelect
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                options={levels}
                placeholder="All Levels"
              />

              <FilterSelect
                 value={priceRange}
                 onChange={(e) => setPriceRange(e.target.value)}
                 options={priceRanges}
                 placeholder="All Prices"
                 isObjectOptions={true}
              />

              {activeFiltersCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-indigo-600 font-bold hover:text-indigo-800 whitespace-nowrap bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <FiRefreshCw className="w-3 h-3" /> Reset
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <span className="text-sm font-medium text-slate-500 hidden md:inline">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold hover:bg-white hover:border-indigo-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer transition-all"
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
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full -mt-2">
        {!loading && !error && filteredTutors.length > 0 && (
          <div className="mb-6 flex items-center justify-between">
             <p className="text-slate-500 text-sm font-semibold">
               Showing <span className="text-slate-900">{filteredTutors.length}</span> results
             </p>
          </div>
        )}

        {loading && page === 1 && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-6" />
            <p className="text-slate-500 font-medium">Finding best tutors for you...</p>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center max-w-lg mx-auto mt-12">
            <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiAlertCircle size={32} />
            </div>
            <h3 className="text-lg font-bold text-rose-800 mb-2">Something went wrong</h3>
            <p className="text-rose-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition shadow-lg shadow-rose-200"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && filteredTutors.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center max-w-lg mx-auto mt-12 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiSearch className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No tutors found</h3>
            <p className="text-slate-500 mb-8 max-w-xs mx-auto">We couldn't find any tutors matching your search criteria. Try adjusting your filters.</p>
            <button
              onClick={handleResetFilters}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
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
          <div className="mt-12 text-center pb-8">
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={loading}
              className="px-8 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-600 transition shadow-sm"
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

const FilterSelect = ({ value, onChange, options, placeholder, isObjectOptions = false }) => (
  <div className="relative group">
    <select
      value={value}
      onChange={onChange}
      className="appearance-none pl-4 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-700 font-medium hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer shadow-sm"
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        isObjectOptions ? (
           <option key={opt.value} value={opt.value}>{opt.label}</option>
        ) : (
           <option key={opt} value={opt}>{opt}</option>
        )
      ))}
    </select>
    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-400 group-hover:text-indigo-500">
      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd" />
      </svg>
    </div>
  </div>
);

export default TutorList;
