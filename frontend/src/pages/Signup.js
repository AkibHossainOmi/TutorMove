import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // Import Link for navigation

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
    // Clear messages on input change
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
      // Backend typically sends an email verification link.
      // So, we don't usually log in or set token immediately here.
      setSuccess('Registration successful! Please check your email to verify your account.');
      setLoading(false);
      // Redirect to login page after a short delay
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.detail ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        'Registration failed. Please try again.'
      );
      setLoading(false);
    }
  };

  // Inline CSS Styles
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f7fa',
    fontFamily: 'Roboto, Arial, sans-serif',
    padding: '20px',
  };

  const formCardStyle = {
    backgroundColor: '#ffffff',
    padding: '40px',
    borderRadius: '10px',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '450px',
    textAlign: 'center',
  };

  const headerStyle = {
    color: '#333333',
    fontSize: '32px',
    marginBottom: '30px',
    fontWeight: '700',
  };

  const inputGroupStyle = {
    marginBottom: '20px',
    textAlign: 'left',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    color: '#555555',
    fontSize: '15px',
    fontWeight: '600',
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    border: '1px solid #ced4da',
    borderRadius: '6px',
    fontSize: '16px',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  };

  const inputFocusStyle = {
    borderColor: '#007bff',
    boxShadow: '0 0 0 0.2rem rgba(0, 123, 255, 0.25)',
  };

  const selectStyle = {
    ...inputStyle, // Inherit base input styles
    appearance: 'none', // Remove default arrow
    paddingRight: '30px', // Make space for custom arrow if needed
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    backgroundSize: '12px',
  };

  const buttonStyle = {
    backgroundColor: '#28a745', // Green for signup
    color: 'white',
    padding: '14px 25px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, transform 0.1s ease',
    outline: 'none',
    width: '100%',
    marginTop: '10px',
  };

  const buttonHoverStyle = {
    backgroundColor: '#218838',
    transform: 'translateY(-1px)',
  };

  const buttonDisabledStyle = {
    backgroundColor: '#94d3a2',
    cursor: 'not-allowed',
  };

  const errorMessageStyle = {
    color: '#dc3545',
    backgroundColor: '#f8d7da',
    border: '1px solid #f5c6cb',
    borderRadius: '6px',
    padding: '12px 18px',
    marginBottom: '20px',
    fontSize: '14px',
    textAlign: 'center',
  };

  const successMessageStyle = {
    color: '#28a745',
    backgroundColor: '#d4edda',
    border: '1px solid #c3e6cb',
    borderRadius: '6px',
    padding: '12px 18px',
    marginBottom: '20px',
    fontSize: '14px',
    textAlign: 'center',
  };

  const loginLinkContainerStyle = {
    marginTop: '25px',
    fontSize: '15px',
    color: '#6c757d',
  };

  const loginLinkStyle = {
    color: '#007bff',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'color 0.2s ease',
  };

  const loginLinkHoverStyle = {
    color: '#0056b3',
    textDecoration: 'underline',
  };

  return (
    <div style={containerStyle}>
      <div style={formCardStyle}>
        <h2 style={headerStyle}>Create Your Account</h2>
        {error && <p style={errorMessageStyle}>{error}</p>}
        {success && <p style={successMessageStyle}>{success}</p>}

        <form onSubmit={handleSubmit}>
          <div style={inputGroupStyle}>
            <label htmlFor="username" style={labelStyle}>
              Username:
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
              style={inputStyle}
              onFocus={(e) => Object.assign(e.currentTarget.style, inputFocusStyle)}
              onBlur={(e) => Object.assign(e.currentTarget.style, inputStyle)}
            />
          </div>

          <div style={inputGroupStyle}>
            <label htmlFor="email" style={labelStyle}>
              Email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              style={inputStyle}
              onFocus={(e) => Object.assign(e.currentTarget.style, inputFocusStyle)}
              onBlur={(e) => Object.assign(e.currentTarget.style, inputStyle)}
            />
          </div>

          <div style={inputGroupStyle}>
            <label htmlFor="password" style={labelStyle}>
              Password:
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              style={inputStyle}
              onFocus={(e) => Object.assign(e.currentTarget.style, inputFocusStyle)}
              onBlur={(e) => Object.assign(e.currentTarget.style, inputStyle)}
            />
          </div>

          <div style={inputGroupStyle}>
            <label htmlFor="user_type" style={labelStyle}>
              Join as:
            </label>
            <select
              id="user_type"
              name="user_type"
              value={formData.user_type}
              onChange={handleChange}
              disabled={loading}
              style={selectStyle}
              onFocus={(e) => Object.assign(e.currentTarget.style, inputFocusStyle)}
              onBlur={(e) => Object.assign(e.currentTarget.style, selectStyle)} // Reset to original select style
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={loading ? { ...buttonStyle, ...buttonDisabledStyle } : buttonStyle}
            onMouseEnter={loading ? null : (e) => Object.assign(e.currentTarget.style, buttonHoverStyle)}
            onMouseLeave={loading ? null : (e) => Object.assign(e.currentTarget.style, buttonStyle)}
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>

        <div style={loginLinkContainerStyle}>
          <p>
            Already have an account?{' '}
            <Link
              to="/login"
              style={loginLinkStyle}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, loginLinkHoverStyle)}
              onMouseLeave={(e) => Object.assign(e.currentTarget.style, loginLinkStyle)}
            >
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;