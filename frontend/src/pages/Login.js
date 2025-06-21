import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      // 1. Login & save JWT token
      const response = await axios.post('/api/auth/login/', formData);
      localStorage.setItem('token', response.data.token);
      

      // 2. Get user info (user_type) to redirect properly
      let userType = null;

      // Option A: If backend returns user_type in login response:
      if (response.data.user_type) {
        userType = response.data.user_type;
      } else {
        // Option B: Fetch user info after login using the token
        const userRes = await axios.get('/api/users/me/', {
          headers: { Authorization: `Bearer ${response.data.token}` },
        });
        userType = userRes.data.user_type;
      }

      // 3. Redirect based on user type
      if (userType === 'teacher') {
        navigate('/teacher-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'Login failed'
      );
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Username:
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <label>
          Password:
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <button type="submit">Login</button>
      </form>
      <div style={{ marginTop: 15 }}>
        <Link to="/forgot-password" style={{ color: '#007bff', textDecoration: 'underline' }}>
          Forgot password?
        </Link>
      </div>
    </div>
  );
};

export default Login;
