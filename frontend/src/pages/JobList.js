// pages/JobList.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  FiBriefcase,
  FiMapPin,
  FiBook,
  FiDollarSign,
  FiSearch,
} from "react-icons/fi";
import { jobAPI } from "../utils/apiService";

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const jobTypes = [
    { value: "all", label: "All" },
    { value: "full-time", label: "Full-time" },
    { value: "part-time", label: "Part-time" },
    { value: "contract", label: "Contract" },
    { value: "freelance", label: "Freelance" },
  ];

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await jobAPI.getJobs();
        setJobs(res.data || []);
      } catch {
        setError("Failed to fetch jobs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    const results = jobs.filter((job) => {
      const title = job.title?.toLowerCase() || "";
      const subject = job.subject?.toLowerCase() || "";
      const searchMatch =
        title.includes(search.toLowerCase()) ||
        subject.includes(search.toLowerCase());
      const filterMatch = filter === "all" || job.job_type === filter;
      return searchMatch && filterMatch;
    });
    setFilteredJobs(results);
  }, [jobs, search, filter]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Browse Jobs</h1>
            <p className="text-gray-600 mt-2">
              Find your next opportunity from our job listings
            </p>
          </header>

          {/* Search + Filter (Sticky) */}
          <div className="sticky top-16 z-20 bg-white/80 backdrop-blur shadow-sm rounded-lg p-4 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-4">
              {/* Search */}
              <div className="relative w-full md:max-w-md">
                <FiSearch className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title or subject..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2 justify-center">
                {jobTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setFilter(type.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      filter === type.value
                        ? "bg-blue-600 text-white shadow"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600"></div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="max-w-md mx-auto bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-center">
              {error}
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filteredJobs.length === 0 && (
            <div className="text-center py-20 text-gray-500">
              <FiBriefcase className="mx-auto text-4xl mb-2" />
              <p>No jobs found</p>
              <p className="text-sm">
                {search || filter !== "all"
                  ? "Try adjusting your search or filters."
                  : "Check back later for new opportunities."}
              </p>
            </div>
          )}

          {/* Job Grid */}
          {!loading && !error && filteredJobs.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredJobs.map((job) => (
                <Link
                  to={`/jobs/${job.id}`}
                  key={job.id}
                  className="bg-white rounded-xl shadow hover:shadow-md border border-gray-200 hover:border-blue-300 transition p-6 flex flex-col"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                      {job.title}
                    </h3>
                    <div className="flex items-center text-gray-600 text-sm mb-1">
                      <FiBriefcase className="mr-2" />{" "}
                      {job.job_type || "Not specified"}
                    </div>
                    <div className="flex items-center text-gray-600 text-sm mb-1">
                      <FiBook className="mr-2" /> {job.subject}
                    </div>
                    <div className="flex items-center text-gray-600 text-sm mb-1">
                      <FiMapPin className="mr-2" /> {job.location || "Remote"}
                    </div>
                    {job.salary && (
                      <div className="flex items-center text-gray-600 text-sm mb-1">
                        <FiDollarSign className="mr-2" /> {job.salary}
                      </div>
                    )}
                  </div>
                  <div className="mt-4 pt-3 border-t text-xs text-gray-500 flex justify-between">
                    <span>
                      Posted {new Date(job.created_at).toLocaleDateString()}
                    </span>
                    <span className="text-blue-600 font-medium">View →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default JobList;
