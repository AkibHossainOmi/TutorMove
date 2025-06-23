import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const transactionId = searchParams.get('transaction_id') || 'N/A';
  const amount = searchParams.get('amount') || 'N/A'; // Assuming amount is passed
  const currency = searchParams.get('currency') || 'Credits'; // Assuming currency is passed
  const type = searchParams.get('type') || 'purchase'; // e.g., 'credit_purchase', 'premium_upgrade'

  // Determine message based on type
  const successMessage = type === 'premium_upgrade' 
    ? "Your account has been successfully upgraded to Premium!"
    : `Your payment was successful! You've received ${amount} ${currency}.`;

  // Inline Styles
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
    border: '2px solid #28a745', // Green border for success
    animation: 'fadeInScale 0.5s ease-out forwards', // Animation on load
  };

  const iconStyle = {
    fontSize: '4em',
    color: '#28a745', // Green checkmark
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
    backgroundColor: '#e9f7ef', // Light green background for details
    padding: '15px 20px',
    borderRadius: '10px',
    marginBottom: '30px',
    fontSize: '0.95em',
    color: '#1e7e34',
    border: '1px solid #c3e6cb',
  };

  const buttonContainerStyle = {
    display: 'flex',
    flexDirection: 'column', // Stack buttons on smaller screens
    gap: '15px',
    marginTop: '30px',
  };

  const primaryButtonStyle = {
    padding: '14px 30px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1.1em',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'background-color 0.3s ease, transform 0.2s ease, box-shadow 0.2s ease',
    boxShadow: '0 4px 10px rgba(0,123,255,0.2)',
  };

  const primaryButtonHoverStyle = {
    backgroundColor: '#0056b3',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 15px rgba(0,123,255,0.3)',
  };

  const secondaryButtonStyle = {
    padding: '14px 30px',
    backgroundColor: '#6c757d',
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

  const secondaryButtonHoverStyle = {
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
          ✅
        </div>
        <h1 style={titleStyle}>Payment Successful!</h1>
        <p style={messageStyle}>
          {successMessage}
        </p>
        
        <div style={detailStyle}>
          <strong>Transaction ID:</strong> {transactionId}
          <br/>
          {type !== 'premium_upgrade' && (
            <span><strong>Amount:</strong> {amount} {currency}</span>
          )}
        </div>

        <div style={buttonContainerStyle}>
          <Link 
            to="/dashboard" 
            style={primaryButtonStyle}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, primaryButtonHoverStyle)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, primaryButtonStyle)}
          >
            Go to Dashboard
          </Link>
          <Link 
            to="/" 
            style={secondaryButtonStyle}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, secondaryButtonHoverStyle)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, secondaryButtonStyle)}
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;