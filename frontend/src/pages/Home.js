import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import SearchBar from '../components/SearchBar'; // Assume SearchBar has its own modern styling
import MapSearch from '../components/MapSearch'; // Assume MapSearch has its own modern styling

const Home = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State to toggle between "Text" and "Map" search views
  const [tab, setTab] = useState('map'); // Default to 'map' for a prominent feature

  // Styles for the overall page container
  const pageContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 20px',
    backgroundColor: '#f8f8f8', // Light background for the page
    minHeight: 'calc(100vh - 120px)', // Adjust based on Navbar/Footer height
    fontFamily: '"Segoe UI", Arial, sans-serif',
    color: '#333',
  };

  // Styles for the main heading
  const mainHeadingStyle = {
    fontSize: '3.5em', // Larger font for impact
    fontWeight: '800', // Extra bold
    color: '#2c3e50',
    marginBottom: '20px',
    textAlign: 'center',
    lineHeight: '1.2',
  };

  // Styles for a catchy subheading
  const subheadingStyle = {
    fontSize: '1.4em',
    color: '#555',
    marginBottom: '40px',
    textAlign: 'center',
    maxWidth: '700px',
  };

  // Styles for the tab selection buttons
  const tabContainerStyle = {
    display: 'flex',
    gap: '15px',
    marginBottom: '30px',
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    padding: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
  };

  const tabButtonStyle = {
    padding: '12px 28px',
    border: 'none',
    borderRadius: '8px', // Slightly more rounded
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '1.05em',
    transition: 'background-color 0.3s ease, color 0.3s ease, transform 0.1s ease',
    outline: 'none',
  };

  const activeTabButtonStyle = {
    ...tabButtonStyle,
    backgroundColor: '#007bff', // Primary blue
    color: 'white',
    boxShadow: '0 4px 10px rgba(0,123,255,0.2)',
    transform: 'translateY(-2px)',
  };

  const inactiveTabButtonStyle = {
    ...tabButtonStyle,
    backgroundColor: 'transparent',
    color: '#007bff', // Blue text for inactive
    border: '1px solid #007bff', // Blue border for inactive
  };

  const inactiveTabButtonHoverStyle = {
    backgroundColor: '#e6f2ff', // Light blue on hover
    transform: 'translateY(-2px)',
  };

  // Styles for search results section
  const resultsContainerStyle = {
    width: '100%',
    maxWidth: '900px', // Max width for search results
    marginTop: '30px',
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
    padding: '30px',
  };

  const loadingErrorStyle = {
    textAlign: 'center',
    fontSize: '1.1em',
    color: '#666',
    padding: '20px',
  };

  const errorTextStyle = {
    ...loadingErrorStyle,
    color: '#dc3545',
    backgroundColor: '#f8d7da',
    border: '1px solid #f5c6cb',
    borderRadius: '8px',
  };

  const noResultsStyle = {
    ...loadingErrorStyle,
    color: '#888',
  };

  const resultsListStyle = {
    listStyle: 'none',
    padding: '0',
    margin: '0',
  };

  const resultItemStyle = {
    padding: '15px',
    borderBottom: '1px solid #eee',
    transition: 'background-color 0.2s ease',
  };

  const resultItemHoverStyle = {
    backgroundColor: '#f5f5f5',
  };

  const resultLinkStyle = {
    textDecoration: 'none',
    color: '#007bff',
    fontSize: '1.1em',
    fontWeight: '600',
    display: 'block',
  };

  const resultLinkHoverStyle = {
    color: '#0056b3',
  };

  // Styles for navigation links at the bottom
  const bottomNavStyle = {
    marginTop: '50px',
    marginBottom: '20px',
    display: 'flex',
    gap: '25px',
  };

  const bottomNavLinkStyle = {
    textDecoration: 'none',
    color: '#007bff',
    fontSize: '1.1em',
    fontWeight: '600',
    padding: '10px 15px',
    borderRadius: '8px',
    border: '1px solid #007bff',
    transition: 'background-color 0.3s ease, color 0.3s ease',
  };

  const bottomNavLinkHoverStyle = {
    backgroundColor: '#007bff',
    color: 'white',
  };

  const handleSearch = async ({ subject, location }) => {
    setLoading(true);
    setError(null);
    setSearchResults([]); // Clear previous results
    try {
      const params = new URLSearchParams();
      if (subject) params.append('subject', subject);
      if (location) params.append('location', location);

      const response = await axios.get(`/api/tutors/search/?${params.toString()}`);
      setSearchResults(response.data);
    } catch (err) {
      setError('Failed to fetch tutors. Please refine your search.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageContainerStyle}>
      <h1 style={mainHeadingStyle}>
        Connect with Expert Tutors, Anywhere.
      </h1>
      <p style={subheadingStyle}>
        Find the perfect tutor for your needs, whether online or in-person. Explore by subject, location, or on the map.
      </p>

      {/* Tab UI to switch between Text and Map search */}
      <div style={tabContainerStyle}>
        <button
          onClick={() => setTab('map')}
          style={tab === 'map' ? activeTabButtonStyle : inactiveTabButtonStyle}
          onMouseEnter={(e) => tab !== 'map' && Object.assign(e.currentTarget.style, inactiveTabButtonHoverStyle)}
          onMouseLeave={(e) => tab !== 'map' && Object.assign(e.currentTarget.style, inactiveTabButtonStyle)}
        >
          📍 Search on Map
        </button>
        <button
          onClick={() => setTab('text')}
          style={tab === 'text' ? activeTabButtonStyle : inactiveTabButtonStyle}
          onMouseEnter={(e) => tab !== 'text' && Object.assign(e.currentTarget.style, inactiveTabButtonHoverStyle)}
          onMouseLeave={(e) => tab !== 'text' && Object.assign(e.currentTarget.style, inactiveTabButtonStyle)}
        >
          🔍 Search by Text
        </button>
      </div>

      {/* --- Text Search UI --- */}
      {tab === 'text' && (
        <div style={resultsContainerStyle}>
          <h2 style={{ fontSize: '1.8em', color: '#444', marginBottom: '25px', textAlign: 'center' }}>
            Find Tutors by Subject or Location
          </h2>
          <SearchBar onSearch={handleSearch} />
          <div style={{ marginTop: '25px' }}>
            {loading && <p style={loadingErrorStyle}>Searching for tutors...</p>}
            {error && <p style={errorTextStyle}>{error}</p>}
            {!loading && !error && searchResults.length > 0 ? (
              <ul style={resultsListStyle}>
                {searchResults.map((tutor) => (
                  <li
                    key={tutor.id}
                    style={resultItemStyle}
                    onMouseEnter={(e) => Object.assign(e.currentTarget.style, resultItemHoverStyle)}
                    onMouseLeave={(e) => Object.assign(e.currentTarget.style, resultItemStyle)}
                  >
                    <Link
                      to={`/tutors/${tutor.id}`}
                      style={resultLinkStyle}
                      onMouseEnter={(e) => Object.assign(e.currentTarget.style, resultLinkHoverStyle)}
                      onMouseLeave={(e) => Object.assign(e.currentTarget.style, resultLinkStyle)}
                    >
                      {tutor.username} {tutor.location ? `- ${tutor.location}` : ''} ({tutor.subject || 'Various Subjects'})
                    </Link>
                  </li>
                ))}
              </ul>
            ) : !loading && !error && searchResults.length === 0 ? (
              <p style={noResultsStyle}>No tutors found with your criteria. Try a broader search!</p>
            ) : null}
          </div>
        </div>
      )}

      {/* --- Map Search UI --- */}
      {tab === 'map' && (
        <div style={resultsContainerStyle}>
          <h2 style={{ fontSize: '1.8em', color: '#444', marginBottom: '25px', textAlign: 'center' }}>
            Explore Tutors Near You
          </h2>
          {/* MapSearch component should internally handle its own loading/error states */}
          <MapSearch mode="gigs" radiusKm={20} />
        </div>
      )}

      {/* Bottom Navigation Links */}
      <nav style={bottomNavStyle}>
        <Link
          to="/login"
          style={bottomNavLinkStyle}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, bottomNavLinkHoverStyle)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, bottomNavLinkStyle)}
        >
          Login
        </Link>
        <Link
          to="/signup"
          style={bottomNavLinkStyle}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, bottomNavLinkHoverStyle)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, bottomNavLinkStyle)}
        >
          Sign Up
        </Link>
      </nav>
    </div>
  );
};

export default Home;