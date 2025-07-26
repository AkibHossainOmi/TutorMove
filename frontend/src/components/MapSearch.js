import React, { useState, useEffect } from "react";
import axios from "axios";
import { tutorAPI } from "../utils/apiService";

const SEARCH_RADIUS_KM = 20;

const TutorMapSearch = () => {
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/subjects`);
        const activeSubjects = res.data.filter((s) => s.is_active);
        setSubjects(activeSubjects);
      } catch (err) {
        console.error("Failed to fetch subjects", err);
      }
    };
    fetchSubjects();
  }, []);

  const fetchSuggestions = async (text) => {
    if (text.length < 3) return;
    try {
      const res = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: { q: text, format: "json", limit: 5 },
      });
      setSuggestions(res.data);
      setShowSuggestions(true);
    } catch {
      setSuggestions([]);
      setShowSuggestions(false);
    }
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
        location: selectedLocation ? selectedLocation.display_name : "",
        subject: subject.trim(),
        radius_km: SEARCH_RADIUS_KM,
      });
      setTutors(res.data.results || []);
      setHasSearched(true);
    } catch (err) {
      setError("Failed to fetch tutors");
      setTutors([]);
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 960, margin: "40px auto", padding: "0 16px", fontFamily: "Segoe UI, sans-serif" }}>
      <h1 style={{ textAlign: "center", fontSize: "2rem", fontWeight: 600, marginBottom: 30 }}>
        Search Tutors by Location & Subject
      </h1>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24, justifyContent: "center" }}>
        {/* Location Input */}
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <input
            type="text"
            value={query}
            placeholder="Enter location..."
            onChange={(e) => {
              setQuery(e.target.value);
              fetchSuggestions(e.target.value);
              if (e.target.value.trim() === "") setSelectedLocation(null);
            }}
            onFocus={() => setShowSuggestions(true)}
            style={{
              width: "100%",
              padding: "12px 14px",
              fontSize: 15,
              border: "1.5px solid #ccc",
              borderRadius: 8,
              outline: "none",
            }}
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: 8,
                zIndex: 20,
                maxHeight: 200,
                overflowY: "auto",
                marginTop: 4,
                listStyle: "none",
                padding: 0,
              }}
            >
              {suggestions.map((sugg) => (
                <li
                  key={sugg.place_id}
                  onClick={() => {
                    setSelectedLocation(sugg);
                    setQuery(sugg.display_name);
                    setShowSuggestions(false);
                  }}
                  style={{
                    padding: "10px 12px",
                    borderBottom: "1px solid #eee",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f5faff")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {sugg.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Subject Dropdown */}
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          style={{
            flex: 1,
            minWidth: 180,
            padding: "12px 14px",
            fontSize: 15,
            border: "1.5px solid #ccc",
            borderRadius: 8,
            background: "#fff",
          }}
        >
          <option value="">Select subject...</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.name}> {/* Use `s.name` or `s.id` */}
              {s.name}
            </option>
          ))}
        </select>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={loading}
          style={{
            padding: "12px 20px",
            fontSize: 15,
            backgroundColor: loading ? "#ccc" : "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {error && (
        <div style={{ color: "red", textAlign: "center", fontSize: 14, marginBottom: 16 }}>{error}</div>
      )}

      {tutors.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 20,
            marginTop: 30,
          }}
        >
          {tutors.map((tutor) => (
            <div
              key={tutor.id}
              style={{
                padding: 20,
                backgroundColor: "#fff",
                borderRadius: 12,
                border: "1px solid #ddd",
                boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  fontSize: 26,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px",
                  textTransform: "uppercase",
                }}
              >
                {(tutor.username || "T")[0]}
              </div>
              <h3 style={{ fontSize: 17, marginBottom: 6 }}>{tutor.username || "Tutor"}</h3>
              <p style={{ fontSize: 14, color: "#555", margin: "4px 0" }}>
                Location: {tutor.location || "Unknown"}
              </p>
              <p style={{ fontSize: 14, color: "#555", margin: "4px 0" }}>
                Trust Score: {tutor.trust_score ?? 0}
              </p>
              <a
                href={`/tutors/${tutor.id}`}
                style={{
                  display: "inline-block",
                  marginTop: 10,
                  padding: "8px 16px",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  textDecoration: "none",
                  borderRadius: 6,
                  fontWeight: 500,
                }}
              >
                View Profile
              </a>
            </div>
          ))}
        </div>
      )}

      {tutors.length === 0 && !loading && hasSearched && (
        <p style={{ marginTop: 40, textAlign: "center", color: "#777" }}>
          No tutors found near your location.
        </p>
      )}
    </div>
  );
};

export default TutorMapSearch;
