import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import BuyCreditsModal from './BuyCreditsModal'; // Assuming this modal is already styled modernly

const getTrustLabel = (score) => {
  // Ensure score is a number, default to 1.0 if null/undefined
  const numericScore = parseFloat(score) || 1.0;
  if (numericScore >= 1.5) return { label: 'High Trust', color: '#007bff', emoji: '⭐' }; // Primary blue
  if (numericScore >= 1.0) return { label: 'Moderate Trust', color: '#ffc107', emoji: '👍' }; // Warning yellow
  return { label: 'Low Trust', color: '#dc3545', emoji: '⚠️' }; // Danger red
};

const TutorCard = ({ tutor }) => {
  // Initialize contactInfo based on tutor.contact_info, or a locked state
  const [contactInfo, setContactInfo] = useState(tutor.contact_info || '[Locked. Buy credits to view.]');
  const [unlocking, setUnlocking] = useState(false);
  const [showBuyCredits, setShowBuyCredits] = useState(false); // Controls BuyCreditsModal visibility
  const [error, setError] = useState('');

  // Dynamically determine trust badge properties
  const trust = getTrustLabel(tutor.trust_score);

  // Unlock handler for contact info
  const handleUnlockContact = async () => {
    setUnlocking(true);
    setError('');
    try {
      // Assuming your backend expects a POST to unlock contact
      const token = localStorage.getItem('token'); // Get JWT token from local storage
      if (!token) {
        setError('You must be logged in to unlock contact info.');
        setShowBuyCredits(true); // Suggest login/signup as well
        return;
      }
      const res = await axios.post(`/api/tutors/${tutor.id}/unlock_contact/`, {}, {
        headers: {
          Authorization: `Bearer ${token}` // Include Authorization header
        }
      });
      setContactInfo(res.data.contact_info);
      setError(''); // Clear any previous errors
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        (typeof err.response?.data === 'string' ? err.response.data : '') ||
        'Failed to unlock contact info.';
      setError(msg);
      // If error message indicates insufficient credit, show buy credits modal
      if (msg.toLowerCase().includes('credit') || err.response?.status === 402) { // 402 Payment Required
        setShowBuyCredits(true);
      }
    } finally {
      setUnlocking(false);
    }
  };

  // --- Inline CSS Styles ---

  const cardStyle = {
    backgroundColor: '#ffffff', // White background for the card
    borderRadius: '12px', // More rounded corners
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)', // Softer, more prominent shadow
    overflow: 'hidden', // Ensures inner content respects border radius
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease', // Smooth hover effects
    fontFamily: '"Segoe UI", Arial, sans-serif', // Modern font stack
    color: '#333',
    minHeight: '280px', // Ensure a minimum height for consistent cards
  };

  const cardHoverStyle = {
    transform: 'translateY(-8px)', // Lift effect on hover
    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.18)', // Stronger shadow on hover
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #f0f0f0', // Subtle separator
    gap: '15px', // Space between avatar and text
  };

  const avatarStyle = {
    width: '60px', // Larger avatar
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#007bff', // Primary blue background for avatar initial
    color: 'white',
    fontSize: '28px', // Larger initial
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0, // Prevent avatar from shrinking
  };

  const nameLocationContainerStyle = {
    flexGrow: 1, // Allows this container to take available space
  };

  const nameStyle = {
    margin: 0,
    fontSize: '1.6em', // Larger name
    fontWeight: '700',
    color: '#2c3e50',
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap', // Allow badges to wrap if space is tight
  };

  const locationStyle = {
    margin: '5px 0 0',
    fontSize: '0.95em',
    color: '#6c757d',
  };

  const badgeBaseStyle = {
    display: 'inline-flex', // For icon + text alignment
    alignItems: 'center',
    padding: '4px 10px',
    borderRadius: '16px', // Pill shape for badges
    fontSize: '0.8em',
    fontWeight: '600',
    marginLeft: '10px',
    textTransform: 'uppercase',
  };

  const verifiedBadgeStyle = {
    ...badgeBaseStyle,
    backgroundColor: '#d4edda', // Light green background
    color: '#28a745', // Dark green text
    border: '1px solid #c3e6cb',
  };

  const featuredBadgeStyle = {
    ...badgeBaseStyle,
    backgroundColor: '#fff3cd', // Light yellow background
    color: '#ffc107', // Dark yellow text
    border: '1px solid #ffeeba',
  };

  const detailsSectionStyle = {
    padding: '20px',
    flexGrow: 1, // Allows details to take up remaining vertical space
    display: 'flex',
    flexDirection: 'column', // Stack paragraphs
  };

  const detailParagraphStyle = {
    margin: '0 0 10px',
    fontSize: '0.95em',
    color: '#555',
  };

  const strongTextStyle = {
    fontWeight: 'bold',
    color: '#34495e',
    marginRight: '5px',
  };

  const unlockButtonStyle = {
    background: '#007bff', // Primary blue
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease, transform 0.1s ease',
    marginLeft: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  };

  const unlockButtonHoverStyle = {
    backgroundColor: '#0056b3',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 8px rgba(0,123,255,0.2)',
  };

  const unlockButtonDisabledStyle = {
    backgroundColor: '#a0d1ff', // Lighter blue when disabled
    cursor: 'not-allowed',
    transform: 'none',
    boxShadow: 'none',
  };

  const errorMessageStyle = {
    color: '#dc3545',
    fontSize: '0.85em',
    marginTop: '5px',
    padding: '5px 0',
    backgroundColor: '#f8d7da',
    borderRadius: '4px',
    textAlign: 'center',
  };

  const footerStyle = {
    padding: '20px',
    borderTop: '1px solid #f0f0f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap', // Allow wrapping
    gap: '15px', // Space between groups
  };

  const footerBadgesContainerStyle = {
    display: 'flex',
    gap: '10px', // Space between badges
    flexWrap: 'wrap',
  };

  const secondaryBadgeStyle = {
    backgroundColor: '#e9ecef', // Light grey background
    color: '#495057', // Dark grey text
    padding: '4px 10px',
    borderRadius: '16px',
    fontSize: '0.8em',
    fontWeight: '500',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
  };

  const trustBadgeStyle = {
    ...secondaryBadgeStyle,
    backgroundColor: trust.color, // Dynamic color from getTrustLabel
    color: 'white', // White text for colored badges
  };

  const viewProfileButtonStyle = {
    backgroundColor: '#28a745', // Green 'View Profile' button
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    fontSize: '15px',
    fontWeight: '600',
    textDecoration: 'none', // Remove underline for Link
    transition: 'background-color 0.2s ease, transform 0.1s ease',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    whiteSpace: 'nowrap', // Prevent text wrap
  };

  const viewProfileButtonHoverStyle = {
    backgroundColor: '#218838', // Darker green on hover
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(40,167,69,0.2)',
  };

  return (
    <div
      style={cardStyle}
      onMouseEnter={(e) => Object.assign(e.currentTarget.style, cardHoverStyle)}
      onMouseLeave={(e) => Object.assign(e.currentTarget.style, cardStyle)}
    >
      <div style={headerStyle}>
        <div style={avatarStyle}>
          {tutor.username ? tutor.username.charAt(0).toUpperCase() : 'T'}
        </div>
        <div style={nameLocationContainerStyle}>
          <h3 style={nameStyle}>
            {tutor.username || 'Anonymous Tutor'}
            {tutor.is_verified && (
              <span style={verifiedBadgeStyle} title="Verified Tutor">
                <svg width="14" height="14" fill="#28a745" style={{ marginRight: '4px', verticalAlign: 'middle' }} viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                Verified
              </span>
            )}
            {tutor.is_premium && (
              <span style={featuredBadgeStyle} title="Featured Tutor">
                <span role="img" aria-label="star" style={{ verticalAlign: 'middle', marginRight: '4px' }}>🌟</span>
                Featured
              </span>
            )}
          </h3>
          <p style={locationStyle}>
            {tutor.location || 'Location not specified'}
          </p>
        </div>
      </div>

      <div style={detailsSectionStyle}>
        <p style={detailParagraphStyle}>
          <strong style={strongTextStyle}>Contact Info:</strong>{' '}
          {contactInfo && !contactInfo.startsWith('[Locked') ? (
            <span>{contactInfo}</span>
          ) : (
            <button
              onClick={handleUnlockContact}
              disabled={unlocking}
              style={unlocking ? { ...unlockButtonStyle, ...unlockButtonDisabledStyle } : unlockButtonStyle}
              onMouseEnter={(e) => !unlocking && Object.assign(e.currentTarget.style, unlockButtonHoverStyle)}
              onMouseLeave={(e) => !unlocking && Object.assign(e.currentTarget.style, unlockButtonStyle)}
            >
              {unlocking ? 'Unlocking...' : 'Unlock Contact Info (1 credit)'}
            </button>
          )}
        </p>
        {error && <div style={errorMessageStyle}>{error}</div>}
        <p style={detailParagraphStyle}><strong style={strongTextStyle}>Email:</strong> {tutor.email || 'Not provided'}</p>
        <p style={detailParagraphStyle}><strong style={strongTextStyle}>Role:</strong> {tutor.user_type || 'Teacher'}</p>
        <p style={detailParagraphStyle}><strong style={strongTextStyle}>Joined:</strong> {tutor.date_joined ? new Date(tutor.date_joined).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recently'}</p>
      </div>

      <div style={footerStyle}>
        <div style={footerBadgesContainerStyle}>
          <span style={secondaryBadgeStyle}>
            <span role="img" aria-label="star" style={{verticalAlign: 'middle'}}>⭐</span> {tutor.average_rating ? tutor.average_rating.toFixed(1) : 'N/A'}
          </span>
          <span style={secondaryBadgeStyle}>
            <span role="img" aria-label="books" style={{verticalAlign: 'middle'}}>📚</span> {tutor.subjects?.length || 0} subjects
          </span>
          <span style={trustBadgeStyle} title={trust.label}>
            <span role="img" aria-label={trust.label} style={{verticalAlign: 'middle'}}>{trust.emoji}</span> {trust.label}
          </span>
        </div>
        <Link
          to={`/tutors/${tutor.id}`}
          style={viewProfileButtonStyle}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, viewProfileButtonHoverStyle)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, viewProfileButtonStyle)}
        >
          View Profile
        </Link>
      </div>

      {/* BuyCreditsModal will show if showBuyCredits is true */}
      <BuyCreditsModal
        show={showBuyCredits}
        onClose={() => setShowBuyCredits(false)}
        onBuyCredits={() => window.location.href = '/credit-purchase'} // Redirect to credit purchase page
        message="You need more credits to unlock contact information. Please purchase credits to proceed."
      />
    </div>
  );
};

export default TutorCard;