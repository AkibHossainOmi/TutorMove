// src/components/MapSearch.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { tutorAPI } from "../utils/apiService";
import { Link } from "react-router-dom";

const SEARCH_RADIUS_KM = 20;

const TutorMapSearch = () => {
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("");
  const [subjects, setSubjects] = useState([]);

  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [subjectSuggestions, setSubjectSuggestions] = useState([]);

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/subjects`);
        setSubjects(res.data.filter((s) => s.is_active));
      } catch (err) {
        console.error("Failed to fetch subjects", err);
      }
    };
    fetchSubjects();
  }, []);

  const fetchLocationSuggestions = async (text) => {
    if (text.length < 3) return;
    try {
      const res = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: { q: text, format: "json", limit: 5 },
      });
      setLocationSuggestions(res.data);
    } catch {
      setLocationSuggestions([]);
    }
  };

  const fetchSubjectSuggestions = (text) => {
    if (!text.trim()) {
      setSubjectSuggestions([]);
      return;
    }
    setSubjectSuggestions(
      subjects.filter((s) =>
        s.name.toLowerCase().includes(text.toLowerCase())
      )
    );
  };

  const handleSearch = async () => {
    if (!subject.trim()) {
      setError("Please select a subject");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await tutorAPI.searchTutors({
        location: selectedLocation?.display_name || "",
        subject: subject.trim(),
        radius_km: SEARCH_RADIUS_KM,
      });
      setTutors(res.data.results || []);
      setHasSearched(true);
    } catch {
      setError("Failed to fetch tutors");
      setTutors([]);
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 relative z-10 -mt-8">
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
        <h1 className="text-center text-2xl md:text-3xl font-bold text-gray-900 mb-8">
          Find Tutors Near You
        </h1>

        {/* Search Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Subject Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
               </svg>
            </div>
            <input
              type="text"
              value={subject}
              placeholder="Enter subject (e.g., Math)"
              onChange={(e) => {
                setSubject(e.target.value);
                fetchSubjectSuggestions(e.target.value);
              }}
              onFocus={() => fetchSubjectSuggestions(subject)}
              onBlur={() => setTimeout(() => setSubjectSuggestions([]), 200)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white transition-colors"
            />
            {subjectSuggestions.length > 0 && (
              <ul className="absolute top-full left-0 right-0 bg-white border border-gray-100 rounded-xl shadow-lg mt-2 max-h-52 overflow-y-auto z-30 py-2">
                {subjectSuggestions.map((sugg) => (
                  <li
                    key={sugg.id}
                    onMouseDown={() => {
                      setSubject(sugg.name);
                      setSubjectSuggestions([]);
                    }}
                    className="px-4 py-2 hover:bg-indigo-50 cursor-pointer text-gray-700"
                  >
                    {sugg.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Location Input */}
          <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
               </svg>
            </div>
            <input
              type="text"
              value={query}
              placeholder="Enter location..."
              onChange={(e) => {
                setQuery(e.target.value);
                fetchLocationSuggestions(e.target.value);
                if (!e.target.value.trim()) setSelectedLocation(null);
              }}
              onFocus={() => fetchLocationSuggestions(query)}
              onBlur={() => setTimeout(() => setLocationSuggestions([]), 200)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white transition-colors"
            />
            {locationSuggestions.length > 0 && (
              <ul className="absolute top-full left-0 right-0 bg-white border border-gray-100 rounded-xl shadow-lg mt-2 max-h-52 overflow-y-auto z-30 py-2">
                {locationSuggestions.map((sugg) => (
                  <li
                    key={sugg.place_id}
                    onMouseDown={() => {
                      setSelectedLocation(sugg);
                      setQuery(sugg.display_name);
                      setLocationSuggestions([]);
                    }}
                    className="px-4 py-2 hover:bg-indigo-50 cursor-pointer text-gray-700 truncate"
                  >
                    {sugg.display_name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold text-white shadow-md transition-all transform active:scale-95 ${
              loading
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg"
            }`}
          >
            {loading ? (
               <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
               </span>
            ) : (
               "Search Tutors"
            )}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-center mb-6 text-sm">
             {error}
          </div>
        )}

        {/* Results Section */}
        {tutors.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            {tutors.map((tutor) => (
              <div
                key={tutor.id}
                className="flex items-start gap-4 p-4 border border-gray-100 rounded-xl bg-gray-50 hover:bg-white hover:shadow-md transition-all"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                  {(tutor.username || "T")[0].toUpperCase()}
                </div>

                <div className="flex-grow min-w-0">
                  <h3 className="text-base font-bold text-gray-900 truncate">
                    {tutor.username || "Tutor"}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                     <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                     </svg>
                     {tutor.location || "Unknown location"}
                  </p>

                  <div className="text-xs text-gray-600 line-clamp-2 mb-3">
                     {tutor.bio || "No bio available."}
                  </div>

                  <Link
                    to={`/profile/${tutor.username}`}
                    className="inline-block text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    View Profile →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {tutors.length === 0 && !loading && hasSearched && (
          <div className="text-center py-10">
             <div className="inline-block p-3 rounded-full bg-gray-100 mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
             </div>
             <p className="text-gray-500 font-medium">No tutors found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorMapSearch;