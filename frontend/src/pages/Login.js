import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/UseAuth';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Import authAPI from your api service module
import { authAPI } from '../utils/apiService'; // Adjust path if needed

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const isAuthenticated = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      // Use authAPI.login instead of axios.post directly
      const response = await authAPI.login(formData);
      const data = response.data;

      // Store access token
      localStorage.setItem('token', data.access);

      // Store user info
      const user = {
        user_id: data.user_id,
        username: data.username,
        user_type: data.user_type,
      };
      localStorage.setItem('user', JSON.stringify(user));

      console.log('Login successful, navigating to dashboard...');
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'Login failed. Please check your credentials.'
      );
    }
  };

  if (isAuthenticated) return <Navigate to="/dashboard" />;

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
        <div className="bg-white p-10 rounded-lg shadow-md w-full max-w-md text-center">
          <h2 className="mb-6 text-2xl font-semibold text-gray-800">Welcome Back!</h2>

          {error && (
            <p className="text-sm text-red-700 bg-red-100 border border-red-300 rounded px-4 py-2 mb-5">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="mb-5 text-left">
              <label htmlFor="username" className="block mb-2 text-sm font-semibold text-gray-700">
                Username:
              </label>
              <input
                type="text"
                name="username"
                id="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="mb-6 text-left">
              <label htmlFor="password" className="block mb-2 text-sm font-semibold text-gray-700">
                Password:
              </label>
              <input
                type="password"
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white py-3 rounded font-semibold text-lg hover:bg-blue-700 transition duration-300"
            >
              Log In
            </button>
          </form>

          <div className="mt-6">
            <Link
              to="/forgot-password"
              className="text-blue-600 text-sm hover:text-blue-800 transition"
            >
              Forgot password?
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Login;
