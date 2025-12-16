import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { authAPI } from '../utils/apiService';
import { FiCheckCircle, FiAlertCircle, FiLoader, FiMail } from 'react-icons/fi';

const VerifyEmail = () => {
  const { uid, token } = useParams();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');
  const hasVerified = useRef(false);

  useEffect(() => {
    if (hasVerified.current) return;
    hasVerified.current = true;

    const verifyEmail = async () => {
      try {
        const res = await authAPI.verifyEmail(uid, token);
        setStatus('success');
        setMessage(res.data.detail || 'Email verified successfully.');
      } catch (err) {
        setStatus('error');
        setMessage(
          err.response?.data?.detail ||
          err.response?.data?.error ||
          'Verification link is invalid or expired.'
        );
      }
    };

    verifyEmail();
  }, [uid, token]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Navbar />

      <main className="flex-grow flex items-center justify-center px-4 py-24 relative overflow-hidden">

        {/* Decorative elements */}
        <div className="absolute top-20 left-20 w-80 h-80 bg-emerald-100 rounded-full blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-indigo-100 rounded-full blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-10 text-center relative z-10">

          {status === 'loading' && (
             <div className="flex flex-col items-center animate-fade-in">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 text-indigo-600">
                   <FiLoader className="w-10 h-10 animate-spin" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Verifying Email...</h2>
                <p className="text-slate-500">Please wait while we confirm your email address.</p>
             </div>
          )}

          {status === 'success' && (
             <div className="flex flex-col items-center animate-fade-in-up">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 text-emerald-500 shadow-sm">
                   <FiCheckCircle className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Email Verified!</h2>
                <p className="text-slate-500 mb-8">{message}</p>
                <Link
                   to="/login"
                   className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 block"
                >
                   Continue to Login
                </Link>
             </div>
          )}

          {status === 'error' && (
             <div className="flex flex-col items-center animate-fade-in-up">
                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6 text-rose-500 shadow-sm">
                   <FiAlertCircle className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Verification Failed</h2>
                <p className="text-slate-500 mb-8 max-w-xs mx-auto">{message}</p>
                <div className="flex flex-col gap-3 w-full">
                   <Link
                      to="/login"
                      className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                   >
                      Back to Login
                   </Link>
                   <Link
                      to="/contact"
                      className="w-full py-3.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                   >
                      Contact Support
                   </Link>
                </div>
             </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VerifyEmail;
