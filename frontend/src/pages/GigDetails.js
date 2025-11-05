import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';

const GigDetails = ({ gig: initialGig }) => {
  // If navigating via router: get :id from URL
  const { id } = useParams();
  const [gig, setGig] = useState(initialGig || null);
  const [contactInfo, setContactInfo] = useState(initialGig?.contact_info || '[Locked. Buy points to view.]');
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(!initialGig);

  // Fetch gig data if not provided
  React.useEffect(() => {
    if (!gig && id) {
      setLoading(true);
      axios.get(`${process.env.REACT_APP_API_URL}/api/tutors/${id}/`)
        .then(res => {
          setGig(res.data);
          setContactInfo(res.data.contact_info || '[Locked. Buy points to view.]');
        })
        .catch(() => setError('Failed to load gig.'))
        .finally(() => setLoading(false));
    }
  }, [gig, id]);

  const handleUnlockContact = async () => {
    setUnlocking(true);
    setError('');
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/tutors/${id || gig.id}/unlock_contact/`);
      setContactInfo(res.data.contact_info);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to unlock contact info.');
    }
    setUnlocking(false);
  };

  if (loading) return <LoadingSpinner />;
  if (!gig) return <div style={{ padding: 40 }}>Not found.</div>;

  return (
    <div style={{
      maxWidth: 700,
      margin: '32px auto',
      background: 'white',
      borderRadius: 12,
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      padding: 36
    }}>
      <h2 style={{ marginBottom: 8, color: '#212529' }}>{gig.title}</h2>
      <div style={{ color: '#007bff', marginBottom: 14 }}>
        Posted by: {gig.teacher?.username || 'Tutor'}
      </div>
      <p style={{ marginBottom: 18, color: '#495057' }}>{gig.description}</p>
      <div style={{ marginBottom: 10 }}>
        <strong>Subjects:</strong> {gig.subject}
      </div>
      <div style={{ marginBottom: 10 }}>
        <strong>Location:</strong> {gig.location || 'N/A'}
      </div>
      <div style={{ marginBottom: 18 }}>
        <strong>Contact Info:</strong>{' '}
        {contactInfo && !contactInfo.startsWith('[Locked') ? (
          <span>{contactInfo}</span>
        ) : (
          <button
            onClick={handleUnlockContact}
            disabled={unlocking}
            style={{
              background: '#007bff',
              color: 'white',
              border: 'none',
              padding: '6px 16px',
              borderRadius: '5px',
              fontSize: '15px',
              cursor: unlocking ? 'not-allowed' : 'pointer',
              marginLeft: '10px'
            }}
          >
            {unlocking ? 'Unlocking...' : 'Unlock Contact Info (1 point)'}
          </button>
        )}
      </div>
      {error && <div style={{ color: 'red', fontSize: 14, marginBottom: 12 }}>{error}</div>}

      <div style={{ margin: '18px 0' }}>
        <strong>Posted:</strong> {gig.created_at ? new Date(gig.created_at).toLocaleDateString() : 'Recently'}
      </div>
      {/* Add more gig fields if needed, e.g. qualifications, experience, availability */}
    </div>
  );
};

export default GigDetails;
