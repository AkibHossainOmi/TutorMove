import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { authAPI } from "../utils/apiService";

const FIELD_BASE =
  "w-full rounded-xl border border-gray-200 bg-white/60 backdrop-blur px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500";

const LABEL_BASE = "block text-sm font-medium text-gray-700 mb-1";

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    user_type: "student",
  });
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
    if (resendTimeout > 0) return; // throttle resend

    setLoading(true);
    try {
      await authAPI.sendOtp({
        email: form.email,
        purpose: "register",
        user_data: form,
      });
      setOtpSent(true);
      setResendTimeout(300); // 30s cooldown before resend
      setSuccess("OTP sent to your email. Please check your inbox.");
    } catch (err) {
      const data = err.response?.data;
      if(err.response?.status === 409)
      {
         setSuccess("Email is already registered.");
         setError(null);
      }
      else if(err.response?.status === 429)
      {
         setSuccess("Please wait a moment before trying again.");
         setError(null);
      }
      else
      {
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
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50 flex items-center justify-center py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
            {/* Left: Aesthetic */}
            <div className="hidden md:flex relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-sky-500 text-white p-10 shadow-2xl">
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
              <div className="relative z-10 flex flex-col justify-end">
                <h1 className="text-4xl font-extrabold leading-tight">Join TutorMove</h1>
                <p className="mt-4 text-white/90 text-lg">
                  Create your account as a student or tutor and start your learning journey.
                </p>
                <ul className="mt-8 space-y-3 text-white/90">
                  <li className="flex items-center gap-3">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20">✓</span>
                    Seamless registration
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20">✓</span>
                    Secure email verification
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20">✓</span>
                    Personalized dashboard
                  </li>
                </ul>
              </div>
            </div>

            {/* Right: Form Card */}
            <div className="relative">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-indigo-200 to-sky-200 blur opacity-60" />
              <div className="relative rounded-3xl bg-white shadow-xl p-8 md:p-10">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
                  <p className="text-sm text-gray-500 mt-1">Sign up as a student or tutor.</p>
                </div>

                {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
                {success && <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Names */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL_BASE}>First Name</label>
                      <input
                        name="first_name"
                        value={form.first_name}
                        onChange={handleChange}
                        placeholder="Enter first name"
                        className={FIELD_BASE}
                      />
                    </div>
                    <div>
                      <label className={LABEL_BASE}>Last Name</label>
                      <input
                        name="last_name"
                        value={form.last_name}
                        onChange={handleChange}
                        placeholder="Enter last name"
                        className={FIELD_BASE}
                      />
                    </div>
                  </div>

                  {/* Username + Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL_BASE}>Username</label>
                      <input
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        placeholder="Choose a username"
                        className={FIELD_BASE}
                      />
                    </div>
                    <div>
                      <label className={LABEL_BASE}>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="your.email@example.com"
                        className={FIELD_BASE}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL_BASE}>Password</label>
                      <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Enter password"
                        className={FIELD_BASE}
                      />
                    </div>
                    <div>
                      <label className={LABEL_BASE}>Confirm Password</label>
                      <input
                        type="password"
                        name="confirm_password"
                        value={form.confirm_password}
                        onChange={handleChange}
                        placeholder="Confirm password"
                        className={FIELD_BASE}
                      />
                    </div>
                  </div>

                  {/* User type */}
                  <div>
                    <label className={LABEL_BASE}>I want to join as a</label>
                    <div className="flex rounded-xl border border-gray-200 overflow-hidden text-sm shadow-sm">
                      {["student", "tutor"].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handleTypeToggle(type)}
                          className={`flex-1 py-3 font-medium transition-all duration-300 ${
                            form.user_type === type ? "bg-indigo-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* OTP / Send button */}
                  {!otpSent ? (
                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full rounded-xl px-4 py-3 text-sm font-semibold text-white transition shadow ${
                        loading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
                      }`}
                    >
                      {loading ? "Sending OTP..." : "Sign Up"}
                    </button>
                  ) : (
                    <>
                      <div>
                        <label className={LABEL_BASE}>Verification Code</label>
                        <input
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="Enter 6-digit code"
                          className={FIELD_BASE}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className={`w-full rounded-xl px-4 py-3 text-sm font-semibold text-white transition shadow ${
                          loading ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        {loading ? "Verifying..." : "Verify & Register"}
                      </button>
                      <button
                        type="button"
                        disabled={resendTimeout > 0}
                        onClick={sendOtp}
                        className={`w-full rounded-xl px-4 py-3 text-sm font-semibold text-white mt-2 transition shadow ${
                          resendTimeout > 0 ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-500 hover:bg-indigo-600"
                        }`}
                      >
                        {resendTimeout > 0 ? `Resend OTP in ${resendTimeout}s` : "Resend OTP"}
                      </button>
                    </>
                  )}
                </form>

                <div className="mt-6 text-center text-sm">
                  <span className="text-gray-600">Already have an account? </span>
                  <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-800 transition">
                    Sign In
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

export default Signup;
