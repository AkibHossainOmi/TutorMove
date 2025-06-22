import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import MarkerClusterGroup from "@changey/react-leaflet-markercluster";
import { Link } from "react-router-dom";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css"; // Ensure Leaflet's base CSS is imported
import "@changey/react-leaflet-markercluster/dist/styles.min.css"; // Marker cluster CSS

const DEFAULT_CENTER = [23.8103, 90.4125]; // Dhaka, Bangladesh
const DEFAULT_ZOOM = 12;
const DEFAULT_RADIUS = 20; // km

// Fix for default Leaflet icons (required for Webpack/CRA setups)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Geocoder Input Component
const GeocoderInput = ({ onSelect }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false); // More descriptive name

  // Ref to close suggestions when clicking outside
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      const res = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: {
          q: value,
          format: "json",
          addressdetails: 1,
          limit: 5,
        },
      });
      setSuggestions(res.data);
      setShowSuggestions(true);
    } catch (err) {
      console.error("Geocoder error:", err);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Inline styles for GeocoderInput
  const inputContainerStyle = {
    position: "relative",
    zIndex: 1500, // Ensure it's above map but below modals
    width: "100%", // Take full width of its parent flex item
    maxWidth: "350px", // Limit max width
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 15px",
    fontSize: "16px",
    border: "1.5px solid #007bff",
    borderRadius: "8px", // Slightly more rounded
    outline: "none",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)", // Subtle shadow
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  };

  const inputFocusStyle = {
    borderColor: "#0056b3",
    boxShadow: "0 0 0 3px rgba(0, 123, 255, 0.2)",
  };

  const suggestionsListStyle = {
    position: "absolute",
    top: "calc(100% + 5px)", // Position below input
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    border: "1px solid #ddd",
    borderRadius: "8px", // Consistent rounding
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    maxHeight: "200px",
    overflowY: "auto",
    listStyle: "none",
    padding: 0,
    margin: 0,
  };

  const suggestionItemStyle = {
    padding: "12px 15px",
    cursor: "pointer",
    borderBottom: "1px solid #eee",
    transition: "background-color 0.2s ease",
    fontSize: "15px",
    color: "#333",
  };

  const suggestionItemHoverStyle = {
    backgroundColor: "#f0f8ff", // Light blue on hover
    color: '#007bff',
  };

  return (
    <div ref={wrapperRef} style={inputContainerStyle}>
      <input
        type="text"
        placeholder="Search by city, area, or address..."
        value={query}
        onChange={handleSearch}
        onFocus={() => setShowSuggestions(true)} // Show on focus
        style={inputStyle}
        onMouseEnter={(e) => Object.assign(e.currentTarget.style, inputFocusStyle)}
        onMouseLeave={(e) => Object.assign(e.currentTarget.style, inputStyle)}
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul style={suggestionsListStyle}>
          {suggestions.map((s, i) => (
            <li
              key={s.place_id} // Use unique place_id if available, fallback to index
              onClick={() => {
                onSelect(s);
                setShowSuggestions(false);
                setQuery(s.display_name); // Set input to full name
              }}
              style={suggestionItemStyle}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, suggestionItemHoverStyle)}
              onMouseLeave={(e) => Object.assign(e.currentTarget.style, suggestionItemStyle)}
            >
              {s.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Map Move Events Hook
const MapMoveEvents = ({ onMove }) => {
  useMapEvents({
    moveend: (e) => {
      const map = e.target;
      const center = map.getCenter();
      onMove(center.lat, center.lng, map.getZoom());
    },
    // Optionally add zoomend if you want to react to zoom changes separately
    // zoomend: (e) => { ... }
  });
  return null;
};

// Main MapSearch Component
export default function MapSearch({
  mode = "gigs", // or "jobs"
  radiusKm = DEFAULT_RADIUS,
}) {
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // State for error messages

  // Load gigs or jobs by map position
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null); // Clear previous errors
      let url = mode === "jobs" ? "/api/jobs/" : "/api/gigs/";
      try {
        const res = await axios.get(url, {
          params: {
            lat: center[0],
            lng: center[1],
            radius_km: radiusKm,
            // Include pagination params if your API supports them, e.g.:
            // page: 1,
            // page_size: 100 // Fetch a reasonable number for map display
          },
        });
        // Ensure data is always an array
        setItems(Array.isArray(res.data) ? res.data : res.data.results || []);
      } catch (err) {
        console.error("API fetch error:", err);
        setError(`Failed to load ${mode}. Please try again.`);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [center, radiusKm, mode]); // Re-fetch when center, radius, or mode changes

  // On location search selection (from GeocoderInput)
  const handleSelectLocation = (location) => {
    setCenter([parseFloat(location.lat), parseFloat(location.lon)]);
    setZoom(14); // Zoom in closer on selected location
  };

  // On map movement (from MapMoveEvents)
  const handleMapMove = (lat, lng, newZoom) => {
    // Only update center if it significantly changes to avoid excessive API calls
    // You might want a debounce here for heavy API usage
    setCenter([lat, lng]);
    setZoom(newZoom);
  };

  // Inline styles for the main component
  const mainContainerStyle = {
    padding: "30px",
    maxWidth: "1000px", // Slightly larger max-width
    margin: "0 auto",
    backgroundColor: "#fcfcfc", // A very light almost-white background
    borderRadius: "15px", // More prominent rounding
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.1)", // Deeper shadow
    fontFamily: '"Segoe UI", Arial, sans-serif',
    color: "#333",
    boxSizing: 'border-box', // Include padding in width calculation
  };

  const controlsContainerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "15px", // More spacing
    marginBottom: "25px",
    flexWrap: "wrap", // Allow controls to wrap on smaller screens
    justifyContent: 'center', // Center controls when wrapped
  };

  const mapFrameStyle = {
    width: "100%",
    height: "500px", // Taller map for better viewing
    borderRadius: "12px", // Consistent rounding
    overflow: "hidden", // Ensures map content stays within bounds
    border: "2px solid #007bff", // Primary color border
    marginBottom: "30px",
    boxShadow: "0 4px 15px rgba(0, 123, 255, 0.15)", // Shadow matching primary color
  };

  const loadingMessageStyle = {
    textAlign: "center",
    color: "#007bff", // Primary blue color
    fontWeight: "bold",
    padding: "20px",
    fontSize: "1.1em",
    backgroundColor: '#e6f2ff', // Light blue background
    borderRadius: '8px',
    margin: '20px 0',
  };

  const errorMessageStyle = {
    textAlign: "center",
    color: "#dc3545", // Red for errors
    padding: "20px",
    fontSize: "1.1em",
    backgroundColor: '#f8d7da', // Light red background
    border: '1px solid #f5c6cb',
    borderRadius: '8px',
    margin: '20px 0',
  };

  const noResultsStyle = {
    textAlign: "center",
    color: "#6c757d", // Gray for no results
    padding: "20px",
    fontSize: "1.1em",
    backgroundColor: '#f0f2f5', // Light gray background
    borderRadius: '8px',
    margin: '20px 0',
  };

  const resultsListContainerStyle = {
    marginTop: '30px',
    borderTop: '1px solid #eee',
    paddingTop: '20px',
  };

  const resultsListHeadingStyle = {
    fontSize: '2em',
    color: '#2c3e50',
    fontWeight: '700',
    marginBottom: '25px',
    textAlign: 'center',
  };

  const resultGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', // Responsive grid
    gap: '25px', // Spacing between cards
    padding: '10px 0',
  };

  const resultCardStyle = {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    cursor: 'pointer',
    border: '1px solid #e0e0e0',
  };

  const resultCardHoverStyle = {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
  };

  const cardContentStyle = {
    padding: '20px',
    flexGrow: 1, // Allows content to fill space
  };

  const cardTitleStyle = {
    fontSize: '1.4em',
    fontWeight: '600',
    color: '#34495e',
    marginBottom: '10px',
    lineHeight: '1.3em',
  };

  const cardDetailStyle = {
    fontSize: '0.95em',
    color: '#6c757d',
    marginBottom: '5px',
  };

  const viewLinkStyle = {
    display: 'inline-block',
    marginTop: '15px',
    padding: '8px 15px',
    backgroundColor: '#007bff',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '6px',
    fontSize: '0.9em',
    fontWeight: '500',
    transition: 'background-color 0.2s ease',
  };

  const viewLinkHoverStyle = {
    backgroundColor: '#0056b3',
  };

  return (
    <div style={mainContainerStyle}>
      <h2 style={{ fontSize: '2.5em', fontWeight: '700', color: '#2c3e50', marginBottom: '25px', textAlign: 'center' }}>
        {mode === "jobs" ? "Discover Teaching Jobs on Map" : "Explore Tutors by Location"}
      </h2>

      <div style={controlsContainerStyle}>
        <GeocoderInput onSelect={handleSelectLocation} />
        <span style={{ color: "#555", fontSize: "1.1em", fontWeight: "500" }}>
          Showing {mode === "jobs" ? "jobs" : "tutors"} within <strong style={{ color: '#007bff' }}>{radiusKm} km</strong> of the map center.
        </span>
      </div>

      <div style={mapFrameStyle}>
        <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapMoveEvents onMove={handleMapMove} />
          <MarkerClusterGroup>
            {items.map(item => {
              // Safely get lat/lng from different possible property names
              const lat = item.latitude || item.lat;
              const lng = item.longitude || item.lng;

              if (typeof lat !== 'number' || typeof lng !== 'number') {
                  console.warn(`Item ${item.id} has invalid coordinates: lat=${lat}, lng=${lng}`);
                  return null; // Skip invalid markers
              }

              return (
                <Marker key={item.id} position={[lat, lng]}>
                  <Popup>
                    <div style={{ padding: '5px', fontFamily: '"Segoe UI", Arial, sans-serif' }}>
                      {mode === "jobs" ? (
                        <>
                          <b style={{ color: '#007bff', fontSize: '1.1em' }}>{item.title}</b><br />
                          <span style={{ fontSize: '0.9em', color: '#555' }}>Subject: {item.subject}</span><br />
                          <Link
                            to={`/jobs/${item.id}`}
                            style={viewLinkStyle}
                            onMouseEnter={(e) => Object.assign(e.currentTarget.style, viewLinkHoverStyle)}
                            onMouseLeave={(e) => Object.assign(e.currentTarget.style, viewLinkStyle)}
                          >
                            View Job
                          </Link>
                        </>
                      ) : (
                        <>
                          <b style={{ color: '#007bff', fontSize: '1.1em' }}>{item.teacher?.username || item.username || "Tutor"}</b><br />
                          <span style={{ fontSize: '0.9em', color: '#555' }}>
                            Subjects: {item.subjects?.map(s => s.name).join(", ") || 'N/A'}
                          </span><br />
                          <Link
                            to={`/tutors/${item.teacher?.id || item.id}`}
                            style={viewLinkStyle}
                            onMouseEnter={(e) => Object.assign(e.currentTarget.style, viewLinkHoverStyle)}
                            onMouseLeave={(e) => Object.assign(e.currentTarget.style, viewLinkStyle)}
                          >
                            View Profile
                          </Link>
                        </>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MarkerClusterGroup>
        </MapContainer>
      </div>

      {loading && (
        <div style={loadingMessageStyle}>
          Loading {mode === "jobs" ? "jobs" : "tutors"} near you...
        </div>
      )}
      {error && (
        <div style={errorMessageStyle}>
          {error}
        </div>
      )}
      {!loading && !error && items.length === 0 && (
        <div style={noResultsStyle}>
          No {mode === "jobs" ? "jobs" : "tutors"} found in this area. Try searching a different location or zooming out!
        </div>
      )}

      {/* Display a list of results below the map */}
      {!loading && !error && items.length > 0 && (
        <div style={resultsListContainerStyle}>
          <h3 style={resultsListHeadingStyle}>
            {mode === "jobs" ? "Available Jobs" : "Available Tutors"}
          </h3>
          <div style={resultGridStyle}>
            {items.map(item => (
              <div
                key={item.id}
                style={resultCardStyle}
                onMouseEnter={(e) => Object.assign(e.currentTarget.style, resultCardHoverStyle)}
                onMouseLeave={(e) => Object.assign(e.currentTarget.style, resultCardStyle)}
              >
                <div style={cardContentStyle}>
                  <h4 style={cardTitleStyle}>
                    {mode === "jobs" ? item.title : (item.teacher?.username || item.username || "Tutor")}
                  </h4>
                  <p style={cardDetailStyle}>
                    <strong style={{ color: '#495057' }}>{mode === "jobs" ? "Subject:" : "Expertise:"}</strong> {mode === "jobs" ? item.subject : (item.subjects?.map(s => s.name).join(", ") || 'N/A')}
                  </p>
                  <p style={cardDetailStyle}>
                    <strong style={{ color: '#495057' }}>Location:</strong> {item.location || 'Not specified'}
                  </p>
                </div>
                {mode === "jobs" ? (
                  <Link
                    to={`/jobs/${item.id}`}
                    style={{ ...viewLinkStyle, textAlign: 'center', margin: '0 20px 20px', display: 'block' }}
                    onMouseEnter={(e) => Object.assign(e.currentTarget.style, viewLinkHoverStyle)}
                    onMouseLeave={(e) => Object.assign(e.currentTarget.style, viewLinkStyle)}
                  >
                    View Job
                  </Link>
                ) : (
                  <Link
                    to={`/tutors/${item.teacher?.id || item.id}`}
                    style={{ ...viewLinkStyle, textAlign: 'center', margin: '0 20px 20px', display: 'block' }}
                    onMouseEnter={(e) => Object.assign(e.currentTarget.style, viewLinkHoverStyle)}
                    onMouseLeave={(e) => Object.assign(e.currentTarget.style, viewLinkStyle)}
                  >
                    View Profile
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}