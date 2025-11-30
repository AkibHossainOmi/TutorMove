// src/pages/Signup.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { authAPI } from "../utils/apiService";

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    user_type: "student",
    phone_number: "", // Added phone_number initial state
    referrer_username: "",
  });

  useEffect(() => {
    if (location.state?.referrer_username) {
      setForm((prev) => ({
        ...prev,
        referrer_username: location.state.referrer_username,
      }));
    }
  }, [location.state]);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resendTimeout, setResendTimeout] = useState(0);

  useEffect(() => {
    let timer;
    if (resendTimeout > 0) {
      timer = setTimeout(() => setResendTimeout(resendTimeout - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimeout]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
    setSuccess("");
  };

  const handleTypeToggle = (type) => {
    setForm((prev) => ({ ...prev, user_type: type }));
  };

  const sendOtp = async () => {
    if (!form.email || !form.username || !form.password || !form.user_type) {
      setError("Please fill all required fields before sending OTP");
      return;
    }
    if (form.password !== form.confirm_password) {
      setError("Passwords do not match");
      return;
    }
    if (resendTimeout > 0) return;

    setLoading(true);
    try {
      await authAPI.sendOtp({
        email: form.email,
        purpose: "register",
        user_data: form,
      });
      setOtpSent(true);
      setResendTimeout(300);
      setSuccess("OTP sent to your email. Please check your inbox.");
    } catch (err) {
      const data = err.response?.data;
      if (err.response?.status === 409) {
        setSuccess("User is already registered with this email/username.");
        setError(null);
      } else if (err.response?.status === 429) {
        setSuccess("Please wait a moment before trying again.");
        setError(null);
      } else {
        if (data) {
          const fieldErrors = Object.entries(data)
            .map(([key, value]) =>
              Array.isArray(value) ? `${key}: ${value.join(", ")}` : `${key}: ${value}`
            )
            .join(" | ");
          setError(fieldErrors);
        } else {
          setError("Failed to send OTP");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      setError("Please enter OTP");
      return;
    }

    setLoading(true);
    try {
      await authAPI.verifyOtp({ email: form.email, otp, purpose: "register" });
      setSuccess("Registration complete! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const data = err.response?.data;
      setError(data?.error || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!otpSent) sendOtp();
    else verifyOtp();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 mt-16">
        <div className="max-w-2xl w-full space-y-8 bg-white p-10 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
              Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Log in
              </Link>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 p-4 border border-red-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}
            {success && (
              <div className="rounded-md bg-green-50 p-4 border border-green-200">
                 <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                   <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">{success}</h3>
                  </div>
                 </div>
              </div>
            )}

            <div className="bg-gray-50 p-1 rounded-lg flex mb-6">
              {["student", "tutor"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTypeToggle(type)}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none ${
                    form.user_type === type
                      ? "bg-white text-gray-900 shadow-sm ring-1 ring-black ring-opacity-5"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Join as {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={form.first_name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={form.last_name}
                  onChange={handleChange}
                />
              </div>
               <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={form.username}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
              {form.user_type === 'tutor' && (
                  <div className="">
                    <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      id="phone_number"
                      name="phone_number"
                      type="tel"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={form.phone_number}
                      onChange={handleChange}
                      placeholder="e.g. 017XXXXXXXX"
                    />
                  </div>
              )}
              <div>
                <label htmlFor="referrer_username" className="block text-sm font-medium text-gray-700 mb-1">
                  Referred By (Optional)
                </label>
                <input
                  id="referrer_username"
                  name="referrer_username"
                  type="text"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={form.referrer_username || ""}
                  onChange={handleChange}
                  placeholder="Username of who referred you"
                />
                <p className="mt-1 text-xs text-indigo-600">
                  Referrer gets 10% bonus points on your first purchase!
                </p>
              </div>
               <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={form.password}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={form.confirm_password}
                  onChange={handleChange}
                />
              </div>
            </div>

            {!otpSent ? (
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                     loading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors`}
                >
                  {loading ? "Sending..." : "Create Account"}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                 <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                      Verification Code
                    </label>
                    <input
                      id="otp"
                      type="text"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-center tracking-widest"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="XXXXXX"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                       loading ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors`}
                  >
                    {loading ? "Verifying..." : "Verify & Register"}
                  </button>
                  <button
                    type="button"
                    disabled={resendTimeout > 0}
                    onClick={sendOtp}
                     className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-lg text-sm font-medium ${
                       resendTimeout > 0 ? "text-gray-400 cursor-not-allowed" : "text-indigo-600 hover:text-indigo-500"
                    } focus:outline-none`}
                  >
                     {resendTimeout > 0 ? `Resend code in ${resendTimeout}s` : "Resend code"}
                  </button>
              </div>
            )}
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Signup;