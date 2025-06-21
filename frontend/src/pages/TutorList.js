import React, { useEffect, useState } from 'react';
import TutorCard from '../components/TutorCard';
import axios from 'axios';

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

  // Load subjects and locations for filters
  useEffect(() => {
    axios.get('/api/subjects/')
      .then(res => setSubjects(res.data))
      .catch(() => setSubjects([]));
    axios.get('/api/tutors/')
      .then(res => {
        const locs = Array.from(new Set((res.data || []).map(t => t.location).filter(Boolean)));
        setLocations(locs);
      })
      .catch(() => setLocations([]));
  }, []);

  // Fetch tutors when filter or page changes
  useEffect(() => {
    setLoading(true);
    setError(null);

    let url = `/api/tutors/?page=${page}&page_size=${PAGE_SIZE}&`;
    if (premiumOnly) url += 'premium_only=1&';
    else url += 'premium_first=1&';
    if (selectedSubject) url += `subject=${encodeURIComponent(selectedSubject)}&`;
    if (selectedLocation) url += `location=${encodeURIComponent(selectedLocation)}&`;

    axios.get(url)
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
        if (page === 1) {
          setTutors(data);
        } else {
          setTutors(prev => [...prev, ...data]);
        }
        setHasMore(data.length === PAGE_SIZE); // If less than PAGE_SIZE, no more pages
      })
      .catch(() => {
        setError('Failed to fetch tutors.');
        setHasMore(false);
      })
      .finally(() => setLoading(false));
  }, [premiumOnly, selectedSubject, selectedLocation, page]);

  // Reset to first page on filter change
  useEffect(() => {
    setPage(1);
    setTutors([]);
    setHasMore(true);
  }, [premiumOnly, selectedSubject, selectedLocation]);

  const featuredTutors = tutors.filter(t => t.is_premium);
  const regularTutors = tutors.filter(t => !t.is_premium);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 30 }}>
      <div style={{ display: 'flex', gap: 16, marginBottom: 26, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, flex: 1 }}>Available Tutors</h2>
        <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
          <option value="">All Subjects</option>
          {subjects.map(sub => (
            <option key={sub.id || sub.name || sub} value={sub.name || sub}>
              {sub.name || sub}
            </option>
          ))}
        </select>
        <select value={selectedLocation} onChange={e => setSelectedLocation(e.target.value)}>
          <option value="">All Locations</option>
          {locations.map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
        <label style={{ fontWeight: 500 }}>
          <input
            type="checkbox"
            checked={premiumOnly}
            onChange={e => setPremiumOnly(e.target.checked)}
            style={{ marginRight: 8 }}
          />
          Show only featured tutors
        </label>
      </div>

      {loading && <p>Loading tutors...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Featured Tutors (sticky at top if not premiumOnly) */}
      {!premiumOnly && featuredTutors.length > 0 && (
        <div style={{ marginBottom: 40 }}>
          <h3 style={{ color: '#007bff', fontWeight: 'bold' }}>🌟 Featured Tutors</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {featuredTutors.map(tutor => (
              <TutorCard key={tutor.id} tutor={tutor} />
            ))}
          </div>
        </div>
      )}

      {/* Other Tutors (not premium) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px'
      }}>
        {(premiumOnly ? featuredTutors : regularTutors).map(tutor => (
          <TutorCard key={tutor.id} tutor={tutor} />
        ))}
      </div>

      {/* Pagination: Load More */}
      {hasMore && !loading && (
        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <button
            onClick={() => setPage(p => p + 1)}
            style={{
              padding: '10px 32px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: 500,
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
            }}
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default TutorList;
