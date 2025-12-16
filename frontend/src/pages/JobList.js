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
  FiFilter,
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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 animate-pulse">
      <div className="h-6 w-3/4 bg-slate-100 rounded mb-3"></div>
      <div className="h-4 w-1/2 bg-slate-100 rounded mb-6"></div>
      <div className="flex gap-4">
        <div className="h-4 w-20 bg-slate-100 rounded"></div>
        <div className="h-4 w-20 bg-slate-100 rounded"></div>
        <div className="h-4 w-20 bg-slate-100 rounded"></div>
      </div>
    </div>
  );

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
            Find Your Next <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-violet-200">Opportunity</span>
          </h1>
          <p className="text-lg md:text-xl text-indigo-100 max-w-2xl mx-auto mb-10">
            Browse hundreds of tutoring jobs and connect with students who need your expertise.
          </p>

          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all shadow-lg"
              placeholder="Search by subject, skills, or location..."
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
      <main className="flex-grow max-w-6xl mx-auto px-6 py-12 w-full -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6 text-slate-800 font-bold">
                <FiFilter className="w-5 h-5" />
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
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-2">
              <h2 className="text-xl font-bold text-slate-800">
                {filteredJobs.length} <span className="font-normal text-slate-500 text-base">Results Found</span>
              </h2>
              <span className="text-sm text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full">
                Newest First
              </span>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <JobSkeleton key={i} />
                ))}
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <FiBriefcase className="text-slate-400 text-2xl" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">No jobs found</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-6">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    handleFilterChange("all");
                  }}
                  className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {paginatedJobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center mt-12 gap-2">
                    <button
                      className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
                        currentPage === 1
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : "bg-white border border-slate-200 hover:border-indigo-500 text-slate-600 hover:text-indigo-600"
                      }`}
                      onClick={() => changePage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      &lt;
                    </button>

                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => changePage(i + 1)}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl font-semibold transition-all ${
                          currentPage === i + 1
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                            : "bg-white border border-slate-200 hover:border-indigo-500 text-slate-600 hover:text-indigo-600"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
                        currentPage === totalPages
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : "bg-white border border-slate-200 hover:border-indigo-500 text-slate-600 hover:text-indigo-600"
                      }`}
                      onClick={() => changePage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      &gt;
                    </button>
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
        ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
        : "text-slate-600 hover:bg-slate-50"
    }`}
  >
    {label}
  </button>
);

const JobCard = ({ job }) => (
  <div className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-200 transition-all duration-300">
    <div className="flex flex-col md:flex-row gap-6">
      <div className="flex-shrink-0">
        <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform duration-300">
          <FiBriefcase className="w-6 h-6" />
        </div>
      </div>

      <div className="flex-grow">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
              {job.description || "Untitled Job"}
            </h3>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge>{job.service_type || "General"}</Badge>
              {job.mode?.includes("Online") && (
                <Badge color="green">Remote</Badge>
              )}
              {job.mode?.includes("Offline") && (
                <Badge color="amber">On-site</Badge>
              )}
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <span className="block text-lg font-bold text-slate-900">{job.budget || "Negotiable"}</span>
            <span className="text-xs text-slate-500 uppercase tracking-wide">Budget</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-2 gap-x-4 text-sm text-slate-500 mt-4 pt-4 border-t border-slate-100">
          <InfoItem icon={<FiBook className="w-4 h-4" />} text={job.subject_details?.join(", ") || "N/A"} />
          <InfoItem icon={<FiMapPin className="w-4 h-4" />} text={job.location || "Remote"} />
          <InfoItem icon={<FiUser className="w-4 h-4" />} text={job.mode || "N/A"} />
          <InfoItem
            icon={<FiClock className="w-4 h-4" />}
            text={new Date(job.created_at).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
            })}
          />
        </div>
      </div>
    </div>

    <div className="mt-5 flex justify-end">
      <Link
        to={`/jobs/${job.id}`}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-indigo-600 transition-colors shadow-sm"
      >
        View Details
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </Link>
    </div>
  </div>
);

const Badge = ({ children, color = "indigo" }) => {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold border ${colors[color] || colors.indigo}`}>
      {children}
    </span>
  );
};

const InfoItem = ({ icon, text }) => (
  <div className="flex items-center gap-2 truncate">
    <span className="text-slate-400 flex-shrink-0">{icon}</span>
    <span className="truncate" title={text}>{text}</span>
  </div>
);

export default JobList;
