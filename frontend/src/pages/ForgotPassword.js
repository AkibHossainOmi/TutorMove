import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { authAPI } from "../utils/apiService";
import { FiLock, FiMail, FiArrowLeft, FiKey, FiCheckCircle } from 'react-icons/fi';

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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Navbar />

      <main className="flex-grow flex items-center justify-center px-4 py-24 relative overflow-hidden">
         {/* Decorative Background Elements */}
         <div className="absolute top-20 left-10 w-64 h-64 bg-indigo-200 rounded-full blur-3xl opacity-20 animate-blob"></div>
         <div className="absolute bottom-10 right-10 w-64 h-64 bg-violet-200 rounded-full blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-10 relative z-10">
          <button
             onClick={() => navigate('/login')}
             className="absolute top-6 left-6 text-slate-400 hover:text-indigo-600 transition-colors"
          >
             <FiArrowLeft size={24} />
          </button>

          <div className="text-center mb-8">
             <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600 shadow-sm transform rotate-3">
                <FiLock size={28} />
             </div>
             <h2 className="text-3xl font-bold text-slate-900 mb-2">Reset Password</h2>
             <p className="text-slate-500">
                {otpSent ? "Enter the code sent to your email" : "Enter your email to receive a reset code"}
             </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-sm font-medium flex items-start gap-2 animate-shake">
               <span className="text-lg">⚠️</span> {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl text-sm font-medium flex items-start gap-2">
               <FiCheckCircle className="mt-0.5 flex-shrink-0" /> {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!otpSent && (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <FiMail />
                   </div>
                   <input
                     type="email"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     placeholder="name@example.com"
                     className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium"
                     disabled={loading}
                     autoFocus
                   />
                </div>
              </div>
            )}

            {otpSent && (
              <>
                <div className="animate-fade-in-up">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Verification Code</label>
                  <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <FiKey />
                     </div>
                     <input
                       type="text"
                       value={otp}
                       onChange={(e) => setOtp(e.target.value)}
                       placeholder="Enter 6-digit code"
                       className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium tracking-widest"
                       disabled={loading}
                       autoFocus
                     />
                  </div>
                </div>
                <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                  <label className="block text-sm font-bold text-slate-700 mb-2">New Password</label>
                  <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <FiLock />
                     </div>
                     <input
                       type="password"
                       value={newPassword}
                       onChange={(e) => setNewPassword(e.target.value)}
                       placeholder="Create a strong password"
                       className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium"
                       disabled={loading}
                     />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 transform active:scale-95 disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                 <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {otpSent ? "Resetting..." : "Sending Code..."}
                 </span>
              ) : (
                 otpSent ? "Reset Password" : "Send Reset Code"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Remembered your password?{" "}
            <span
              className="text-indigo-600 font-bold hover:text-indigo-700 cursor-pointer transition-colors"
              onClick={() => navigate("/login")}
            >
              Log In
            </span>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ForgotPassword;
