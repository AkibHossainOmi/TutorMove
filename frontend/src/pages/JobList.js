// pages/JobList.jsx
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { 
  FiBriefcase, 
  FiMapPin, 
  FiBook, 
  FiDollarSign, 
  FiClock,
  FiFilter,
  FiSearch,
  FiX,
  FiAward,
  FiUser
} from "react-icons/fi";
import { jobAPI } from "../utils/apiService";

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await jobAPI.getJobs();
        let allJobs = res.data;

        const params = new URLSearchParams(location.search);
        const type = params.get("type");

        if (type === "online") {
          allJobs = allJobs.filter((job) => job.mode?.includes("Online"));
          setSelectedType("online");
        } else if (type === "offline") {
          allJobs = allJobs.filter((job) => job.mode?.includes("Offline"));
          setSelectedType("offline");
        } else if (type === "assignment") {
          allJobs = allJobs.filter(
            (job) => job.service_type?.toLowerCase() === "assignment help"
          );
          setSelectedType("assignment");
        } else {
          setSelectedType("all");
        }

        setJobs(allJobs);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [location.search]);

  const handleFilterChange = (type) => {
    setSelectedType(type);
    navigate(type === "all" ? "/jobs" : `/jobs?type=${type}`);
    setShowFilters(false);
  };

  const filteredJobs = jobs.filter(job => 
    job.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.subject_details?.join(" ").toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const JobSkeleton = () => (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="h-7 bg-gray-200 rounded w-3/4"></div>
        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
      </div>
      <div className="space-y-3 mb-6">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        <div className="h-4 bg-gray-200 rounded w-3/6"></div>
      </div>
      <div className="mt-6 flex justify-end">
        <div className="h-10 bg-gray-200 rounded-xl w-32"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Find Your Next Opportunity
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Discover jobs that match your skills and expertise
            </p>
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-4 border border-transparent rounded-lg bg-white/90 focus:ring-2 focus:ring-white focus:border-white focus:bg-white focus:outline-none text-gray-900"
                placeholder="Search jobs by title, skills, or location"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <main className="flex-grow container mx-auto px-4 sm:px-6 py-12 -mt-10">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:hidden flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Filter Jobs</h2>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 shadow-sm hover:shadow-md transition-shadow"
            >
              <FiFilter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowFilters(false)}></div>
              <div className="absolute right-0 top-0 h-full w-4/5 max-w-sm bg-white shadow-xl p-6 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Filters</h3>
                  <button onClick={() => setShowFilters(false)}>
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
                <JobFilters selectedType={selectedType} onFilterChange={handleFilterChange} />
              </div>
            </div>
          )}

          <div className="hidden lg:block w-1/4">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-28 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">Filters</h3>
              <JobFilters selectedType={selectedType} onFilterChange={handleFilterChange} />
            </div>
          </div>

          <div className="w-full lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {filteredJobs.length} {filteredJobs.length === 1 ? 'Job' : 'Jobs'} Available
              </h2>
              <div className="text-sm text-gray-500">
                Sorted by: <span className="font-medium">Newest</span>
              </div>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-1 gap-6">
                {[...Array(4)].map((_, i) => (
                  <JobSkeleton key={i} />
                ))}
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <FiBriefcase className="text-gray-400 text-3xl" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  {searchQuery ? 
                    `No jobs match your search for "${searchQuery}". Try adjusting your search terms.` : 
                    "We couldn't find any jobs matching your criteria. Try adjusting your filters."
                  }
                </p>
                {(searchQuery || selectedType !== "all") && (
                  <button 
                    onClick={() => {
                      setSearchQuery("");
                      handleFilterChange("all");
                    }}
                    className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-sm hover:shadow-md"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid md:grid-cols-1 gap-6">
                {filteredJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// Job Card Component
const JobCard = ({ job }) => {
  const accentColor = "blue";
  const colorClasses = {
    blue: { border: "border-l-blue-500", badge: "bg-blue-100 text-blue-800", button: "bg-blue-600 hover:bg-blue-700" },
  };

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 p-6 transition-all hover:shadow-md shadow-sm ${colorClasses[accentColor].border} border-l-4`}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {job.description || "Job Title"}
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`px-3 py-1.5 text-xs rounded-full font-medium ${colorClasses[accentColor].badge}`}>
              {job.service_type || "General"}
            </span>
            {job.mode?.includes("Online") && (
              <span className="px-3 py-1.5 text-xs rounded-full font-medium bg-emerald-100 text-emerald-800">
                Remote
              </span>
            )}
            {job.mode?.includes("Offline") && (
              <span className="px-3 py-1.5 text-xs rounded-full font-medium bg-amber-100 text-amber-800">
                On-site
              </span>
            )}
          </div>
        </div>
        <div className="text-lg font-semibold text-blue-600 whitespace-nowrap">
          {job.budget || "Negotiable"}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-6">
        <div className="flex items-center">
          <div className="p-2 bg-gray-50 rounded-lg mr-3">
            <FiBook className="text-gray-500 flex-shrink-0" />
          </div>
          <span>{job.subject_details?.join(", ") || "Not specified"}</span>
        </div>
        <div className="flex items-center">
          <div className="p-2 bg-gray-50 rounded-lg mr-3">
            <FiMapPin className="text-gray-500 flex-shrink-0" />
          </div>
          <span>{job.location || "Remote"}</span>
        </div>
        <div className="flex items-center">
          <div className="p-2 bg-gray-50 rounded-lg mr-3">
            <FiUser className="text-gray-500 flex-shrink-0" />
          </div>
          <span>{job.mode || "Not specified"}</span>
        </div>
        <div className="flex items-center">
          <div className="p-2 bg-gray-50 rounded-lg mr-3">
            <FiClock className="text-gray-500 flex-shrink-0" />
          </div>
          <span>
            Posted {new Date(job.created_at).toLocaleDateString()} at {new Date(job.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <div className="flex items-center text-sm text-gray-500">
          <FiAward className="mr-1.5 text-gray-400" />
          <span>Verified employer</span>
        </div>
        <Link
          to={`/jobs/${job.id}`}
          className={`inline-flex items-center px-5 py-2.5 text-sm font-medium text-white rounded-xl transition shadow-sm hover:shadow-md ${colorClasses[accentColor].button}`}
        >
          View Details
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

// Job Filters Component
const JobFilters = ({ selectedType, onFilterChange }) => {
  const filters = [
    { id: "all", label: "All Jobs" },
    { id: "online", label: "Online Jobs" },
    { id: "offline", label: "Offline Jobs" },
    { id: "assignment", label: "Assignments" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wide">Job Type</h4>
        <div className="space-y-3">
          {filters.map((filter) => (
            <div key={filter.id} className="flex items-center">
              <input
                id={filter.id}
                name="job-type"
                type="radio"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                checked={selectedType === filter.id}
                onChange={() => onFilterChange(filter.id)}
              />
              <label htmlFor={filter.id} className="ml-3 text-sm text-gray-700">
                {filter.label}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JobList;
