import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "@changey/react-leaflet-markercluster";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "@changey/react-leaflet-markercluster/dist/styles.min.css";

const DEFAULT_CENTER = [23.8103, 90.4125]; // Dhaka, Bangladesh
const DEFAULT_ZOOM = 12;
const SEARCH_RADIUS_KM = 20;

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const LocationSearch = ({
  query,
  setQuery,
  suggestions,
  setSuggestions,
  showSuggestions,
  setShowSuggestions,
  onSelectSuggestion,
}) => {
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setShowSuggestions]);

  const handleChange = async (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      const res = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: { q: val, format: "json", limit: 5 },
      });
      setSuggestions(res.data);
      setShowSuggestions(true);
    } catch {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  return (
    <div
      ref={wrapperRef}
      style={{
        position: "relative",
        flexGrow: 1,
        maxWidth: "100%",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <input
        type="text"
        placeholder="Enter location..."
        value={query}
        onChange={handleChange}
        onFocus={() => setShowSuggestions(true)}
        aria-label="Search location"
        style={{
          width: "100%",
          padding: "12px 14px",
          fontSize: 16,
          borderRadius: 6,
          border: "1.5px solid #ccc",
          outline: "none",
          boxSizing: "border-box",
          transition: "border-color 0.25s ease",
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && suggestions.length > 0) {
            e.preventDefault();
            onSelectSuggestion(suggestions[0]);
            setShowSuggestions(false);
          }
        }}
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul
          role="listbox"
          aria-label="Location suggestions"
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            backgroundColor: "#fff",
            border: "1.5px solid #ddd",
            borderRadius: 6,
            maxHeight: 180,
            overflowY: "auto",
            margin: 0,
            padding: 0,
            listStyle: "none",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            zIndex: 1000,
          }}
        >
          {suggestions.map((loc) => (
            <li
              key={loc.place_id}
              onClick={() => {
                onSelectSuggestion(loc);
                setQuery(loc.display_name);
                setShowSuggestions(false);
              }}
              role="option"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onSelectSuggestion(loc);
                  setQuery(loc.display_name);
                  setShowSuggestions(false);
                }
              }}
              style={{
                padding: "10px 12px",
                cursor: "pointer",
                borderBottom: "1px solid #eee",
                fontSize: 14,
                color: "#333",
                userSelect: "none",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#f5faff")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              {loc.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const StarRating = ({ rating = 5 }) => {
  // Just show filled stars up to rating (max 5)
  const stars = Array(5)
    .fill(0)
    .map((_, i) => (
      <svg
        key={i}
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={i < rating ? "#ffb400" : "#ddd"}
        stroke="#ffb400"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ marginRight: 2 }}
        aria-hidden="true"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ));
  return <div style={{ display: "flex" }}>{stars}</div>;
};

export default function TutorMapSearch() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!selectedLocation) {
      setError("Please select a location from suggestions.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/api/search-tutors/", {
        location: selectedLocation.display_name,
        radius_km: SEARCH_RADIUS_KM,
      });
      setTutors(res.data.results || []);
      setCenter([parseFloat(selectedLocation.lat), parseFloat(selectedLocation.lon)]);
      setZoom(14);
    } catch {
      setError("Failed to load tutors.");
      setTutors([]);
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  };

  const handleSelectSuggestion = (loc) => {
    setSelectedLocation(loc);
    setQuery(loc.display_name);
    setShowSuggestions(false);
  };

  return (
    <div
      style={{
        maxWidth: 960,
        margin: "40px auto",
        padding: 24,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: "#222",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          marginBottom: 32,
          fontWeight: 700,
          fontSize: "2rem",
          color: "#111",
        }}
      >
        Find Tutors Within {SEARCH_RADIUS_KM} km
      </h1>

      {/* Search row */}
      <div
        style={{
          display: "flex",
          gap: 12,
          maxWidth: 600,
          margin: "0 auto",
          alignItems: "center",
        }}
      >
        <LocationSearch
          query={query}
          setQuery={setQuery}
          suggestions={suggestions}
          setSuggestions={setSuggestions}
          showSuggestions={showSuggestions}
          setShowSuggestions={setShowSuggestions}
          onSelectSuggestion={handleSelectSuggestion}
        />
        <button
          onClick={handleSearch}
          disabled={loading || !selectedLocation}
          style={{
            padding: "12px 28px",
            backgroundColor: loading || !selectedLocation ? "#ccc" : "#007bff",
            color: loading || !selectedLocation ? "#666" : "#fff",
            fontWeight: 600,
            fontSize: 16,
            borderRadius: 6,
            border: "none",
            cursor: loading || !selectedLocation ? "not-allowed" : "pointer",
            boxShadow: loading || !selectedLocation ? "none" : "0 2px 8px rgb(0 123 255 / 0.6)",
            transition: "background-color 0.3s ease",
          }}
          aria-disabled={loading || !selectedLocation}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* Map */}
      <div
        style={{
          height: 400,
          marginTop: 30,
          borderRadius: 10,
          overflow: "hidden",
          boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
        }}
      >
        <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MarkerClusterGroup>
            {tutors.map((tutor) => {
              if (!tutor.latitude || !tutor.longitude) return null;
              return (
                <Marker key={tutor.id} position={[tutor.latitude, tutor.longitude]}>
                  <Popup>
                    <div style={{ fontSize: 14 }}>
                      <strong style={{ color: "#007bff" }}>
                        {tutor.username || tutor.name || "Tutor"}
                      </strong>
                      <br />
                      Location: {tutor.location || "Unknown"}
                      <br />
                      <a
                        href={`/tutors/${tutor.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#007bff", textDecoration: "underline" }}
                      >
                        View Profile
                      </a>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MarkerClusterGroup>
        </MapContainer>
      </div>

      {/* Error message */}
      {error && (
        <p
          role="alert"
          style={{
            color: "#d93025",
            textAlign: "center",
            marginTop: 20,
            fontWeight: 600,
          }}
        >
          {error}
        </p>
      )}

      {/* Tutors Grid */}
      {hasSearched && tutors.length > 0 && (
        <section
          aria-live="polite"
          style={{
            marginTop: 36,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
            gap: 24,
          }}
        >
          {tutors.map((tutor) => (
            <article
              key={tutor.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 16,
                boxShadow: "0 1px 6px rgb(0 0 0 / 0.07)",
                backgroundColor: "#fff",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                transition: "box-shadow 0.3s ease",
              }}
              tabIndex={0}
              onFocus={(e) =>
                (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,123,255,0.3)")
              }
              onBlur={(e) =>
                (e.currentTarget.style.boxShadow = "0 1px 6px rgb(0 0 0 / 0.07)")
              }
            >
              {/* Avatar placeholder */}
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  fontWeight: "700",
                  fontSize: 28,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  userSelect: "none",
                  marginBottom: 14,
                  textTransform: "uppercase",
                  boxShadow: "0 2px 8px rgba(0,123,255,0.25)",
                }}
                aria-label={`Avatar of ${tutor.username || tutor.name || "Tutor"}`}
              >
                {(tutor.username || tutor.name || "T").slice(0, 1)}
              </div>

              <h3
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#111",
                  marginBottom: 6,
                }}
              >
                {tutor.username || tutor.name || "Tutor"}
              </h3>

              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  color: "#666",
                  marginBottom: 8,
                }}
                title={tutor.location}
              >
                {tutor.location || "Location not provided"}
              </p>

              <StarRating rating={4 + (tutor.trust_score ? tutor.trust_score * 1 : 0)} />

              <a
                href={`/tutors/${tutor.id}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  marginTop: 14,
                  padding: "8px 20px",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  borderRadius: 6,
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: 14,
                  boxShadow: "0 3px 8px rgba(0,123,255,0.4)",
                  transition: "background-color 0.25s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#0056b3")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#007bff")
                }
              >
                View Profile
              </a>
            </article>
          ))}
        </section>
      )}

      {hasSearched && !loading && tutors.length === 0 && !error && (
        <p
          style={{
            textAlign: "center",
            marginTop: 40,
            color: "#555",
            fontStyle: "italic",
            fontSize: 16,
          }}
          aria-live="polite"
        >
          No tutors found for this location.
        </p>
      )}
    </div>
  );
}
