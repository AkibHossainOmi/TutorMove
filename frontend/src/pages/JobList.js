// pages/JobList.jsx
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  FiBriefcase,
  FiMapPin,
  FiBook,
  FiClock,
  FiFilter,
  FiSearch,
  FiAward,
  FiUser,
} from "react-icons/fi";
import { jobAPI } from "../utils/apiService";

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
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
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.subject_details
        ?.join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const JobSkeleton = () => (
    <div className="relative rounded-3xl bg-white shadow-md p-6 animate-pulse">
      <div className="h-6 w-3/4 bg-gray-200 rounded mb-4"></div>
      <div className="space-y-3 mb-6">
        <div className="h-4 w-full bg-gray-200 rounded"></div>
        <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
        <div className="h-4 w-4/6 bg-gray-200 rounded"></div>
      </div>
      <div className="h-10 w-32 bg-gray-200 rounded-xl mx-auto"></div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
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
              className="w-full rounded-xl border border-gray-200 bg-white/70 backdrop-blur px-10 py-4 text-gray-900 placeholder-gray-400 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
              placeholder="Search jobs by title, skills, or location"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main */}
      <main className="flex-grow max-w-7xl mx-auto px-6 py-12 -mt-10">
        {/* Horizontal Filters */}
        <div className="relative rounded-3xl bg-white shadow p-6 mb-10">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <JobFilters
              selectedType={selectedType}
              onFilterChange={handleFilterChange}
            />
          </div>
        </div>

        {/* Jobs */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {filteredJobs.length}{" "}
            {filteredJobs.length === 1 ? "Job" : "Jobs"} Available
          </h2>
          <div className="text-sm text-gray-500">
            Sorted by: <span className="font-medium">Newest</span>
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-6">
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
          <div className="grid md:grid-cols-2 gap-6">
            {filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

// Job Card
const JobCard = ({ job }) => {
  return (
    <div className="relative rounded-3xl bg-white shadow-md hover:shadow-lg transition p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {job.description || "Job Title"}
          </h3>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-3 py-1.5 text-xs rounded-full font-medium bg-indigo-100 text-indigo-800">
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
        <div className="text-lg font-semibold text-indigo-600 whitespace-nowrap">
          {job.budget || "Negotiable"}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 mb-6">
        <InfoItem
          icon={<FiBook />}
          text={job.subject_details?.join(", ") || "Not specified"}
        />
        <InfoItem icon={<FiMapPin />} text={job.location || "Remote"} />
        <InfoItem icon={<FiUser />} text={job.mode || "Not specified"} />
        <InfoItem
          icon={<FiClock />}
          text={`Posted ${new Date(job.created_at).toLocaleDateString()} at ${new Date(
            job.created_at
          ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
        />
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <div className="flex items-center text-sm text-gray-500">
          <FiAward className="mr-1.5 text-gray-400" />
          <span>Verified employer</span>
        </div>
        <Link
          to={`/jobs/${job.id}`}
          className="inline-flex items-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow hover:bg-indigo-700"
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
};

const InfoItem = ({ icon, text }) => (
  <div className="flex items-center">
    <div className="p-2 bg-gray-50 rounded-lg mr-3 text-gray-500">{icon}</div>
    <span>{text}</span>
  </div>
);

// Filters
const JobFilters = ({ selectedType, onFilterChange }) => {
  const filters = [
    { id: "all", label: "All Jobs" },
    { id: "online", label: "Online Jobs" },
    { id: "offline", label: "Offline Jobs" },
    { id: "assignment", label: "Assignments" },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`px-5 py-2 rounded-xl text-sm font-medium border transition ${
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
