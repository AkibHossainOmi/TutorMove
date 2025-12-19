// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/UseAuth";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { authAPI, userApi } from "../utils/apiService";
import { LogIn, Mail, Lock } from "lucide-react";

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
      const response = await authAPI.login({
        username: formData.username,
        password: formData.password,
      });

      const data = response.data;
      localStorage.setItem("token", data.access);

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
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col transition-colors duration-300">
      <Navbar />

      <div className="flex-grow flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background blobs for colorful vibe */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary-500/10 rounded-full blur-[100px] animate-float"></div>

        <div className="max-w-md w-full relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
          {/* Card with simple modern header */}
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="px-8 pt-10 pb-6 text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary-500/20 text-white transform rotate-3 hover:rotate-6 transition-transform">
                <LogIn className="w-7 h-7" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                Welcome Back
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Sign in to your account to continue
              </p>
            </div>

            <div className="px-8 pb-10">
              <form className="space-y-5" onSubmit={handleSubmit}>
                {error && (
                  <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 flex items-start gap-3">
                    <svg className="w-5 h-5 text-rose-500 dark:text-rose-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm font-medium text-rose-800 dark:text-rose-300">{error}</p>
                  </div>
                )}

                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Email or Username
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                    </div>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      required
                      className="input-field pl-10"
                      placeholder="name@example.com"
                      value={formData.username}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    <Link to="/forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      className="input-field pl-10"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full btn btn-primary py-3 ${loading ? 'cursor-wait opacity-80' : ''}`}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Don't have an account?{" "}
                  <Link to="/signup" className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors">
                    Create account
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
