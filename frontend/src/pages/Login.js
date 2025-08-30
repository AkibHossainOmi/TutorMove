import React, { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/UseAuth";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { authAPI } from "../utils/apiService"; // Backend API service

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
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
      const response = await authAPI.login(formData);
      const data = response.data;

      // Store token
      localStorage.setItem("token", data.access);

      // Store user info
      const user = {
        user_id: data.user_id,
        username: data.username,
        user_type: data.user_type,
      };
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.detail ||
          "Login failed. Please check your credentials."
      );
    }
  };

  if (isAuthenticated) return <Navigate to="/dashboard" />;

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 px-6">
        <div className="w-full max-w-md bg-white/70 backdrop-blur-lg shadow-xl rounded-2xl p-8 sm:p-10 border border-gray-200">
          {/* Header */}
          <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">
            Welcome Back
          </h2>
          <p className="text-gray-500 mb-8 text-center">
            Login to continue to <span className="font-semibold text-blue-600">TutorMove</span>
          </p>

          {/* Error Message */}
          {error && (
            <p className="text-sm text-red-700 bg-red-100 border border-red-300 rounded-md px-4 py-2 mb-6">
              {error}
            </p>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Username
              </label>
              <input
                type="text"
                name="username"
                id="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Enter your username"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold text-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
            >
              Log In
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 flex justify-between items-center text-sm">
            <Link
              to="/forgot-password"
              className="text-blue-600 hover:text-blue-800 transition"
            >
              Forgot password?
            </Link>
            <Link
              to="/signup"
              className="text-gray-600 hover:text-gray-800 transition"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Login;
