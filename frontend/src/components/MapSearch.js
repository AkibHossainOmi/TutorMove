import React, { useState, useEffect } from "react";
import axios from "axios";
import { tutorAPI } from "../utils/apiService";

const SEARCH_RADIUS_KM = 20;

const TutorMapSearch = () => {
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("");
  const [subjects, setSubjects] = useState([]);

  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [subjectSuggestions, setSubjectSuggestions] = useState([]);
  const [showSubjectSuggestions, setShowSubjectSuggestions] = useState(false);

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
      setShowLocationSuggestions(true);
    } catch {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
    }
  };

  const fetchSubjectSuggestions = (text) => {
    if (!text.trim()) {
      setSubjectSuggestions([]);
      return;
    }
    setSubjectSuggestions(subjects.filter((s) => s.name.toLowerCase().includes(text.toLowerCase())));
    setShowSubjectSuggestions(true);
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
    <div className="max-w-4xl mx-auto px-4 py-10 font-sans">
      <h1 className="text-center text-3xl font-semibold mb-8">Search Tutors by Location & Subject</h1>

      <div className="flex flex-wrap gap-4 justify-center mb-6">
        {/* Subject Input */}
        <div className="relative flex-1 min-w-[220px]">
          <input
            type="text"
            value={subject}
            placeholder="Enter subject..."
            onChange={(e) => {
              setSubject(e.target.value);
              fetchSubjectSuggestions(e.target.value);
            }}
            onFocus={() => setShowSubjectSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSubjectSuggestions(false), 200)}
            className="w-full p-3 text-sm border-2 border-gray-300 rounded-lg focus:outline-none"
          />
          {showSubjectSuggestions && subject && subjectSuggestions.length > 0 && (
            <ul className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg max-h-52 overflow-y-auto z-20 mt-1">
              {subjectSuggestions.map((sugg) => (
                <li
                  key={sugg.id}
                  onMouseDown={() => {
                    setSubject(sugg.name);
                    setSubjectSuggestions([]);
                  }}
                  className="px-3 py-2 cursor-pointer hover:bg-blue-50"
                >
                  {sugg.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Location Input */}
        <div className="relative flex-1 min-w-[220px]">
          <input
            type="text"
            value={query}
            placeholder="Enter location..."
            onChange={(e) => {
              setQuery(e.target.value);
              fetchLocationSuggestions(e.target.value);
              if (!e.target.value.trim()) setSelectedLocation(null);
            }}
            onFocus={() => setShowLocationSuggestions(true)}
            onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
            className="w-full p-3 text-sm border-2 border-gray-300 rounded-lg focus:outline-none"
          />
          {showLocationSuggestions && locationSuggestions.length > 0 && (
            <ul className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg max-h-52 overflow-y-auto z-20 mt-1">
              {locationSuggestions.map((sugg) => (
                <li
                  key={sugg.place_id}
                  onMouseDown={() => {
                    setSelectedLocation(sugg);
                    setQuery(sugg.display_name);
                    setLocationSuggestions([]);
                  }}
                  className="px-3 py-2 cursor-pointer hover:bg-blue-50"
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
          className={`px-5 py-3 text-sm font-semibold rounded-lg ${
            loading ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {error && <div className="text-red-500 text-center text-sm mb-4">{error}</div>}

      {tutors.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
          {tutors.map((tutor) => (
            <div
              key={tutor.id}
              className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm text-center"
            >
              <div className="w-16 h-16 rounded-full bg-blue-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-3">
                {(tutor.username || "T")[0]}
              </div>
              <h3 className="text-lg font-semibold mb-1">{tutor.username || "Tutor"}</h3>
              <p className="text-gray-600 text-sm mb-1">
                Location: {tutor.location || "Not available"}
              </p>
              <p className="text-gray-600 text-sm mb-1">
                Bio: {tutor.bio && tutor.bio.trim() !== "" ? tutor.bio : "Not available"}
              </p>
              <p className="text-gray-600 text-sm mb-1">
                Education: {tutor.education && tutor.education.trim() !== "" ? tutor.education : "Not available"}
              </p>
              <p className="text-gray-600 text-sm mb-1">
                Experience: {tutor.experience && tutor.experience.trim() !== "" ? tutor.experience : "Not available"}
              </p>
              <a
                href={`/tutors/${tutor.id}`}
                className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
              >
                View Profile
              </a>
            </div>
          ))}
        </div>
      )}

      {tutors.length === 0 && !loading && hasSearched && (
        <p className="text-center text-gray-500 mt-10">No tutors found near your location.</p>
      )}
    </div>
  );
};

export default TutorMapSearch;
