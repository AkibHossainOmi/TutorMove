import React, { useState } from 'react';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    try {
      await axios.post('/api/auth/password-reset/', { email });
      setSent(true);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'Could not send reset email. Try again.'
      );
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '40px auto', padding: 32, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
      <h2>Forgot Password</h2>
      {sent ? (
        <div style={{ color: 'green', marginTop: 20 }}>
          If your email exists, you will receive a reset link shortly.
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <label>Email Address:</label>
          <input
            type="email"
            value={email}
            required
            onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', marginTop: 10, marginBottom: 18, padding: 8 }}
          />
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit" style={{ padding: '10px 28px' }}>Send Reset Link</button>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
