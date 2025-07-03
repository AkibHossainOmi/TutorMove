import React, { useState, useEffect } from "react";
import axios from "axios";

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
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/search-tutors/`, {
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
    <div style={{ maxWidth: 960, margin: "40px auto", padding: 24, fontFamily: "Segoe UI, sans-serif" }}>
      <h1 style={{ textAlign: "center", fontSize: "2rem", fontWeight: 700, marginBottom: 30 }}>
        Find Tutors by Location and Subject
      </h1>

      {/* Input Fields */}
      <div style={{ display: "flex", gap: 10, maxWidth: 700, margin: "0 auto", marginBottom: 20 }}>
        <div style={{ flexGrow: 1, position: "relative" }}>
          <input
            type="text"
            placeholder="Enter location..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              fetchSuggestions(e.target.value);
              if (e.target.value.trim() === "") {
                setSelectedLocation(null);
              }
            }}            
            onFocus={() => setShowSuggestions(true)}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 8,
              border: "1.5px solid #ccc",
              fontSize: 16,
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
                maxHeight: 200,
                overflowY: "auto",
                marginTop: 4,
                padding: 0,
                listStyle: "none",
                zIndex: 10,
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
                    cursor: "pointer",
                    borderBottom: "1px solid #eee",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f8ff")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {sugg.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          style={{
            flexGrow: 1,
            padding: "12px 16px",
            borderRadius: 8,
            border: "1.5px solid #ccc",
            fontSize: 16,
          }}
        >
          <option value="">Select subject...</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.aliases}>
              {s.name}
            </option>
          ))}
        </select>

        <button
          onClick={handleSearch}
          disabled={loading}
          style={{
            padding: "12px 24px",
            backgroundColor: loading ? "#ccc" : "#007bff",
            color: "#fff",
            borderRadius: 8,
            border: "none",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* Error */}
      {error && <p style={{ color: "red", textAlign: "center", marginTop: 10 }}>{error}</p>}

      {/* Tutors List */}
      {tutors.length > 0 && (
        <div
          style={{
            marginTop: 30,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 24,
          }}
        >
          {tutors.map((tutor) => (
            <div
              key={tutor.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 10,
                padding: 20,
                textAlign: "center",
                background: "#fff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              <div
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: "50%",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  fontSize: 28,
                  fontWeight: 700,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  margin: "0 auto 14px auto",
                  textTransform: "uppercase",
                }}
                aria-label={`Avatar for ${tutor.username || "Tutor"}`}
              >
                {(tutor.username || "T")[0]}
              </div>
              <h3 style={{ margin: 0, fontSize: 18 }}>{tutor.username || "Tutor"}</h3>
              <p style={{ color: "#666", fontSize: 14, margin: "4px 0" }}>
                Location: {tutor.location || "Unknown"}
              </p>
              <p style={{ color: "#666", fontSize: 14, margin: "4px 0" }}>
                Trust Score: {tutor.trust_score ?? 0}
              </p>
              <a
                href={`/tutors/${tutor.id}`}
                style={{
                  marginTop: 10,
                  display: "inline-block",
                  padding: "8px 16px",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  textDecoration: "none",
                  borderRadius: 6,
                  fontWeight: 600,
                }}
              >
                View Profile
              </a>
            </div>
          ))}
        </div>
      )}

      {/* No tutors message only after search */}
      {tutors.length === 0 && !loading && hasSearched && (
        <p style={{ marginTop: 40, textAlign: "center", color: "#777" }}>No tutors found</p>
      )}
    </div>
  );
};

export default TutorMapSearch;
