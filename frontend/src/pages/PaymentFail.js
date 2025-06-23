import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const PaymentFail = () => {
  const [searchParams] = useSearchParams();
  const errorCode = searchParams.get('error_code') || 'GENERIC_ERROR';
  const errorMessage = searchParams.get('message') || 'An unknown error occurred during your payment.';
  const transactionId = searchParams.get('transaction_id') || 'N/A'; // If a transaction ID was generated before failure

  // Inline Styles (reusing many from PaymentSuccess for consistency)
  const pageContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 120px)', // Adjust based on Navbar/Footer
    backgroundColor: '#f8f9fa',
    fontFamily: '"Segoe UI", Arial, sans-serif',
    padding: '20px',
  };

  const cardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '15px',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
    padding: '40px',
    maxWidth: '550px',
    width: '100%',
    textAlign: 'center',
    border: '2px solid #dc3545', // Red border for failure
    animation: 'fadeInScale 0.5s ease-out forwards', // Animation on load
  };

  const iconStyle = {
    fontSize: '4em',
    color: '#dc3545', // Red cross
    marginBottom: '20px',
  };

  const titleStyle = {
    fontSize: '2.5em',
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: '15px',
  };

  const messageStyle = {
    fontSize: '1.1em',
    color: '#555',
    marginBottom: '30px',
    lineHeight: '1.6',
  };

  const detailStyle = {
    backgroundColor: '#fbe9e9', // Light red background for details
    padding: '15px 20px',
    borderRadius: '10px',
    marginBottom: '30px',
    fontSize: '0.95em',
    color: '#721c24',
    border: '1px solid #f5c6cb',
  };

  const buttonContainerStyle = {
    display: 'flex',
    flexDirection: 'column', // Stack buttons on smaller screens
    gap: '15px',
    marginTop: '30px',
  };

  const retryButtonStyle = {
    padding: '14px 30px',
    backgroundColor: '#ffc107', // Warning yellow for retry
    color: '#212529',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1.1em',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'background-color 0.3s ease, transform 0.2s ease, box-shadow 0.2s ease',
    boxShadow: '0 4px 10px rgba(255,193,7,0.2)',
  };

  const retryButtonHoverStyle = {
    backgroundColor: '#e0a800',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 15px rgba(255,193,7,0.3)',
  };

  const contactSupportButtonStyle = {
    padding: '14px 30px',
    backgroundColor: '#17a2b8', // Info blue for support
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1.1em',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'background-color 0.3s ease, transform 0.2s ease, box-shadow 0.2s ease',
    boxShadow: '0 4px 10px rgba(23,162,184,0.1)',
  };

  const contactSupportButtonHoverStyle = {
    backgroundColor: '#138496',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 15px rgba(23,162,184,0.2)',
  };

  const goHomeButtonStyle = {
    padding: '14px 30px',
    backgroundColor: '#6c757d', // Grey for go home
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1.1em',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'background-color 0.3s ease, transform 0.2s ease, box-shadow 0.2s ease',
    boxShadow: '0 4px 10px rgba(108,117,125,0.1)',
  };

  const goHomeButtonHoverStyle = {
    backgroundColor: '#5a6268',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 15px rgba(108,117,125,0.2)',
  };

  // Keyframes for animation (place inside a <style> tag or global CSS)
  const keyframesStyle = `
    @keyframes fadeInScale {
      from { opacity: 0; transform: scale(0.9); }
      to { opacity: 1; transform: scale(1); }
    }
  `;

  return (
    <div style={pageContainerStyle}>
      <style>{keyframesStyle}</style> {/* Inject keyframes */}
      <div style={cardStyle}>
        <div style={iconStyle}>
          ❌
        </div>
        <h1 style={titleStyle}>Payment Failed</h1>
        <p style={messageStyle}>
          We encountered an issue processing your payment. Please review the details below or try again.
        </p>
        
        <div style={detailStyle}>
          <strong>Error Code:</strong> {errorCode}
          <br/>
          <strong>Message:</strong> {errorMessage}
          <br/>
          {transactionId !== 'N/A' && <span><strong>Transaction ID:</strong> {transactionId}</span>}
        </div>

        <div style={buttonContainerStyle}>
          <Link 
            to="/credit-purchase" // Redirect to the credit purchase page to retry
            style={retryButtonStyle}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, retryButtonHoverStyle)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, retryButtonStyle)}
          >
            Try Again
          </Link>
          <Link 
            to="/contact" // Link to a contact support page
            style={contactSupportButtonStyle}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, contactSupportButtonHoverStyle)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, contactSupportButtonStyle)}
          >
            Contact Support
          </Link>
          <Link 
            to="/" 
            style={goHomeButtonStyle}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, goHomeButtonHoverStyle)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, goHomeButtonStyle)}
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentFail;