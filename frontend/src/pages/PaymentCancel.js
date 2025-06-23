import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const PaymentCancel = () => {
  const { type } = useParams(); // expected 'credits' or 'premium'
  const navigate = useNavigate();

  const isCredits = type === 'credits';

  const containerStyle = {
    textAlign: 'center',
    padding: '60px 20px',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    minHeight: 'calc(100vh - 120px)',
    backgroundColor: '#f8f9fa',
    color: '#2c3e50',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  };

  const headingStyle = {
    fontSize: '2.5rem',
    marginBottom: '20px',
  };

  const paragraphStyle = {
    fontSize: '1.15rem',
    marginBottom: '30px',
    maxWidth: '600px',
    marginLeft: 'auto',
    marginRight: 'auto',
  };

  const buttonContainerStyle = {
    marginBottom: '30px',
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    flexWrap: 'wrap',
  };

  const buttonStyle = {
    padding: '14px 28px',
    fontSize: '1.1rem',
    fontWeight: '600',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, box-shadow 0.2s ease',
  };

  const tryAgainButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#ffc107',
    color: '#212529',
    boxShadow: '0 4px 10px rgba(255,193,7,0.2)',
  };

  const tryAgainButtonHover = {
    backgroundColor: '#e0a800',
    boxShadow: '0 6px 15px rgba(255,193,7,0.3)',
  };

  const dashboardButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#6c757d',
    color: '#fff',
    boxShadow: '0 4px 10px rgba(108,117,125,0.1)',
  };

  const dashboardButtonHover = {
    backgroundColor: '#5a6268',
    boxShadow: '0 6px 15px rgba(108,117,125,0.2)',
  };

  // Hover handlers
  const handleHover = (e, hoverStyle) => {
    Object.assign(e.currentTarget.style, hoverStyle);
  };
  const handleLeave = (e, baseStyle) => {
    Object.assign(e.currentTarget.style, baseStyle);
  };

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>Payment Cancelled</h2>
      <p style={paragraphStyle}>
        Your {isCredits ? 'credits purchase' : 'premium subscription'} payment was cancelled.
        No charges have been made to your account.
      </p>
      <div style={buttonContainerStyle}>
        <button
          type="button"
          style={tryAgainButtonStyle}
          onClick={() => navigate(isCredits ? '/credits/purchase' : '/premium')}
          onMouseEnter={(e) => handleHover(e, tryAgainButtonHover)}
          onMouseLeave={(e) => handleLeave(e, tryAgainButtonStyle)}
          aria-label="Try payment again"
        >
          Try Again
        </button>
        <button
          type="button"
          style={dashboardButtonStyle}
          onClick={() => navigate('/dashboard')}
          onMouseEnter={(e) => handleHover(e, dashboardButtonHover)}
          onMouseLeave={(e) => handleLeave(e, dashboardButtonStyle)}
          aria-label="Return to dashboard"
        >
          Return to Dashboard
        </button>
      </div>
      <div style={{ maxWidth: 600, margin: '0 auto', fontSize: '1rem', color: '#555' }}>
        <p>If you have any questions, feel free to contact our support team:</p>
        <p>
          <strong>Email:</strong>{' '}
          <a href="mailto:support@tutormove.com" style={{ color: '#007bff', textDecoration: 'none' }}>
            support@tutormove.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default PaymentCancel;
