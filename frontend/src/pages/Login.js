import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/UseAuth';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

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
  const isAuthenticated = useAuth();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      // 1. Login & save JWT token
      const response = await axios.post('/api/auth/login/', formData);
      localStorage.setItem('token', response.data.token);
      const user = {
          user_id: response.data.user_id,
          username: response.data.username,
          user_type: response.data.user_type,
        };

      localStorage.setItem("user", JSON.stringify(user));
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
      console.log(userType);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'Login failed. Please check your credentials.'
      );
    }
  };

  return !isAuthenticated ?(
    <>
    <Navbar />
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f0f2f5',
      fontFamily: 'Arial, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center'
      }}>
        <h2 style={{
          marginBottom: '30px',
          color: '#333333',
          fontSize: '28px',
          fontWeight: '600'
        }}>Welcome Back!</h2>
        {error && (
          <p style={{
            color: '#dc3545',
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '5px',
            padding: '10px 15px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label htmlFor="username" style={{
              display: 'block',
              marginBottom: '8px',
              color: '#555555',
              fontSize: '15px',
              fontWeight: 'bold'
            }}>
              Username:
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ced4da',
                borderRadius: '5px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <div style={{ marginBottom: '30px', textAlign: 'left' }}>
            <label htmlFor="password" style={{
              display: 'block',
              marginBottom: '8px',
              color: '#555555',
              fontSize: '15px',
              fontWeight: 'bold'
            }}>
              Password:
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ced4da',
                borderRadius: '5px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '14px 20px',
              border: 'none',
              borderRadius: '5px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease',
              outline: 'none'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
          >
            Log In
          </button>
        </form>
        <div style={{ marginTop: '25px' }}>
          <Link
            to="/forgot-password"
            style={{
              color: '#007bff',
              textDecoration: 'none',
              fontSize: '15px',
              transition: 'color 0.3s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = '#0056b3'}
            onMouseOut={(e) => e.currentTarget.style.color = '#007bff'}
          >
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
    <Footer/>
    </>
    
  ): <Navigate to="/dashboard" />;;
};

export default Login;