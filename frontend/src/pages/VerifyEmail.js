import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
  const { uid, token } = useParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await axios.get(`/api/auth/verify-email/${uid}/${token}/`);
        setStatus('success');
        setMessage(res.data.detail || 'Email verified! You can now log in.');
      } catch (err) {
        setStatus('error');
        setMessage(
          err.response?.data?.error ||
          err.response?.data?.detail ||
          'Verification link is invalid or expired.'
        );
      }
    };
    verify();
  }, [uid, token]);

  return (
    <div style={{ maxWidth: 420, margin: '40px auto', padding: 32, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee', textAlign: 'center' }}>
      {status === 'loading' && <p>Verifying your email...</p>}
      {status !== 'loading' && (
        <>
          <h2>{status === 'success' ? 'Success!' : 'Verification Failed'}</h2>
          <p style={{ color: status === 'success' ? 'green' : 'red' }}>{message}</p>
          <Link to="/login">
            <button style={{ marginTop: 24, padding: '10px 30px' }}>Go to Login</button>
          </Link>
        </>
      )}
    </div>
  );
};

export default VerifyEmail;
