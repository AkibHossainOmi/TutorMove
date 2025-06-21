import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const { uid, token } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
      await axios.post('/api/auth/password-reset-confirm/', {
        uid,
        token,
        new_password: newPassword,
      });
      setMsg('Password reset! Redirecting to login...');
      setTimeout(() => navigate('/login'), 5000);
    } catch {
      setMsg('Failed to reset password. The link may have expired.');
    }
  };

  return (
    <div>
      <h2>Reset Password</h2>
      {msg && <p>{msg}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          New Password:
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
        </label>
        <br />
        <button type="submit">Set New Password</button>
      </form>
    </div>
  );
};

export default ResetPassword;
