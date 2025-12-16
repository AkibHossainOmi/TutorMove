import React, { useEffect, useState, useMemo } from "react";
import TutorCard from "../components/TutorCard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Pagination from "../components/Pagination";
import { tutorAPI } from "../utils/apiService";
import { FiSearch, FiFilter, FiRefreshCw, FiAlertCircle } from "react-icons/fi";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 500;

const TutorList = () => {
  const [tutors, setTutors] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter states
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedLevel, setSelectedLevel] = useState(""); // Kept for UI consistency, but server filtering might not support it yet
  const [priceRange, setPriceRange] = useState(""); // Kept for UI
  const [sortBy, setSortBy] = useState("newest"); // 'popular' is default in UI, but backend defaults to date

  // Filter options
  const subjects = ["Math", "Science", "English", "History", "Programming", "Languages", "Physics", "Chemistry", "Biology"];
  const levels = ["Elementary", "Middle School", "High School", "College", "Professional"];
  const priceRanges = [
    { label: "Under $20", value: "0-20" },
    { label: "$20 - $50", value: "20-50" },
    { label: "$50 - $100", value: "50-100" },
    { label: "Over $100", value: "100+" }
  ];

  // Debounce searchInput => searchQuery
  useEffect(() => {
    const id = setTimeout(() => {
        setSearchQuery(searchInput.trim());
        setCurrentPage(1); // Reset to page 1 on search
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSubject, selectedLevel, priceRange, sortBy]);

  // Fetch tutors (Server-side pagination)
  useEffect(() => {
    let cancelled = false;
    const fetchTutors = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = { 
            page: currentPage, 
            page_size: PAGE_SIZE,
            search: searchQuery,
            subject: selectedSubject,
            // level: selectedLevel, // Uncomment when backend supports it
            // price_range: priceRange, // Uncomment when backend supports it
            // ordering: sortBy === 'newest' ? '-date_joined' : undefined // Basic ordering mapping
        };

        const res = await tutorAPI.getTutors(params);
        
        if (cancelled) return;

        // Handle Paginated Response
        if (res.data && res.data.results) {
            setTutors(res.data.results);
            const totalCount = res.data.count || 0;
            setTotalPages(Math.ceil(totalCount / PAGE_SIZE));
        } else if (Array.isArray(res.data)) {
            // Fallback for non-paginated response (shouldn't happen with new backend)
            setTutors(res.data);
            setTotalPages(1);
        } else {
            setTutors([]);
            setTotalPages(0);
        }

      } catch (err) {
        if (!cancelled) {
            console.error("Fetch error:", err);
            setError("Failed to fetch tutors. Please try again later.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchTutors();
    return () => {
      cancelled = true;
    };
  }, [currentPage, searchQuery, selectedSubject, selectedLevel, priceRange, sortBy]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setSearchQuery("");
    setSelectedSubject("");
    setSelectedLevel("");
    setPriceRange("");
    setSortBy("newest");
    setCurrentPage(1);
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

              {/* Note: Level and Price filters are currently UI-only placeholders until backend support is added */}
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
                <option value="newest">Newest</option>
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full -mt-2">
        {!loading && !error && tutors.length > 0 && (
          <div className="mb-6 flex items-center justify-between">
             <p className="text-slate-500 text-sm font-semibold">
               Showing page <span className="text-slate-900">{currentPage}</span> of <span className="text-slate-900">{totalPages}</span>
             </p>
          </div>
        )}

        {loading && (
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

        {!loading && !error && tutors.length === 0 && (
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
          {tutors.map((tutor) => (
            <TutorCard key={tutor.id} tutor={tutor} />
          ))}
        </div>

        {!loading && !error && tutors.length > 0 && (
            <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
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