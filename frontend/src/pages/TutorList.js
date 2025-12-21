// src/pages/TutorList.js
import React, { useEffect, useState, useMemo } from "react";
import TutorCard from "../components/TutorCard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Pagination from "../components/Pagination";
import { tutorAPI } from "../utils/apiService";
import { Search, SlidersHorizontal, RefreshCw, AlertCircle, X, ChevronDown } from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

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
  const [selectedLevel, setSelectedLevel] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [sortBy, setSortBy] = useState("newest");

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
        setCurrentPage(1);
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
        };

        const res = await tutorAPI.getTutors(params);
        
        if (cancelled) return;

        if (res.data && res.data.results) {
            setTutors(res.data.results);
            const totalCount = res.data.count || 0;
            setTotalPages(Math.ceil(totalCount / PAGE_SIZE));
        } else if (Array.isArray(res.data)) {
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
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-dark-bg font-sans text-slate-900 dark:text-slate-300 transition-colors duration-300">
      <Navbar />

      {/* Hero Section */}
      <div className="relative bg-dark-bg-secondary text-white pt-32 pb-24 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
           <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-950 to-slate-900 opacity-90"></div>
           <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary-600/20 rounded-full blur-[100px] animate-pulse-slow"></div>
           <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-secondary-600/10 rounded-full blur-[100px] animate-float"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-6 text-center z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            Find Your Perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">Tutor</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 font-light animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
             Connect with certified experts tailored to your specific learning goals and schedule.
          </p>

          <div className="relative max-w-2xl mx-auto animate-in fade-in zoom-in duration-500 delay-200">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-4.5 bg-white/10 dark:bg-black/30 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all shadow-xl hover:bg-white/15 dark:hover:bg-black/40"
              placeholder="Search by subject, name, or keyword..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white dark:bg-dark-card border-b border-slate-100 dark:border-white/5 sticky top-0 z-30 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto hide-scrollbar">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-semibold mr-2">
                 <SlidersHorizontal className="w-4 h-4" /> Filters
              </div>

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
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-primary-600 dark:text-primary-400 font-bold hover:text-primary-800 dark:hover:text-primary-300 whitespace-nowrap bg-primary-50 dark:bg-primary-900/20 rounded-xl hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors ml-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reset
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400 hidden md:inline">Sort by:</span>
              <div className="relative">
                 <select
                   value={sortBy}
                   onChange={(e) => setSortBy(e.target.value)}
                   className="appearance-none pl-4 pr-9 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-dark-bg-secondary text-slate-700 dark:text-slate-200 font-semibold hover:bg-white dark:hover:bg-dark-card hover:border-primary-300 dark:hover:border-primary-700 focus:ring-2 focus:ring-primary-500 focus:outline-none cursor-pointer transition-all shadow-sm"
                 >
                   <option value="newest">Newest</option>
                   <option value="popular">Most Popular</option>
                   <option value="rating">Highest Rated</option>
                 </select>
                 <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {!loading && !error && tutors.length > 0 && (
          <div className="mb-6 flex items-center justify-between">
             <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">
               Showing page <span className="text-slate-900 dark:text-white">{currentPage}</span> of <span className="text-slate-900 dark:text-white">{totalPages}</span>
             </p>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-12 h-12 border-4 border-primary-200 dark:border-primary-900/40 border-t-primary-600 dark:border-t-primary-500 rounded-full animate-spin mb-6" />
            <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Finding best tutors for you...</p>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl p-8 text-center max-w-lg mx-auto mt-12">
            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/40 text-rose-500 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-lg font-bold text-rose-900 dark:text-rose-200 mb-2">Something went wrong</h3>
            <p className="text-rose-600 dark:text-rose-300 mb-6 text-sm">{error}</p>
            <Button
              variant="danger"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        )}

        {!loading && !error && tutors.length === 0 && (
          <div className="bg-white dark:bg-dark-card rounded-2xl border border-slate-200 dark:border-white/5 p-16 text-center max-w-lg mx-auto mt-12 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 dark:bg-dark-bg-secondary rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100 dark:border-white/5">
              <Search className="w-10 h-10 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No tutors found</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs mx-auto text-sm">We couldn't find any tutors matching your search criteria. Try adjusting your filters.</p>
            <Button
              variant="primary"
              onClick={handleResetFilters}
            >
              Clear all filters
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
          {tutors.map((tutor) => (
            <TutorCard key={tutor.id} tutor={tutor} />
          ))}
        </div>

        {!loading && !error && tutors.length > 0 && (
            <div className="mt-12">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

const FilterSelect = ({ value, onChange, options, placeholder, isObjectOptions = false }) => (
  <div className="relative group min-w-[140px]">
    <select
      value={value}
      onChange={onChange}
      className="w-full appearance-none pl-4 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-dark-card text-slate-700 dark:text-slate-200 font-medium hover:border-primary-300 dark:hover:border-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all cursor-pointer shadow-sm"
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
    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-primary-500 transition-colors pointer-events-none" />
  </div>
);

export default TutorList;
