import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const PaymentFail = () => {
  const [searchParams] = useSearchParams();

  const transactionId = searchParams.get('tran_id') || null;
  const status = searchParams.get('status') || 'FAILED';
  const errorMessage = searchParams.get('reason') || 'An unknown error occurred during your payment.';
  const errorCode = status; // Using status as error code display

  const styles = {
    pageContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 120px)',
      backgroundColor: '#f8f9fa',
      fontFamily: '"Segoe UI", Arial, sans-serif',
      padding: 20,
    },
    card: {
      backgroundColor: '#fff',
      borderRadius: 15,
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
      padding: 40,
      maxWidth: 550,
      width: '100%',
      textAlign: 'center',
      border: '2px solid #dc3545',
      animation: 'fadeInScale 0.5s ease-out forwards',
    },
    icon: {
      fontSize: '4em',
      color: '#dc3545',
      marginBottom: 20,
    },
    title: {
      fontSize: '2.5em',
      fontWeight: 700,
      color: '#2c3e50',
      marginBottom: 15,
    },
    message: {
      fontSize: '1.1em',
      color: '#555',
      marginBottom: 30,
      lineHeight: 1.6,
    },
    detail: {
      backgroundColor: '#fbe9e9',
      padding: '15px 20px',
      borderRadius: 10,
      marginBottom: 30,
      fontSize: '0.95em',
      color: '#721c24',
      border: '1px solid #f5c6cb',
      whiteSpace: 'pre-wrap',
    },
    buttonContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: 15,
      marginTop: 30,
    },
    retryButton: {
      padding: '14px 30px',
      backgroundColor: '#ffc107',
      color: '#212529',
      border: 'none',
      borderRadius: 8,
      fontSize: '1.1em',
      fontWeight: 600,
      cursor: 'pointer',
      textDecoration: 'none',
      boxShadow: '0 4px 10px rgba(255,193,7,0.2)',
      textAlign: 'center',
      transition: 'background-color 0.3s ease, transform 0.2s ease, box-shadow 0.2s ease',
    },
    contactSupportButton: {
      padding: '14px 30px',
      backgroundColor: '#17a2b8',
      color: 'white',
      border: 'none',
      borderRadius: 8,
      fontSize: '1.1em',
      fontWeight: 600,
      cursor: 'pointer',
      textDecoration: 'none',
      boxShadow: '0 4px 10px rgba(23,162,184,0.1)',
      textAlign: 'center',
      transition: 'background-color 0.3s ease, transform 0.2s ease, box-shadow 0.2s ease',
    },
    goHomeButton: {
      padding: '14px 30px',
      backgroundColor: '#6c757d',
      color: 'white',
      border: 'none',
      borderRadius: 8,
      fontSize: '1.1em',
      fontWeight: 600,
      cursor: 'pointer',
      textDecoration: 'none',
      boxShadow: '0 4px 10px rgba(108,117,125,0.1)',
      textAlign: 'center',
      transition: 'background-color 0.3s ease, transform 0.2s ease, box-shadow 0.2s ease',
    },
  };

  // Hover effect handlers
  const handleHover = (e, hoverStyles) => {
    Object.assign(e.currentTarget.style, hoverStyles);
  };
  const handleLeave = (e, baseStyles) => {
    Object.assign(e.currentTarget.style, baseStyles);
  };

  const keyframesStyle = `
    @keyframes fadeInScale {
      from { opacity: 0; transform: scale(0.9); }
      to { opacity: 1; transform: scale(1); }
    }
  `;

  return (
    <div style={styles.pageContainer}>
      <style>{keyframesStyle}</style>
      <div style={styles.card}>
        <div style={styles.icon} aria-label="Payment Failed Icon">❌</div>
        <h1 style={styles.title}>Payment Failed</h1>
        <p style={styles.message}>
          We encountered an issue processing your payment. Please review the details below or try again.
        </p>

        <div style={styles.detail}>
          {/* <strong>Error Code:</strong> {errorCode}
          <br /> */}
          <strong>Message:</strong> {errorMessage}
          {transactionId && (
            <>
              <br />
              <strong>Transaction ID:</strong> {transactionId}
            </>
          )}
        </div>

        <div style={styles.buttonContainer}>
          <Link
            to="/credit-purchase"
            style={styles.retryButton}
            aria-label="Retry Payment"
            onMouseEnter={(e) =>
              handleHover(e, { backgroundColor: '#e0a800', transform: 'translateY(-2px)', boxShadow: '0 6px 15px rgba(255,193,7,0.3)' })
            }
            onMouseLeave={(e) => handleLeave(e, styles.retryButton)}
          >
            Try Again
          </Link>

          <Link
            to="/contact"
            style={styles.contactSupportButton}
            aria-label="Contact Support"
            onMouseEnter={(e) =>
              handleHover(e, { backgroundColor: '#138496', transform: 'translateY(-2px)', boxShadow: '0 6px 15px rgba(23,162,184,0.2)' })
            }
            onMouseLeave={(e) => handleLeave(e, styles.contactSupportButton)}
          >
            Contact Support
          </Link>

          <Link
            to="/"
            style={styles.goHomeButton}
            aria-label="Back to Home"
            onMouseEnter={(e) =>
              handleHover(e, { backgroundColor: '#5a6268', transform: 'translateY(-2px)', boxShadow: '0 6px 15px rgba(108,117,125,0.2)' })
            }
            onMouseLeave={(e) => handleLeave(e, styles.goHomeButton)}
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentFail;