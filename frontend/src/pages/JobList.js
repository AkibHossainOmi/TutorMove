import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FiBriefcase, FiMapPin, FiBook, FiClock, FiDollarSign } from 'react-icons/fi';

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/jobs/');
        setJobs(response.data);
      } catch (err) {
        setError('Failed to fetch jobs. Please try again later.');
        console.error('Error fetching jobs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  // Filter jobs based on search term and filter
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         job.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || job.job_type === filter;
    return matchesSearch && matchesFilter;
  });

  // Job type options for filter
  const jobTypes = [
    { value: 'all', label: 'All Jobs' },
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'freelance', label: 'Freelance' },
  ];

  return (
    <>
      <Navbar />
      <div className="h-24"></div> {/* Spacer */}
      
      <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Browse Available Jobs</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Find your next opportunity from our curated list of available positions
            </p>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search jobs by title or subject..."
                className="w-full px-5 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg
                className="absolute right-3 top-3.5 h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {jobTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setFilter(type.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    filter === type.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 max-w-3xl mx-auto rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredJobs.length === 0 && (
            <div className="text-center py-20">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No jobs found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filter !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Check back soon for new job postings'}
              </p>
            </div>
          )}

          {/* Job Grid */}
          {!loading && !error && filteredJobs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) => {
                const initials = job.title ? job.title.slice(0, 3).toUpperCase() : 'JOB';
                return (
                  <Link
                    to={`/jobs/${job.id}`}
                    key={job.id}
                    className="group transform transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="bg-white rounded-lg overflow-hidden shadow-md h-full flex flex-col border border-gray-200 hover:border-blue-300">
                      {/* Job Image/Initials */}
                      <div className="bg-gray-100 h-48 flex items-center justify-center">
                        <FiBriefcase className="text-blue text-6xl" />
                      </div>

                      {/* Job Content */}
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                            {job.title}
                          </h3>
                          <div className="flex items-center text-gray-600 mb-3">
                            <FiBriefcase className="mr-2" />
                            <span className="text-sm">{job.job_type || 'Not specified'}</span>
                          </div>
                          <div className="flex items-center text-gray-600 mb-3">
                            <FiBook className="mr-2" />
                            <span className="text-sm">{job.subject}</span>
                          </div>
                          <div className="flex items-center text-gray-600 mb-3">
                            <FiMapPin className="mr-2" />
                            <span className="text-sm">{job.location || 'Remote'}</span>
                          </div>
                          {job.salary && (
                            <div className="flex items-center text-gray-600 mb-3">
                              <FiDollarSign className="mr-2" />
                              <span className="text-sm">{job.salary}</span>
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                              Posted {new Date(job.created_at).toLocaleDateString()}
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              View Details
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="h-24"></div> {/* Spacer */}
      <Footer />
    </>
  );
};

export default JobList;