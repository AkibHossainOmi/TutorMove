import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import BuyCreditsModal from './BuyCreditsModal'; // import the modal
import './TutorCard.css';

const getTrustLabel = (score) => {
  if (score >= 1.5) return { label: 'High Trust', color: '#0073ff', emoji: '🛡️' };
  if (score >= 1.0) return { label: 'Moderate Trust', color: '#ffce00', emoji: '👍' };
  return { label: 'Low Trust', color: '#ff4747', emoji: '⚠️' };
};

const TutorCard = ({ tutor }) => {
  const [contactInfo, setContactInfo] = useState(tutor.contact_info || '[Locked. Buy credits to view.]');
  const [unlocking, setUnlocking] = useState(false);
  const [showBuyCredits, setShowBuyCredits] = useState(false); // modal state
  const [error, setError] = useState('');
  const trust = getTrustLabel(tutor.trust_score ?? 1.0);

  // Unlock handler for contact info
  const handleUnlockContact = async () => {
    setUnlocking(true);
    setError('');
    try {
      const res = await axios.post(`/api/tutors/${tutor.id}/unlock_contact/`);
      setContactInfo(res.data.contact_info);
      setError('');
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        (err.response?.data && typeof err.response.data === 'string' ? err.response.data : '') ||
        'Failed to unlock contact info.';
      setError(msg);
      if (msg.toLowerCase().includes('credit')) {
        setShowBuyCredits(true);
      }
    }
    setUnlocking(false);
  };

  return (
    <div className="tutor-card">
      <div className="tutor-card__header">
        <div className="tutor-card__avatar">
          {tutor.username ? tutor.username.charAt(0).toUpperCase() : 'T'}
        </div>
        <div>
          <h3 className="tutor-card__name">
            {tutor.username || 'Anonymous Tutor'}
            {tutor.is_verified && (
              <span className="badge verified-badge" title="Verified Tutor">
                <svg width="16" height="16" fill="green" style={{marginLeft: '5px', marginBottom: '-3px'}}><circle cx="8" cy="8" r="7" /></svg>
                Verified
              </span>
            )}
            {tutor.is_premium && (
              <span className="badge featured-badge" style={{
                background: '#ffd700',
                color: '#222',
                marginLeft: '7px'
              }}>
                🌟 Featured
              </span>
            )}
          </h3>
          <p className="tutor-card__location">
            {tutor.location || 'Location not specified'}
          </p>
        </div>
      </div>

      <div className="tutor-card__details">
        <p>
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
                padding: '6px 14px',
                borderRadius: '5px',
                fontSize: '13px',
                cursor: unlocking ? 'not-allowed' : 'pointer',
                marginLeft: '6px'
              }}
            >
              {unlocking ? 'Unlocking...' : 'Unlock Contact Info (1 credit)'}
            </button>
          )}
        </p>
        {error && <div style={{ color: 'red', fontSize: '13px', marginTop: '4px' }}>{error}</div>}
        <p><strong>Email:</strong> {tutor.email || 'Not provided'}</p>
        <p><strong>Role:</strong> {tutor.user_type || 'Teacher'}</p>
        <p><strong>Joined:</strong> {tutor.date_joined ? new Date(tutor.date_joined).toLocaleDateString() : 'Recently'}</p>
      </div>

      <div className="tutor-card__footer">
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className="badge" style={{ background: '#e9ecef' }}>
            ⭐ 4.5
          </span>
          <span className="badge" style={{ background: '#e9ecef' }}>
            📚 {tutor.subjects?.length || Math.floor(Math.random() * 10) + 1} subjects
          </span>
          <span className="badge trust-badge" style={{ background: trust.color }} title={trust.label}>
            {trust.emoji} {trust.label}
          </span>
        </div>
        <Link
          to={`/tutors/${tutor.id}`}
          className="view-profile-btn"
        >
          View Profile
        </Link>
      </div>

      {/* BuyCreditsModal will show if showBuyCredits is true */}
      <BuyCreditsModal
        show={showBuyCredits}
        onClose={() => setShowBuyCredits(false)}
        onBuyCredits={() => window.location.href = '/credit-purchase'}
        message="You need more credits to unlock contact information. Please purchase credits to proceed."
      />
    </div>
  );
};

export default TutorCard;
