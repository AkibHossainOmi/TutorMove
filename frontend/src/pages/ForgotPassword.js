import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { authAPI } from "../utils/apiService";

const FIELD_BASE =
  "w-full rounded-xl border border-gray-200 bg-white/60 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition";

const LABEL_BASE = "block text-sm font-medium text-gray-700 mb-1";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Step 1: Request OTP
  const sendOtp = async () => {
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await authAPI.sendOtp({ email, purpose: "password-reset" });
      setOtpSent(true);
      setSuccess("OTP sent to your email. It expires in 5 minutes.");
    } catch (err) {
      if (err.response?.status === 429) {
        setError("Please wait a moment before trying again.");
      } else {
        setError(err.response?.data?.error || "Failed to send OTP.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP + reset password
  const resetPassword = async () => {
    if (!otp.trim() || !newPassword.trim()) {
      setError("Please enter OTP and new password.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await authAPI.resetPassword({
        email,
        otp,
        new_password: newPassword,
      });
      setSuccess("Password reset successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.error || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!otpSent) sendOtp();
    else resetPassword();
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center py-16 bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-xl shadow p-6">
          <h2 className="text-2xl font-bold mb-2 text-center">Reset Password</h2>
          <p className="text-sm text-gray-500 mb-4 text-center">
            Enter your email to get an OTP, then set your new password.
          </p>

          {error && (
            <div className="mb-3 text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-3 text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!otpSent && (
              <div>
                <label className={LABEL_BASE}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className={FIELD_BASE}
                  disabled={loading}
                />
              </div>
            )}

            {otpSent && (
              <>
                <div>
                  <label className={LABEL_BASE}>OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    className={FIELD_BASE}
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className={LABEL_BASE}>New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className={FIELD_BASE}
                    disabled={loading}
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
            >
              {loading ? (otpSent ? "Resetting..." : "Sending...") : otpSent ? "Reset Password" : "Send OTP"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm">
            Remember your password?{" "}
            <span
              className="text-indigo-600 hover:underline cursor-pointer"
              onClick={() => navigate("/login")}
            >
              Log in
            </span>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ForgotPassword;
