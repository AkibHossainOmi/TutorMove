import React, { useState } from 'react';
import axios from 'axios';

const RequestVerificationButton = ({ isVerified, verificationRequested, onRequested }) => {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleRequest = async () => {
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/users/request_verification/`);
      setSuccessMsg(response.data.detail || 'Verification request sent.');
      onRequested && onRequested();
    } catch (err) {
      setErrorMsg(
        err.response?.data?.detail || 'Could not send request. Try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (isVerified) {
    return <span style={{ color: 'green', fontWeight: 500 }}>✅ Verified</span>;
  }
  if (verificationRequested) {
    return <span style={{ color: '#ffae42', fontWeight: 500 }}>⏳ Verification pending...</span>;
  }

  return (
    <div>
      <button
        onClick={handleRequest}
        disabled={loading}
        style={{
          padding: '8px 20px',
          background: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          fontWeight: 500,
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Requesting...' : 'Request Verification'}
      </button>
      {successMsg && (
        <div style={{ color: 'green', marginTop: 6, fontSize: 14 }}>{successMsg}</div>
      )}
      {errorMsg && (
        <div style={{ color: 'red', marginTop: 6, fontSize: 14 }}>{errorMsg}</div>
      )}
    </div>
  );
};

export default RequestVerificationButton;
