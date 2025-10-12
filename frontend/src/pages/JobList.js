import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  FiBriefcase,
  FiMapPin,
  FiBook,
  FiClock,
  FiSearch,
  FiUser,
} from "react-icons/fi";
import { jobAPI } from "../utils/apiService";

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const jobsPerPage = 7;
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await jobAPI.getJobs();
        let allJobs = res.data || [];

        // Sort by date (newest first)
        allJobs.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

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
    setCurrentPage(1);
    navigate(type === "all" ? "/jobs" : `/jobs?type=${type}`);
  };

  const filteredJobs = jobs.filter((job) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const textFields = [
      job.description,
      job.location,
      job.mode,
      job.service_type,
      Array.isArray(job.subject_details)
        ? job.subject_details.join(" ")
        : job.subject_details,
    ];
    return textFields.some((field) =>
      String(field || "").toLowerCase().includes(query)
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * jobsPerPage,
    currentPage * jobsPerPage
  );

  const changePage = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const JobSkeleton = () => (
    <div className="relative rounded-2xl bg-white shadow-md p-6 animate-pulse">
      <div className="h-6 w-3/4 bg-gray-200 rounded mb-3"></div>
      <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
      <div className="h-4 w-5/6 bg-gray-200 rounded mb-4"></div>
      <div className="h-10 w-32 bg-gray-200 rounded-xl mx-auto"></div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-sky-500 to-purple-600 text-white py-20 text-center overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="relative max-w-3xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-extrabold drop-shadow-lg">
            Find Your Next Opportunity
          </h1>
          <p className="mt-4 text-lg md:text-xl text-white/90">
            Discover jobs that match your skills and expertise
          </p>
          <div className="mt-8 relative max-w-2xl mx-auto">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              className="w-full rounded-xl border border-gray-200 bg-white/80 backdrop-blur px-10 py-4 text-gray-900 placeholder-gray-400 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
              placeholder="Search jobs by title, skills, or location"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Section */}
      <main className="flex-grow max-w-6xl mx-auto px-6 py-12 -mt-10">
        {/* Filters */}
        <div className="relative rounded-3xl bg-white shadow p-6 mb-10">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <JobFilters
              selectedType={selectedType}
              onFilterChange={handleFilterChange}
            />
          </div>
        </div>

        {/* Job Count Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {filteredJobs.length}{" "}
            {filteredJobs.length === 1 ? "Job" : "Jobs"} Available
          </h2>
          <div className="text-sm text-gray-500">
            Sorted by: <span className="font-medium">Newest First</span>
          </div>
        </div>

        {/* Job List */}
        {loading ? (
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <JobSkeleton key={i} />
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-16 rounded-3xl bg-white shadow-xl">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <FiBriefcase className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No jobs found
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {searchQuery
                ? `No jobs match your search for "${searchQuery}".`
                : "We couldn't find any jobs matching your criteria."}
            </p>
            {(searchQuery || selectedType !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  handleFilterChange("all");
                }}
                className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-medium text-white shadow hover:bg-indigo-700"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {paginatedJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center items-center mt-10 gap-2 flex-wrap">
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white border border-gray-200 hover:bg-indigo-50"
                }`}
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => changePage(i + 1)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    currentPage === i + 1
                      ? "bg-indigo-600 text-white shadow"
                      : "bg-white border border-gray-200 hover:bg-indigo-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  currentPage === totalPages || totalPages === 0
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white border border-gray-200 hover:bg-indigo-50"
                }`}
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                Next
              </button>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

// Job Card Component
const JobCard = ({ job }) => (
  <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all p-6 border border-gray-100 hover:border-indigo-100">
    <div className="flex flex-col md:flex-row md:items-center gap-6 flex-1">
      <div className="flex-shrink-0 bg-indigo-50 p-4 rounded-xl">
        <FiBriefcase className="text-indigo-600 text-2xl" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {job.description || "Untitled Job"}
        </h3>
        <div className="flex flex-wrap gap-2 mb-2">
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
            {job.service_type || "General"}
          </span>
          {job.mode?.includes("Online") && (
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800">
              Remote
            </span>
          )}
          {job.mode?.includes("Offline") && (
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
              On-site
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
          <InfoItem
            icon={<FiBook />}
            text={job.subject_details?.join(", ") || "Not specified"}
          />
          <InfoItem icon={<FiMapPin />} text={job.location || "Remote"} />
          <InfoItem icon={<FiUser />} text={job.mode || "Not specified"} />
          <InfoItem
            icon={<FiClock />}
            text={`Posted ${new Date(
              job.created_at
            ).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}`}
          />
        </div>
      </div>
    </div>

    <div className="flex flex-col items-end gap-3">
      <div className="text-lg font-semibold text-indigo-600">
        {job.budget || "Negotiable"}
      </div>
      <Link
        to={`/jobs/${job.id}`}
        className="inline-flex items-center rounded-xl bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-700 transition"
      >
        View Details
        <svg
          className="w-4 h-4 ml-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </Link>
    </div>
  </div>
);

const InfoItem = ({ icon, text }) => (
  <div className="flex items-center gap-2">
    <span className="text-gray-500">{icon}</span>
    <span>{text}</span>
  </div>
);

const JobFilters = ({ selectedType, onFilterChange }) => {
  const filters = [
    { id: "all", label: "All Jobs" },
    { id: "online", label: "Online Jobs" },
    { id: "offline", label: "Offline Jobs" },
    { id: "assignment", label: "Assignments" },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`px-5 py-2 rounded-xl text-sm font-medium border transition-all ${
            selectedType === filter.id
              ? "bg-indigo-600 text-white border-indigo-600 shadow"
              : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};

export default JobList;
