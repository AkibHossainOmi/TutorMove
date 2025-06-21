

import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";

const mockData = {
  gigs: [
    { id: 1, title: "Math Tutor in Dhaka", location: "Dhaka", lat: 23.8103, lng: 90.4125 },
    { id: 2, title: "English Tutor in Chattogram", location: "Chattogram", lat: 22.3569, lng: 91.7832 },
  ],
  jobs: [
    { id: 1, title: "Need a Physics Tutor", location: "Dhaka", lat: 23.8103, lng: 90.4125 },
    { id: 2, title: "Looking for Chemistry Help", location: "Sylhet", lat: 24.8949, lng: 91.8687 },
  ],
};

function MapSearch({ mode = "gigs", radiusKm = 20 }) {
  // Allow URL param override
  const [searchParams] = useSearchParams();
  const urlMode = searchParams.get("mode") || mode;

  // In real implementation, replace with actual geolocation search
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(mockData[urlMode] || []);

  const handleSearch = (e) => {
    e.preventDefault();
    // Simple mock filter
    setResults(
      (mockData[urlMode] || []).filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase())
      )
    );
  };

  return (
    <div style={{ padding: "40px 20px", maxWidth: 800, margin: "0 auto" }}>
      <h1>
        {urlMode === "jobs" ? "Search Teaching Jobs on Map" : "Find Tutors on Map"}
      </h1>
      <form
        style={{ display: "flex", gap: 12, marginBottom: 32 }}
        onSubmit={handleSearch}
      >
        <input
          type="text"
          placeholder={urlMode === "jobs" ? "Job title or location..." : "Tutor or subject..."}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            flex: 1,
            padding: "10px 16px",
            borderRadius: 8,
            border: "1px solid #ccc",
            fontSize: 16,
          }}
        />
        <button
          type="submit"
          style={{
            padding: "10px 18px",
            borderRadius: 8,
            border: "none",
            background: "#007bff",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Search
        </button>
      </form>
      <div>
        {results.length === 0 ? (
          <div style={{ color: "#888" }}>No results found.</div>
        ) : (
          <ul style={{ padding: 0, listStyle: "none" }}>
            {results.map((item) => (
              <li
                key={item.id}
                style={{
                  background: "#f9f9f9",
                  marginBottom: 16,
                  borderRadius: 12,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  padding: "18px 20px",
                  fontSize: 18,
                }}
              >
                <strong>{item.title}</strong>
                <div style={{ color: "#666", marginTop: 4 }}>
                  Location: {item.location}
                </div>
                {/* You can add a "View on Map" button here */}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div style={{ marginTop: 40, fontSize: 14, color: "#aaa" }}>
        <em>
          (Map visualization and real geolocation filtering coming soon!)
        </em>
      </div>
    </div>
  );
}

export default MapSearch;
