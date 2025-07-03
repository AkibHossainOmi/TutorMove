import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const VerifyEmail = () => {
  const { uid, token } = useParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/verify-email/${uid}/${token}/`);
        setStatus('success');
        setMessage(res.data.detail || 'Email verified! You can now log in.');
      } catch (err) {
        setStatus('error');
        setMessage(
          err.response?.data?.error ||
          err.response?.data?.detail ||
          'Verification link is invalid or expired.'
        );
      }
    };
    verify();
  }, [uid, token]);

  return (
    <>
      <Navbar />
      <div className="h-12"></div>
      <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-md text-center">
        {status === 'loading' && <p className="text-gray-600">Verifying your email...</p>}
        {status !== 'loading' && (
          <>
            <h2 className={`text-2xl font-semibold mb-4 ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {status === 'success' ? 'Success!' : 'Verification Failed'}
            </h2>
            <p className={`mb-6 ${status === 'success' ? 'text-green-500' : 'text-red-500'}`}>
              {message}
            </p>
            <Link to="/login">
              <button className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                Go to Login
              </button>
            </Link>
          </>
        )}
      </div>
      <div className="h-24"></div>
      <Footer />
    </>
  );
};

export default VerifyEmail;
