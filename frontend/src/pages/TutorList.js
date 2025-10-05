import React, { useEffect, useState } from "react";
import TutorCard from "../components/TutorCard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";
import { subjectApi, tutorAPI } from "../utils/apiService";

const PAGE_SIZE = 8;

const TutorList = () => {
  const [tutors, setTutors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [premiumOnly, setPremiumOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtersVisible, setFiltersVisible] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await subjectApi.getSubjects();
        const list = Array.isArray(response.data)
          ? response.data
          : response.data?.results || [];
        setSubjects(list);
      } catch {
        setSubjects([]);
      }
    };
    fetchSubjects();
  }, []);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/locations/`
        );
        setLocations(Array.isArray(res.data) ? res.data : []);
      } catch {
        setLocations([]);
      }
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    const fetchTutors = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          page,
          page_size: PAGE_SIZE,
          ...(selectedSubject && { subject: selectedSubject }),
          ...(selectedLocation && { location: selectedLocation }),
          ...(premiumOnly && { premium: true }),
        };

        const res = await tutorAPI.getTutors(params);
        const data = Array.isArray(res.data)
          ? res.data
          : res.data.results || [];
        setTutors(page === 1 ? data : (prev) => [...prev, ...data]);
        setHasMore(data.length === PAGE_SIZE);
      } catch {
        setError("Failed to fetch tutors. Please try again later.");
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };
    fetchTutors();
  }, [page, premiumOnly, selectedSubject, selectedLocation]);

  useEffect(() => {
    setPage(1);
    setTutors([]);
    setHasMore(true);
  }, [premiumOnly, selectedSubject, selectedLocation]);

  const resetFilters = () => {
    setSelectedSubject("");
    setSelectedLocation("");
    setPremiumOnly(false);
  };

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-sky-500 to-purple-600 text-white py-20 text-center overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="relative max-w-3xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-extrabold drop-shadow-lg">
            Discover Expert Tutors
          </h1>
          <p className="mt-4 text-lg md:text-xl text-white/90">
            Connect with qualified tutors tailored to your learning goals and
            schedule
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50 py-12">
        <div className="max-w-7xl mx-auto px-6">
          {/* Filters */}
          {filtersVisible && (
            <div className="relative mb-10">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-indigo-200 to-sky-200 blur opacity-60" />
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-20">
              <div className="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full" />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Tutors */}
          {!loading && !error && (
            <>
              {tutors.length === 0 ? (
                <div className="text-center py-16 rounded-3xl bg-white shadow-xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No tutors found
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Try adjusting your filters
                  </p>
                  <button
                    onClick={resetFilters}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">
                    Available Tutors{" "}
                    <span className="text-indigo-600">
                      ({tutors.length})
                    </span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tutors.map((tutor) => (
                      <TutorCard key={tutor.id} tutor={tutor} />
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* Load More */}
          {hasMore && !loading && !error && tutors.length > 0 && (
            <div className="mt-12 text-center">
              <button
                onClick={() => setPage((p) => p + 1)}
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-3 text-base font-semibold text-white shadow hover:from-indigo-700 hover:to-purple-700 transition"
              >
                Load More Tutors
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default TutorList;
