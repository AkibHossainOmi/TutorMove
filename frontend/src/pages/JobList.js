// src/pages/JobList.js
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Pagination from "../components/Pagination";
import JobCard from "../components/JobCard";
import {
  Briefcase,
  MapPin,
  BookOpen,
  Clock,
  Search,
  Filter,
} from "lucide-react";
import { jobAPI } from "../utils/apiService";
import Button from "../components/ui/Button";

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const jobsPerPage = 10;
  const location = useLocation();
  const navigate = useNavigate();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
        setDebouncedSearch(searchQuery);
        setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams(location.search);
        const type = params.get("type") || "all";
        setSelectedType(type);

        const apiParams = {
            page: currentPage,
            page_size: jobsPerPage,
            type: type !== "all" ? type : undefined,
            search: debouncedSearch,
        };

        const res = await jobAPI.getJobs(apiParams);
        
        if (res.data && res.data.results) {
            setJobs(res.data.results);
            const totalCount = res.data.count || 0;
            setTotalPages(Math.ceil(totalCount / jobsPerPage));
        } else if (Array.isArray(res.data)) {
            // Fallback
            setJobs(res.data);
            setTotalPages(1);
        } else {
            setJobs([]);
            setTotalPages(0);
        }
      } catch (err) {
        console.error("Error fetching jobs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [location.search, currentPage, debouncedSearch]);

  const handleFilterChange = (type) => {
    setSelectedType(type);
    setCurrentPage(1);
    navigate(type === "all" ? "/jobs" : `/jobs?type=${type}`);
  };

  const handlePageChange = (page) => {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const JobSkeleton = () => (
    <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 p-6 animate-pulse">
      <div className="h-6 w-3/4 bg-slate-100 dark:bg-dark-bg-secondary rounded mb-3"></div>
      <div className="h-4 w-1/2 bg-slate-100 dark:bg-dark-bg-secondary rounded mb-6"></div>
      <div className="flex gap-4">
        <div className="h-4 w-20 bg-slate-100 dark:bg-dark-bg-secondary rounded"></div>
        <div className="h-4 w-20 bg-slate-100 dark:bg-dark-bg-secondary rounded"></div>
        <div className="h-4 w-20 bg-slate-100 dark:bg-dark-bg-secondary rounded"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-dark-bg font-sans text-slate-900 dark:text-slate-300 transition-colors duration-300">
      <Navbar />

      {/* Hero Section */}
      <div className="relative bg-dark-bg-secondary text-white pt-32 pb-24 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
           <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-950 to-slate-900 opacity-90"></div>
           <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary-600/20 rounded-full blur-[100px] animate-pulse-slow"></div>
           <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-secondary-600/10 rounded-full blur-[100px] animate-float"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-6 text-center z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            Find Your Next <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">Opportunity</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 font-light animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            Browse hundreds of tutoring jobs and connect with students who need your expertise.
          </p>

          <div className="relative max-w-2xl mx-auto animate-in fade-in zoom-in duration-500 delay-200">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-4.5 bg-white/10 dark:bg-black/30 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all shadow-xl hover:bg-white/15 dark:hover:bg-black/40"
              placeholder="Search by subject, skills, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main Section */}
      <main className="flex-grow max-w-6xl mx-auto px-6 py-12 w-full -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6 text-slate-800 dark:text-white font-bold">
                <Filter className="w-5 h-5" />
                <span>Filters</span>
              </div>

              <div className="space-y-2">
                <FilterButton
                  isActive={selectedType === "all"}
                  onClick={() => handleFilterChange("all")}
                  label="All Jobs"
                />
                <FilterButton
                  isActive={selectedType === "online"}
                  onClick={() => handleFilterChange("online")}
                  label="Online Only"
                />
                <FilterButton
                  isActive={selectedType === "offline"}
                  onClick={() => handleFilterChange("offline")}
                  label="In-Person"
                />
                <FilterButton
                  isActive={selectedType === "assignment"}
                  onClick={() => handleFilterChange("assignment")}
                  label="Assignments"
                />
              </div>
            </div>
          </div>

          {/* Job List */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10 mb-2">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                {totalPages > 0 ? (
                    <>Showing page <span className="text-primary-600 dark:text-primary-400">{currentPage}</span> of {totalPages}</>
                ) : (
                    "No Jobs Found"
                )}
              </h2>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-lg">
                Newest First
              </span>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <JobSkeleton key={i} />
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-dark-card rounded-2xl border border-dashed border-slate-300 dark:border-white/10">
                <div className="mx-auto w-16 h-16 bg-slate-50 dark:bg-dark-bg-secondary rounded-full flex items-center justify-center mb-4">
                  <Briefcase className="text-slate-400 dark:text-slate-500 w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">No jobs found</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6 text-sm">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    handleFilterChange("all");
                  }}
                  variant="primary"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                  {jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8">
                     <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                     />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

const FilterButton = ({ isActive, onClick, label }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 border border-primary-100 dark:border-primary-800/30 font-semibold"
        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"
    }`}
  >
    {label}
  </button>
);

export default JobList;
