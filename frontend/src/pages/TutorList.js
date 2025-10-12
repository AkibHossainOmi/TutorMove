import React, { useEffect, useState } from "react";
import TutorCard from "../components/TutorCard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { tutorAPI } from "../utils/apiService";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const PAGE_SIZE = 8;

const TutorList = () => {
  const [tutors, setTutors] = useState([]);
  const [page, setPage] = useState(1);
  const [totalTutors, setTotalTutors] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTutors = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = { page, page_size: PAGE_SIZE };
        const res = await tutorAPI.getTutors(params);

        // Handle paginated API data safely
        const data = Array.isArray(res.data)
          ? res.data
          : res.data.results || [];

        setTutors(data);
        if (res.data.count) setTotalTutors(res.data.count);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch tutors. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchTutors();
  }, [page]);

  const totalPages = Math.ceil(totalTutors / PAGE_SIZE) || 1;

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-sky-500 to-purple-600 text-white py-20 text-center overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="relative max-w-3xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-extrabold drop-shadow-lg">
            Discover Expert Tutors
          </h1>
          <p className="mt-4 text-lg md:text-xl text-white/90">
            Connect with qualified tutors tailored to your learning goals and schedule
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50 py-16">
        <div className="max-w-5xl mx-auto px-6">
          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-24">
              <div className="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full" />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="mb-8 rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700 text-center">
              {error}
            </div>
          )}

          {/* Tutors */}
          {!loading && !error && (
            <>
              {tutors.length === 0 ? (
                <div className="text-center py-24 rounded-3xl bg-white shadow-xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No tutors found
                  </h3>
                  <p className="text-gray-600">Please try again later.</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Available Tutors{" "}
                      <span className="text-indigo-600">({totalTutors || tutors.length})</span>
                    </h2>
                    <p className="text-sm text-gray-500">
                      Page {page} of {totalPages}
                    </p>
                  </div>

                  {/* Tutors Grid — single column */}
                  <div className="grid grid-cols-1 gap-8">
                    {tutors.map((tutor) => (
                      <TutorCard key={tutor.id} tutor={tutor} />
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  <div className="mt-12 flex justify-center items-center gap-3">
                    <button
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      disabled={page === 1}
                      className={`flex items-center gap-1 px-4 py-2 rounded-xl border text-sm font-medium transition ${
                        page === 1
                          ? "text-gray-400 border-gray-200 cursor-not-allowed"
                          : "text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                      }`}
                    >
                      <FiChevronLeft />
                      Prev
                    </button>

                    {/* Page Numbers */}
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i + 1)}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold transition ${
                          page === i + 1
                            ? "bg-indigo-600 text-white shadow"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                      disabled={page === totalPages}
                      className={`flex items-center gap-1 px-4 py-2 rounded-xl border text-sm font-medium transition ${
                        page === totalPages
                          ? "text-gray-400 border-gray-200 cursor-not-allowed"
                          : "text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                      }`}
                    >
                      Next
                      <FiChevronRight />
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default TutorList;
