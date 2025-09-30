import React, { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/UseAuth";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { authAPI, userApi } from "../utils/apiService"; // Backend API service

const FIELD_BASE =
  "w-full rounded-xl border border-gray-200 bg-white/60 backdrop-blur px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500";

const LABEL_BASE = "block text-sm font-medium text-gray-700 mb-1";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.username.trim() || !formData.password.trim()) {
      setError("Please enter both username/email and password.");
      setLoading(false);
      return;
    }

    try {
      // Send username (can be actual username or email) and password
      const response = await authAPI.login({
        username: formData.username,
        password: formData.password,
      });

      const data = response.data;

      // Store token
      localStorage.setItem("token", data.access);

      // Fetch and store user profile
      const user = await userApi.getUser();
      user.data.user_id = user.data.id;
      localStorage.setItem("user", JSON.stringify(user.data));

      navigate("/dashboard");
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Login failed. Please check your credentials.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) return <Navigate to="/dashboard" />;

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50 flex items-center justify-center py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
            {/* Left Side */}
            <div className="hidden md:flex relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-sky-500 text-white p-10 shadow-2xl">
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
              <div className="relative z-10 flex flex-col justify-end">
                <h1 className="text-4xl font-extrabold leading-tight">
                  Log in to TutorMove
                </h1>
                <p className="mt-4 text-white/90 text-lg">
                  Access your personalized dashboard, connect with students or tutors, and manage your learning journey.
                </p>
                <ul className="mt-8 space-y-3 text-white/90">
                  <li className="flex items-center gap-3">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20">✓</span> Seamless return
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20">✓</span> Secure authentication
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20">✓</span> All your data, instantly
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Side: Form */}
            <div className="relative">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-indigo-200 to-sky-200 blur opacity-60" />
              <div className="relative rounded-3xl bg-white shadow-xl p-8 md:p-10">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Welcome Back!</h2>
                  <p className="text-sm text-gray-500 mt-1">Sign in to your account.</p>
                </div>

                {error && (
                  <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="email" className={LABEL_BASE}>
                      Email
                    </label>
                    <input
                      type="email"
                      name="username"
                      id="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      placeholder="Your username or email"
                      className={FIELD_BASE}
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className={LABEL_BASE}>
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      id="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Your password"
                      className={FIELD_BASE}
                      disabled={loading}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full rounded-xl px-4 py-3 text-sm font-semibold text-white transition shadow ${
                      loading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
                    }`}
                  >
                    {loading ? "Logging In..." : "Log In"}
                  </button>
                </form>

                <div className="mt-6 text-center text-sm">
                  <Link
                    to="/forgot-password"
                    className="font-medium text-indigo-600 hover:text-indigo-800 transition mr-4"
                  >
                    Forgot password?
                  </Link>
                  <span className="text-gray-600"> or </span>
                  <Link
                    to="/signup"
                    className="font-medium text-gray-600 hover:text-gray-800 transition ml-4"
                  >
                    Create an account
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Login;
