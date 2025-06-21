import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import SearchBar from '../components/SearchBar';
import MapSearch from '../components/MapSearch'; // <-- Import the map search!

const Home = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Optionally allow toggling between "Text" and "Map" search
  const [tab, setTab] = useState('map'); // or 'map'

  const handleSearch = async ({ subject, location }) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (subject) params.append('subject', subject);
      if (location) params.append('location', location);

      const response = await axios.get(`/api/tutors/search/?${params.toString()}`);
      setSearchResults(response.data);
    } catch (err) {
      setError('Failed to fetch tutors. Please try again.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Welcome to TutorMove</h1>

      {/* Tab UI to switch between Text and Map search */}
      <div style={{ display: "flex", gap: 14, marginBottom: 16 }}>
        <button
          onClick={() => setTab('text')}
          style={{
            background: tab === 'text' ? '#007bff' : '#f8f9fa',
            color: tab === 'text' ? 'white' : '#007bff',
            border: '1px solid #007bff',
            borderRadius: 5,
            padding: '8px 24px',
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          Search by Text
        </button>
        <button
          onClick={() => setTab('map')}
          style={{
            background: tab === 'map' ? '#007bff' : '#f8f9fa',
            color: tab === 'map' ? 'white' : '#007bff',
            border: '1px solid #007bff',
            borderRadius: 5,
            padding: '8px 24px',
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          Search on Map
        </button>
      </div>

      {/* --- Text Search UI --- */}
      {tab === 'text' && (
        <>
          <SearchBar onSearch={handleSearch} />
          <div style={{ marginTop: 24 }}>
            {loading && <p>Searching...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {!loading && !error && searchResults.length > 0 ? (
              <ul>
                {searchResults.map((tutor) => (
                  <li key={tutor.id}>
                    <Link to={`/tutors/${tutor.id}`}>
                      {tutor.username} - {tutor.location}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : !loading && !error ? (
              <p>No tutors found. Please use the search above.</p>
            ) : null}
          </div>
        </>
      )}

      {/* --- Map Search UI --- */}
      {tab === 'map' && (
        <div style={{ marginTop: 32 }}>
          <MapSearch mode="gigs" radiusKm={20} />
        </div>
      )}

      <nav style={{ marginTop: 30 }}>
        <ul style={{ display: 'flex', gap: 18 }}>
          <li><Link to="/login">Login</Link></li>
          <li><Link to="/signup">Sign Up</Link></li>
        </ul>
      </nav>
    </div>
  );
};

export default Home;
