import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FiLock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const ResetPassword = () => {
  const { uid, token } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [msg, setMsg] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMsg(null);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/password-reset-confirm/`, {
        uid,
        token,
        new_password: newPassword,
      });
      setStatus('success');
      setMsg('Password reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 3000);
    } catch {
      setStatus('error');
      setMsg('Failed to reset password. The link may have expired.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Navbar />

      <main className="flex-grow flex items-center justify-center px-4 py-24 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-indigo-200 rounded-full blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-violet-200 rounded-full blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-10 relative z-10">

           <div className="text-center mb-8">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600 shadow-sm transform -rotate-3">
                 <FiLock size={28} />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Set New Password</h2>
              <p className="text-slate-500">
                 Please enter your new password below.
              </p>
           </div>

           {status === 'success' && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl text-sm font-medium flex items-center justify-center gap-2">
                 <FiCheckCircle className="flex-shrink-0" /> {msg}
              </div>
           )}

           {status === 'error' && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-sm font-medium flex items-center justify-center gap-2">
                 <FiAlertCircle className="flex-shrink-0" /> {msg}
              </div>
           )}

           <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                 <label className="block text-sm font-bold text-slate-700 mb-2">New Password</label>
                 <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                       <FiLock />
                    </div>
                    <input
                       type="password"
                       value={newPassword}
                       onChange={e => setNewPassword(e.target.value)}
                       required
                       placeholder="Enter new strong password"
                       className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium"
                       disabled={status === 'loading' || status === 'success'}
                    />
                 </div>
              </div>

              <button
                 type="submit"
                 disabled={status === 'loading' || status === 'success' || !newPassword}
                 className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 transform active:scale-95 disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed"
              >
                 {status === 'loading' ? (
                    <span className="flex items-center justify-center gap-2">
                       <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                       Resetting...
                    </span>
                 ) : (
                    "Reset Password"
                 )}
              </button>
           </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ResetPassword;
