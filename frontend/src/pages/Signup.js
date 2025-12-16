// src/pages/Signup.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { authAPI } from "../utils/apiService";
import { User, Mail, Lock, Phone, UserPlus, ArrowRight, ShieldCheck } from "lucide-react";

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
    phone_number: "",
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 mt-16">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
             {/* Header */}
            <div className="bg-slate-900 px-8 py-10 text-center">
               <div className="mx-auto w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20">
                 <UserPlus className="w-6 h-6 text-white" />
               </div>
               <h2 className="text-2xl font-bold text-white tracking-tight">
                Create Account
               </h2>
               <p className="mt-2 text-slate-400 text-sm">
                 Join our community of learners and educators today.
               </p>
            </div>

            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                 {/* Role Selection */}
                 {!otpSent && (
                   <div className="bg-slate-50 p-1.5 rounded-xl flex">
                    {["student", "tutor"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleTypeToggle(type)}
                        className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none ${
                          form.user_type === type
                            ? "bg-white text-slate-900 shadow-sm ring-1 ring-black/5"
                            : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
                        }`}
                      >
                        Join as {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                 )}

                {error && (
                  <div className="p-4 rounded-lg bg-rose-50 border border-rose-100 flex items-start gap-3">
                    <svg className="w-5 h-5 text-rose-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm font-medium text-rose-800">{error}</p>
                  </div>
                )}
                {success && (
                  <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100 flex items-start gap-3">
                     <ShieldCheck className="w-5 h-5 text-emerald-500 mt-0.5" />
                     <p className="text-sm font-medium text-emerald-800">{success}</p>
                  </div>
                )}

                <div className={`space-y-6 ${otpSent ? 'opacity-50 pointer-events-none hidden' : ''}`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">First Name</label>
                      <input
                        name="first_name"
                        type="text"
                        required
                        className="block w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        value={form.first_name}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Last Name</label>
                      <input
                        name="last_name"
                        type="text"
                        required
                        className="block w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        value={form.last_name}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
                     <div className="relative">
                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-slate-400" />
                       </div>
                       <input
                          name="username"
                          type="text"
                          required
                          className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                          value={form.username}
                          onChange={handleChange}
                          placeholder="johndoe"
                        />
                     </div>
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                     <div className="relative">
                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-slate-400" />
                       </div>
                       <input
                          name="email"
                          type="email"
                          required
                          className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="john@example.com"
                        />
                     </div>
                  </div>

                  {form.user_type === 'tutor' && (
                     <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
                       <div className="relative">
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Phone className="h-5 w-5 text-slate-400" />
                         </div>
                         <input
                            name="phone_number"
                            type="tel"
                            required
                            className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            value={form.phone_number}
                            onChange={handleChange}
                            placeholder="+1 (555) 000-0000"
                          />
                       </div>
                     </div>
                  )}

                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1.5">
                       Referrer Username <span className="text-slate-400 font-normal">(Optional)</span>
                     </label>
                     <input
                        name="referrer_username"
                        type="text"
                        className="block w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        value={form.referrer_username || ""}
                        onChange={handleChange}
                        placeholder="Who invited you?"
                      />
                      <p className="mt-1.5 text-xs text-indigo-600 font-medium">
                        ✨ Referrer gets a 10% bonus on your first purchase!
                      </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                           <Lock className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                           name="password"
                           type="password"
                           required
                           className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                           value={form.password}
                           onChange={handleChange}
                         />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
                       <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                           <Lock className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                           name="confirm_password"
                           type="password"
                           required
                           className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                           value={form.confirm_password}
                           onChange={handleChange}
                         />
                      </div>
                    </div>
                  </div>
                </div>

                {otpSent && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="text-center mb-6">
                       <h3 className="text-lg font-semibold text-slate-900">Verify Your Email</h3>
                       <p className="text-sm text-slate-500 mt-1">
                         We sent a code to <span className="font-medium text-slate-900">{form.email}</span>
                       </p>
                    </div>
                    <div className="max-w-xs mx-auto">
                      <label className="sr-only">Verification Code</label>
                      <input
                        type="text"
                        className="block w-full text-center text-2xl tracking-[0.5em] font-bold px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="000000"
                        maxLength={6}
                      />
                    </div>
                  </div>
                )}

                <div className="pt-2">
                   {!otpSent ? (
                      <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all ${
                          loading ? 'opacity-75 cursor-wait' : ''
                        }`}
                      >
                        {loading ? 'Processing...' : 'Create Account'}
                        {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
                      </button>
                   ) : (
                      <div className="space-y-3">
                         <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all ${
                              loading ? 'opacity-75 cursor-wait' : ''
                            }`}
                          >
                            {loading ? 'Verifying...' : 'Verify Email & Register'}
                          </button>
                          <button
                            type="button"
                            disabled={resendTimeout > 0}
                            onClick={sendOtp}
                             className={`w-full py-2 px-4 text-sm font-medium text-indigo-600 hover:text-indigo-700 disabled:text-slate-400 disabled:cursor-not-allowed`}
                          >
                             {resendTimeout > 0 ? `Resend code in ${resendTimeout}s` : "Resend Verification Code"}
                          </button>
                      </div>
                   )}
                </div>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-slate-600">
                  Already have an account?{" "}
                  <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                    Log in
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

export default Signup;
