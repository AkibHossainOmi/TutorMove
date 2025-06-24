import React, { useEffect, useState } from 'react';
import TutorCard from '../components/TutorCard'; // Assuming TutorCard is already styled with modern inline CSS
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PAGE_SIZE = 16;

const TutorList = () => {
  const [tutors, setTutors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [premiumOnly, setPremiumOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination states
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // --- Fetch Subjects and Locations for Filters ---
  useEffect(() => {
    // Fetch subjects
    axios.get('/api/subjects/')
      .then(res => setSubjects(res.data))
      .catch(() => setSubjects([]));

    // Fetch locations from tutors (unique locations)
    // It's generally more efficient to have a dedicated endpoint for unique locations
    // rather than fetching all tutors to extract locations.
    axios.get('/api/tutors/')
      .then(res => {
        const locs = Array.from(new Set((res.data.results || res.data || []).map(t => t.location).filter(Boolean)));
        setLocations(locs);
      })
      .catch(() => setLocations([]));
  }, []); // Run once on component mount

  // --- Fetch Tutors based on filters and page ---
  useEffect(() => {
    setLoading(true);
    setError(null);

    let url = `/api/tutors/?page=${page}&page_size=${PAGE_SIZE}`;
    // Prioritize premium tutors unless 'premiumOnly' filter is active
    url += premiumOnly ? '&is_premium=true' : '&premium_first=true'; 
    if (selectedSubject) url += `&subject=${encodeURIComponent(selectedSubject)}`;
    if (selectedLocation) url += `&location=${encodeURIComponent(selectedLocation)}`;

    axios.get(url)
      .then(res => {
        // Handle both direct array response and paginated response (e.g., { results: [...], next: ... })
        const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
        if (page === 1) {
          setTutors(data); // New search/filter, replace tutors
        } else {
          setTutors(prev => [...prev, ...data]); // Load more, append to existing
        }
        // Check if there are more items to load. If the number of items received is less than PAGE_SIZE,
        // it implies it's the last page.
        setHasMore(data.length === PAGE_SIZE);
      })
      .catch((err) => {
        console.error("Failed to fetch tutors:", err);
        setError('Failed to fetch tutors. Please try adjusting your filters or try again later.');
        setHasMore(false); // Stop loading more if there's an error
      })
      .finally(() => setLoading(false));
  }, [premiumOnly, selectedSubject, selectedLocation, page]); // Re-fetch when these dependencies change

  // --- Reset page to 1 and clear tutors when filters change ---
  useEffect(() => {
    setPage(1); // Reset to first page
    setTutors([]); // Clear tutors to show loading state for new filter results
    setHasMore(true); // Assume there might be more pages for new filters
  }, [premiumOnly, selectedSubject, selectedLocation]);

  // Separate featured and regular tutors for display
  const featuredTutors = tutors.filter(t => t.is_premium);
  const regularTutors = tutors.filter(t => !t.is_premium);

  // --- Inline CSS Styles ---
  const pageContainerStyle = {
    maxWidth: '1280px', // Wider max-width for more spacious feel
    margin: '40px auto', // More vertical margin
    padding: '0 30px', // More horizontal padding
    fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', // Modern font stack
    backgroundColor: '#f8f9fa', // Light background for the page
    minHeight: '100vh',
    color: '#333',
  };

  const headerAndFilterBar = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '25px', // More spacing between elements
    marginBottom: '40px', // More space below filters
    flexWrap: 'wrap', // Allow items to wrap on smaller screens
    justifyContent: 'space-between', // Distribute items
    paddingBottom: '20px', // Padding at the bottom of the filter bar section
    borderBottom: '1px solid #e9ecef', // Subtle separator below filter bar
  };

  const mainHeadingStyle = {
    margin: '0',
    flexShrink: '0',
    fontSize: '3em', // Larger main heading
    fontWeight: '700',
    color: '#2c3e50',
    lineHeight: '1.2',
  };

  const filterGroupStyle = {
    display: 'flex',
    gap: '15px', // Spacing between individual filters
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-end', // Align filters to the right
  };

  const selectStyle = {
  padding: '10px 40px', // Increased right padding for arrow
  borderRadius: '8px',
  border: '1px solid #dee2e6',
  backgroundColor: 'white',
  fontSize: '15px',
  color: '#495057',
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  backgroundSize: '12px',
  cursor: 'pointer',
  outline: 'none',
  boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
};

  const selectHoverFocusStyle = {
    borderColor: '#007bff', // Primary blue on hover/focus
    boxShadow: '0 0 0 3px rgba(0, 123, 255, 0.25)', // Glow effect
  };

  const checkboxLabelStyle = {
    display: 'flex',
    alignItems: 'center',
    fontSize: '15px',
    fontWeight: '500',
    color: '#495057',
    cursor: 'pointer',
    whiteSpace: 'nowrap', // Prevent wrapping
  };

  const checkboxStyle = {
    marginRight: '8px',
    width: '20px', // Slightly larger checkbox
    height: '20px',
    accentColor: '#007bff', // Custom color for checkbox (blue)
  };

  const sectionHeadingStyle = {
    color: '#007bff', // Primary blue for section headings
    fontWeight: '700', // Bolder
    fontSize: '2em', // Larger
    marginBottom: '25px', // More space
    borderBottom: '2px solid #e0e0e0', // Thicker separator
    paddingBottom: '12px',
    textAlign: 'left', // Align to left
  };

  const tutorGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', // Adjust minmax for better card distribution
    gap: '30px', // More consistent gap between cards
    padding: '10px 0',
  };

  const messageStyle = {
    textAlign: 'center',
    fontSize: '1.1em',
    color: '#6c757d',
    padding: '30px',
    backgroundColor: '#ffffff',
    borderRadius: '10px', // More rounded
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)', // Clearer shadow
    margin: '25px auto', // Centered and spaced
    maxWidth: '600px', // Max width for messages
  };

  const errorTextStyle = {
    ...messageStyle, // Inherit base message style
    color: '#dc3545', // Danger red
    backgroundColor: '#f8d7da', // Light red background
    border: '1px solid #f5c6cb',
  };

  const loadMoreContainerStyle = {
    textAlign: 'center',
    margin: '50px 0 30px', // More vertical margin
  };

  const loadMoreButtonStyle = {
    padding: '15px 45px', // More generous padding
    background: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '35px', // More pill-shaped
    fontSize: '1.1em',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 5px 15px rgba(0, 123, 255, 0.25)', // Stronger shadow
    transition: 'background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease',
    outline: 'none',
  };

  const loadMoreButtonHoverStyle = {
    backgroundColor: '#0056b3',
    transform: 'translateY(-3px)', // More pronounced lift
    boxShadow: '0 8px 20px rgba(0, 123, 255, 0.4)', // Stronger shadow
  };

  return (
    <>
    <Navbar/>
    <div style={{ height: '100px' }}></div>
    <div style={pageContainerStyle}>
      <div style={headerAndFilterBar}>
        <h2 style={mainHeadingStyle}>Find Your Perfect Tutor</h2>
        <div style={filterGroupStyle}>
          <select
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
            style={selectStyle}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, selectHoverFocusStyle)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, selectStyle)}
            onFocus={(e) => Object.assign(e.currentTarget.style, selectHoverFocusStyle)}
            onBlur={(e) => Object.assign(e.currentTarget.style, selectStyle)}
          >
            <option value="">All Subjects</option>
            {subjects.map(sub => (
              <option key={sub.id || sub.name || sub} value={sub.name || sub}>
                {sub.name || sub}
              </option>
            ))}
          </select>
          <select
            value={selectedLocation}
            onChange={e => setSelectedLocation(e.target.value)}
            style={selectStyle}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, selectHoverFocusStyle)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, selectStyle)}
            onFocus={(e) => Object.assign(e.currentTarget.style, selectHoverFocusStyle)}
            onBlur={(e) => Object.assign(e.currentTarget.style, selectStyle)}
          >
            <option value="">All Locations</option>
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
          <label style={checkboxLabelStyle}>
            <input
              type="checkbox"
              checked={premiumOnly}
              onChange={e => setPremiumOnly(e.target.checked)}
              style={checkboxStyle}
            />
            Show only premium tutors
          </label>
        </div>
      </div>

      {loading && <p style={messageStyle}>Loading tutors, please wait...</p>}
      {error && <p style={errorTextStyle}>{error}</p>}

      {/* Conditional rendering for Featured Tutors section */}
      {!loading && !error && !premiumOnly && featuredTutors.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <h3 style={sectionHeadingStyle}>🌟 Featured Tutors</h3>
          <div style={tutorGridStyle}>
            {featuredTutors.map(tutor => (
              <TutorCard key={tutor.id} tutor={tutor} />
            ))}
          </div>
        </div>
      )}

      {/* Main list of tutors (either all or just premium based on filter) */}
      {!loading && !error && (
        <>
          {/* Show "All Tutors" heading only if not filtering by premiumOnly AND there are regular tutors to show */}
          {!premiumOnly && regularTutors.length > 0 && (
            <h3 style={sectionHeadingStyle}>All Tutors</h3>
          )}
          {/* Message for no premium tutors when premiumOnly is active */}
          {premiumOnly && featuredTutors.length === 0 && (
            <p style={messageStyle}>No premium tutors found with the selected filters.</p>
          )}
          {/* Message for no tutors found overall (when no specific filter yields results) */}
          {!premiumOnly && tutors.length === 0 && ( // This covers the case where total tutors (non-premium) is zero
             <p style={messageStyle}>No tutors found with the selected filters. Try broadening your search!</p>
          )}
          <div style={tutorGridStyle}>
            {(premiumOnly ? featuredTutors : regularTutors).map(tutor => (
              <TutorCard key={tutor.id} tutor={tutor} />
            ))}
          </div>
        </>
      )}

      {/* Load More Button */}
      {hasMore && !loading && !error && (
        <div style={loadMoreContainerStyle}>
          <button
            onClick={() => setPage(p => p + 1)}
            style={loadMoreButtonStyle}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, loadMoreButtonHoverStyle)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, loadMoreButtonStyle)}
          >
            Load More Tutors
          </button>
        </div>
      )}
    </div>
    <Footer/>
    </>
  );
};

export default TutorList;