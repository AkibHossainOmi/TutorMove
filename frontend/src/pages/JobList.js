// pages/JobList.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FiBriefcase, FiMapPin, FiBook, FiDollarSign } from "react-icons/fi";

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/jobs");
        const data = await res.json();
        setJobs(data);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 md:px-8 lg:px-16 pt-28 pb-16">
        <h1 className="text-3xl font-bold text-gray-800 mb-10 text-center">
          Latest Job Posts
        </h1>
        {loading ? (
          <p className="text-center text-gray-500">Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <p className="text-center text-gray-500">No jobs found.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <Link
                to={`/jobs/${job.id}`}
                key={job.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition block"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {job.title}
                  </h3>
                  <span
                    className={`px-3 py-1 text-xs rounded-full font-medium ${
                      job.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {job.status}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p className="flex items-center gap-2">
                    <FiBook className="text-gray-400" />{" "}
                    {job.subject || "Not specified"}
                  </p>
                  <p className="flex items-center gap-2">
                    <FiMapPin className="text-gray-400" />{" "}
                    {job.location || "Remote"}
                  </p>
                  <p className="flex items-center gap-2">
                    <FiDollarSign className="text-gray-400" />{" "}
                    {job.budget || "Negotiable"}
                  </p>
                  <p className="flex items-center gap-2">
                    <FiBriefcase className="text-gray-400" /> Posted on{" "}
                    {new Date(job.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="mt-5 text-right">
                  <span className="inline-block bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                    View Details
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default JobList;
