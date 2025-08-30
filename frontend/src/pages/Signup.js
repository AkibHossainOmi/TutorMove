import React, { useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, Link, Navigate } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useAuth } from "../contexts/UseAuth";

const FIELD_BASE =
  "w-full rounded-xl border border-gray-200 bg-white/60 backdrop-blur px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed";

const LABEL_BASE = "block text-sm font-medium text-gray-700 mb-1";

const Signup = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth(); // Destructure isAuthenticated from useAuth

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    account_type: "student", // 'student' | 'tutor'

    // Tutor-only
    education: "",
    phone: "",
    experience: "", // years or summary
    location: "",
  });

  const [loading, setLoading] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpLocked, setOtpLocked] = useState(false); // lock all fields after Send OTP click
  const [otpCode, setOtpCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API = process.env.REACT_APP_API_URL;

  const isTutor = useMemo(() => form.account_type === "tutor", [form.account_type]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  };

  const validateBaseFields = () => {
    if (!form.first_name.trim()) return "First name is required";
    if (!form.last_name.trim()) return "Last name is required";
    if (!form.username.trim()) return "Username is required";
    if (!form.email.trim()) return "Email is required";

    // simple email check
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    if (!emailOk) return "Please enter a valid email";
    return null;
  };

  const validateTutorFields = () => {
    if (!form.education.trim()) return "Education is required for tutors";
    if (!form.phone.trim()) return "Phone number is required for tutors";
    if (!form.experience.toString().trim()) return "Experience is required for tutors";
    if (!form.location.trim()) return "Location is required for tutors";
    return null;
  };

  // STUDENT: directly register
  const registerStudent = async () => {
    const baseErr = validateBaseFields();
    if (baseErr) {
      setError(baseErr);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        first_name: form.first_name,
        last_name: form.last_name,
        username: form.username,
        email: form.email,
        user_type: "student",
      };

      const res = await axios.post(`${API}/api/auth/register/`, payload);
      // Assume success → navigate to login
      setSuccess("Registration successful! You can now log in.");
      setTimeout(() => navigate("/login"), 1400);
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        (typeof err?.response?.data === "string" ? err.response.data : null) ||
        "Registration failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // TUTOR: Send OTP → lock fields
  const sendOtp = async () => {
    const baseErr = validateBaseFields();
    if (baseErr) {
      setError(baseErr);
      return;
    }
    const tutorErr = validateTutorFields();
    if (tutorErr) {
      setError(tutorErr);
      return;
    }

    setOtpSending(true);
    setError("");
    setSuccess("");

    try {
      await axios.post(`${API}/api/auth/send-otp/`, { email: form.email });
      setOtpSent(true);
      setOtpLocked(true); // lock all fields
      setSuccess("OTP sent to your email. Please check your inbox.");
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        (typeof err?.response?.data === "string" ? err.response.data : null) ||
        "Failed to send OTP. Please try again.";
      setError(msg);
      setOtpLocked(false); // keep editable if sending failed
    } finally {
      setOtpSending(false);
    }
  };

  // TUTOR: Verify OTP → on success, persist to DB (register)
  const verifyAndRegisterTutor = async () => {
    if (!otpCode.trim()) {
      setError("Please enter the verification code from your email");
      return;
    }

    setVerifying(true);
    setError("");
    setSuccess("");

    try {
      await axios.post(`${API}/api/auth/verify-otp/`, {
        email: form.email,
        code: otpCode.trim(),
      });

      const payload = {
        first_name: form.first_name,
        last_name: form.last_name,
        username: form.username,
        email: form.email,
        user_type: "tutor",
        education: form.education,
        phone: form.phone,
        experience: form.experience,
        location: form.location,
      };

      await axios.post(`${API}/api/auth/register/`, payload);

      setSuccess("Verified! Your tutor profile has been created.");
      setTimeout(() => navigate("/login"), 1400);
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        (typeof err?.response?.data === "string" ? err.response.data : null) ||
        "Verification failed. Please check the code and try again.";
      setError(msg);
    } finally {
      setVerifying(false);
    }
  };

  const disabledAll = loading || otpLocked || verifying; // lock when verifying or after OTP sent

  if (isAuthenticated) return <Navigate to="/dashboard" />;

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50 flex items-center justify-center py-16">
        <div className="max-w-6xl mx-auto px-6">
          {/* Shell */}
          <div className="grid md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto"> {/* Added max-w-4xl and mx-auto for centering content */}
            {/* Left: Marketing / Aesthetic */}
            <div className="hidden md:flex relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-sky-500 text-white p-10 shadow-2xl">
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
              <div className="relative z-10 flex flex-col justify-end">
                <h1 className="text-4xl font-extrabold leading-tight">
                  Join as a Student or Tutor
                </h1>
                <p className="mt-4 text-white/90 text-lg">
                  Create your account in seconds. Tutors get verified with a
                  quick OTP to keep our community safe.
                </p>
                <ul className="mt-8 space-y-3 text-white/90">
                  <li className="flex items-center gap-3"><span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20">✓</span> Clean, modern UI</li>
                  <li className="flex items-center gap-3"><span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20">✓</span> Secure email verification</li>
                  <li className="flex items-center gap-3"><span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20">✓</span> Fast onboarding</li>
                </ul>
              </div>
            </div>

            {/* Right: Form Card */}
            <div className="relative">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-indigo-200 to-sky-200 blur opacity-60" />
              <div className="relative rounded-3xl bg-white shadow-xl p-8 md:p-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
                    <p className="text-sm text-gray-500 mt-1">It only takes a minute.</p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                    <span className={`h-2 w-2 rounded-full ${isTutor ? "bg-amber-500" : "bg-emerald-500"}`} />
                    {isTutor ? "Tutor" : "Student"}
                  </span>
                </div>

                {/* Alerts */}
                {error && (
                  <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {success}
                  </div>
                )}

                {/* Form */}
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL_BASE} htmlFor="first_name">First Name</label>
                      <input
                        id="first_name"
                        name="first_name"
                        type="text"
                        value={form.first_name}
                        onChange={handleChange}
                        disabled={disabledAll}
                        className={FIELD_BASE}
                        placeholder="e.g., Ayesha"
                      />
                    </div>
                    <div>
                      <label className={LABEL_BASE} htmlFor="last_name">Last Name</label>
                      <input
                        id="last_name"
                        name="last_name"
                        type="text"
                        value={form.last_name}
                        onChange={handleChange}
                        disabled={disabledAll}
                        className={FIELD_BASE}
                        placeholder="e.g., Rahman"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL_BASE} htmlFor="username">Username</label>
                      <input
                        id="username"
                        name="username"
                        type="text"
                        value={form.username}
                        onChange={handleChange}
                        disabled={disabledAll}
                        className={FIELD_BASE}
                        placeholder="yourcoolname"
                      />
                    </div>
                    <div>
                      <label className={LABEL_BASE} htmlFor="email">Email</label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        disabled={disabledAll}
                        className={FIELD_BASE}
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={LABEL_BASE} htmlFor="account_type">Account Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => !otpLocked && setForm((p) => ({ ...p, account_type: "student" }))}
                        className={`rounded-xl px-4 py-3 text-sm font-medium border transition ${
                          form.account_type === "student"
                            ? "bg-indigo-600 text-white border-indigo-600 shadow"
                            : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                        } ${otpLocked ? "opacity-70 cursor-not-allowed" : ""}`}
                        disabled={otpLocked}
                      >
                        Student
                      </button>
                      <button
                        type="button"
                        onClick={() => !otpLocked && setForm((p) => ({ ...p, account_type: "tutor" }))}
                        className={`rounded-xl px-4 py-3 text-sm font-medium border transition ${
                          form.account_type === "tutor"
                            ? "bg-amber-500 text-white border-amber-500 shadow"
                            : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                        } ${otpLocked ? "opacity-70 cursor-not-allowed" : ""}`}
                        disabled={otpLocked}
                      >
                        Tutor
                      </button>
                    </div>
                  </div>

                  {isTutor && (
                    <div className="space-y-4">
                      <div>
                        <label className={LABEL_BASE} htmlFor="education">Education</label>
                        <input
                          id="education"
                          name="education"
                          type="text"
                          value={form.education}
                          onChange={handleChange}
                          disabled={disabledAll}
                          className={FIELD_BASE}
                          placeholder="e.g., B.Sc. in Mathematics"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={LABEL_BASE} htmlFor="phone">Phone Number</label>
                          <input
                            id="phone"
                            name="phone"
                            type="tel"
                            inputMode="tel"
                            value={form.phone}
                            onChange={handleChange}
                            disabled={disabledAll}
                            className={FIELD_BASE}
                            placeholder="e.g., +8801XXXXXXXXX"
                          />
                        </div>
                        <div>
                          <label className={LABEL_BASE} htmlFor="experience">Experience</label>
                          <input
                            id="experience"
                            name="experience"
                            type="text"
                            value={form.experience}
                            onChange={handleChange}
                            disabled={disabledAll}
                            className={FIELD_BASE}
                            placeholder="e.g., 3 years"
                          />
                        </div>
                      </div>
                      <div>
                        <label className={LABEL_BASE} htmlFor="location">Location</label>
                        <input
                          id="location"
                          name="location"
                          type="text"
                          value={form.location}
                          onChange={handleChange}
                          disabled={disabledAll}
                          className={FIELD_BASE}
                          placeholder="City, Country"
                        />
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {!isTutor && (
                    <button
                      type="button"
                      onClick={registerStudent}
                      disabled={loading}
                      className={`w-full rounded-xl px-4 py-3 text-sm font-semibold text-white transition shadow ${
                        loading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
                      }`}
                    >
                      {loading ? "Creating account..." : "Sign Up"}
                    </button>
                  )}

                  {isTutor && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        <button
                          type="button"
                          onClick={sendOtp}
                          disabled={otpSending || otpLocked}
                          className={`col-span-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition shadow ${
                            otpSending || otpLocked
                              ? "bg-amber-300 cursor-not-allowed"
                              : "bg-amber-500 hover:bg-amber-600"
                          }`}
                        >
                          {otpSending ? "Sending OTP..." : otpSent ? "OTP Sent" : "Send OTP"}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            // allow editing again only if OTP not yet sent
                            if (!otpSent) {
                              setOtpLocked(false);
                              setError("");
                            }
                          }}
                          disabled={otpSent}
                          className={`rounded-xl px-4 py-3 text-sm font-medium border transition ${
                            otpSent
                              ? "border-gray-200 text-gray-400 cursor-not-allowed"
                              : "border-gray-300 text-gray-700 hover:border-gray-400"
                          }`}
                        >
                          Edit Fields
                        </button>
                      </div>

                      {otpSent && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
                          <div className="sm:col-span-2">
                            <label className={LABEL_BASE} htmlFor="otp">Verify Code</label>
                            <input
                              id="otp"
                              name="otp"
                              type="text"
                              inputMode="numeric"
                              value={otpCode}
                              onChange={(e) => setOtpCode(e.target.value)}
                              disabled={verifying}
                              className={FIELD_BASE}
                              placeholder="Enter 6-digit code"
                            />
                          </div>
                          <div className="pt-6 sm:pt-0 flex">
                            <button
                              type="button"
                              onClick={verifyAndRegisterTutor}
                              disabled={verifying}
                              className={`w-full rounded-xl px-4 py-3 text-sm font-semibold text-white transition shadow ${
                                verifying ? "bg-emerald-300 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"
                              }`}
                            >
                              {verifying ? "Verifying..." : "Verify & Create"}
                            </button>
                          </div>
                        </div>
                      )}

                      {otpSent && (
                        <button
                          type="button"
                          onClick={sendOtp}
                          disabled={otpSending}
                          className={`w-full rounded-xl px-4 py-3 text-xs font-medium border transition ${
                            otpSending ? "border-gray-200 text-gray-400" : "border-gray-300 text-gray-600 hover:border-gray-400"
                          }`}
                        >
                          {otpSending ? "Resending..." : "Resend OTP"}
                        </button>
                      )}
                    </div>
                  )}

                  <p className="text-center text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-800">
                      Log in
                    </Link>
                  </p>
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