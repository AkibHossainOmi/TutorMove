import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    user_type: 'student',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess('');
    setLoading(true);
    try {
      const response = await axios.post('/api/users/register/', formData);
      // Save JWT token if you want (usually not used until email verification)
      // localStorage.setItem('token', response.data.token);
      setSuccess('Registration successful! Please check your email to verify your account.');
      setLoading(false);
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.detail ||
        (typeof err.response?.data === 'string' ? err.response.data : '') ||
        'Registration failed'
      );
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Sign Up</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Username:<br />
          <input type="text" name="username" value={formData.username} onChange={handleChange} required disabled={loading} />
        </label>
        <br />
        <label>
          Email:<br />
          <input type="email" name="email" value={formData.email} onChange={handleChange} required disabled={loading} />
        </label>
        <br />
        <label>
          Password:<br />
          <input type="password" name="password" value={formData.password} onChange={handleChange} required disabled={loading} />
        </label>
        <br />
        <label>
          User Type:<br />
          <select name="user_type" value={formData.user_type} onChange={handleChange} disabled={loading}>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        </label>
        <br />
        <button type="submit" disabled={loading}>{loading ? 'Signing up...' : 'Sign Up'}</button>
      </form>
      <div style={{ marginTop: '20px' }}>
        <p>
          Already have an account? <a href="/login">Login here</a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
