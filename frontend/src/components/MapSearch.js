import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import MarkerClusterGroup from "@changey/react-leaflet-markercluster"; 
import { Link } from "react-router-dom";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "@changey/react-leaflet-markercluster/dist/styles.min.css";

const DEFAULT_CENTER = [23.8103, 90.4125]; // Dhaka as default, change as needed
const DEFAULT_ZOOM = 12;
const DEFAULT_RADIUS = 20; // km

// Simple icon fix for Leaflet in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Geocoder input (Nominatim OSM)
const GeocoderInput = ({ onSelect }) => {
  const [q, setQ] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [show, setShow] = useState(false);

  const handleSearch = async (e) => {
    setQ(e.target.value);
    if (e.target.value.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: {
          q: e.target.value,
          format: "json",
          addressdetails: 1,
          limit: 5,
        },
      });
      setSuggestions(res.data);
      setShow(true);
    } catch {
      setSuggestions([]);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <input
        type="text"
        placeholder="Search location (city, area)..."
        value={q}
        onChange={handleSearch}
        style={{
          width: "320px",
          padding: "10px",
          fontSize: "16px",
          border: "1.5px solid #007bff",
          borderRadius: "5px",
          outline: "none"
        }}
      />
      {show && suggestions.length > 0 && (
        <div style={{
          position: "absolute", top: "44px", left: 0, right: 0,
          background: "#fff", border: "1px solid #ddd", zIndex: 2000,
          borderRadius: "0 0 6px 6px"
        }}>
          {suggestions.map((s, i) => (
            <div key={i}
              onClick={() => { onSelect(s); setShow(false); setQ(s.display_name); }}
              style={{ padding: "10px", cursor: "pointer", borderBottom: i < suggestions.length - 1 ? "1px solid #eee" : "none" }}
            >
              {s.display_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// A hook for capturing map movement and reporting bounds
const MapMoveEvents = ({ onMove }) => {
  useMapEvents({
    moveend: (e) => {
      const map = e.target;
      const center = map.getCenter();
      onMove(center.lat, center.lng, map.getZoom());
    },
  });
  return null;
};

export default function MapSearch({
  mode = "gigs", // or "jobs"
  radiusKm = DEFAULT_RADIUS
}) {
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load gigs or jobs by map position
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      let url = mode === "jobs" ? "/api/jobs/" : "/api/gigs/";
      try {
        const res = await axios.get(url, {
          params: {
            lat: center[0],
            lng: center[1],
            radius_km: radiusKm
          }
        });
        setItems(Array.isArray(res.data) ? res.data : res.data.results || []);
      } catch {
        setItems([]);
      }
      setLoading(false);
    };
    fetchData();
  }, [center, radiusKm, mode]);

  // On location search selection
  const handleSelectLocation = (location) => {
    setCenter([parseFloat(location.lat), parseFloat(location.lon)]);
    setZoom(14);
  };

  // On map move
  const handleMapMove = (lat, lng, zoom) => {
    setCenter([lat, lng]);
    setZoom(zoom);
  };

  return (
    <div>
      <div style={{
        display: "flex", alignItems: "center", gap: 12, marginBottom: 15,
        flexWrap: "wrap"
      }}>
        <GeocoderInput onSelect={handleSelectLocation} />
        <span style={{ color: "#007bff" }}>
          Showing {mode === "jobs" ? "jobs" : "tutors"} within {radiusKm} km
        </span>
      </div>

      <div style={{
        width: "100%", height: "450px", borderRadius: "10px",
        overflow: "hidden", border: "1.5px solid #007bff", marginBottom: 30
      }}>
        <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapMoveEvents onMove={handleMapMove} />
          <MarkerClusterGroup>
            {items.map(item => {
              // Assume gig/job has latitude, longitude, and id/username/title
              const lat = item.latitude || item.lat;
              const lng = item.longitude || item.lng;
              if (!lat || !lng) return null;
              return (
                <Marker key={item.id} position={[lat, lng]}>
                  <Popup>
                    {mode === "jobs" ? (
                      <>
                        <b>{item.title}</b><br />
                        <span>{item.subject}</span><br />
                        <Link to={`/jobs/${item.id}`} style={{ color: "#007bff" }}>
                          View Job
                        </Link>
                      </>
                    ) : (
                      <>
                        <b>{item.teacher?.username || item.username || "Tutor"}</b><br />
                        <span>{item.subjects?.map(s => s.name).join(", ")}</span><br />
                        <Link to={`/tutors/${item.teacher?.id || item.id}`} style={{ color: "#007bff" }}>
                          View Profile
                        </Link>
                      </>
                    )}
                  </Popup>
                </Marker>
              );
            })}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
      {loading && (
        <div style={{
          textAlign: "center", color: "#007bff", fontWeight: "bold",
          padding: "15px"
        }}>
          Loading {mode === "jobs" ? "jobs" : "tutors"} near you...
        </div>
      )}
      {!loading && items.length === 0 && (
        <div style={{ textAlign: "center", color: "#dc3545", padding: "15px" }}>
          No {mode === "jobs" ? "jobs" : "tutors"} found in this area.
        </div>
      )}
    </div>
  );
}
