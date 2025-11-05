import React, { useState, useEffect } from "react";
import axios from "axios";
import { tutorAPI } from "../utils/apiService";

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
    <div className="max-w-5xl mx-auto px-4 py-10 font-sans">
      <h1 className="text-center text-3xl font-semibold mb-8">
        Search Tutors by Location & Subject
      </h1>

      {/* Search Filters */}
      <div className="flex flex-wrap gap-4 justify-center mb-8">
        {/* Subject Input */}
        <div className="relative flex-1 min-w-[240px]">
          <input
            type="text"
            value={subject}
            placeholder="Enter subject..."
            onChange={(e) => {
              setSubject(e.target.value);
              fetchSubjectSuggestions(e.target.value);
            }}
            onFocus={() => fetchSubjectSuggestions(subject)}
            onBlur={() => setTimeout(() => setSubjectSuggestions([]), 200)}
            className="w-full p-3 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {subjectSuggestions.length > 0 && (
            <ul className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md mt-1 max-h-52 overflow-y-auto z-20">
              {subjectSuggestions.map((sugg) => (
                <li
                  key={sugg.id}
                  onMouseDown={() => {
                    setSubject(sugg.name);
                    setSubjectSuggestions([]);
                  }}
                  className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer"
                >
                  {sugg.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Location Input */}
        <div className="relative flex-1 min-w-[240px]">
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
            className="w-full p-3 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {locationSuggestions.length > 0 && (
            <ul className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md mt-1 max-h-52 overflow-y-auto z-20">
              {locationSuggestions.map((sugg) => (
                <li
                  key={sugg.place_id}
                  onMouseDown={() => {
                    setSelectedLocation(sugg);
                    setQuery(sugg.display_name);
                    setLocationSuggestions([]);
                  }}
                  className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer"
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
          className={`px-5 py-3 text-sm font-semibold rounded-lg transition-colors ${
            loading
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {error && (
        <p className="text-red-500 text-center mb-4 text-sm">{error}</p>
      )}

      {/* Results Section */}
      {tutors.length > 0 && (
        <div className="space-y-4">
          {tutors.map((tutor) => (
            <div
              key={tutor.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-600 text-white text-xl font-bold">
                  {(tutor.username || "T")[0]}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {tutor.username || "Tutor"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {tutor.location || "Location not available"}
                  </p>
                </div>
              </div>

              {/* Tutor Info */}
              <div className="flex-1 text-sm text-gray-700">
                <p>
                  <span className="font-medium">Bio:</span>{" "}
                  {tutor.bio && tutor.bio.trim() !== ""
                    ? tutor.bio
                    : "Not available"}
                </p>
                <p>
                  <span className="font-medium">Education:</span>{" "}
                  {tutor.education && tutor.education.trim() !== ""
                    ? tutor.education
                    : "Not available"}
                </p>
                <p>
                  <span className="font-medium">Experience:</span>{" "}
                  {tutor.experience && tutor.experience.trim() !== ""
                    ? tutor.experience
                    : "Not available"}
                </p>
              </div>

              {/* Action */}
              <div className="flex-shrink-0">
                <a
                  href={`/tutors/${tutor.id}`}
                  className="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                >
                  View Profile
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {tutors.length === 0 && !loading && hasSearched && (
        <p className="text-center text-gray-500 mt-10">
          No tutors found near your location.
        </p>
      )}
    </div>
  );
};

export default TutorMapSearch;
