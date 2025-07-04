import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { authAPI } from '../utils/apiService';

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
    <>
      <Navbar />
      <div className="h-[180px]" />
      <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-md text-center">
        {status === 'loading' && <p className="text-gray-600">Verifying your email...</p>}

        {status !== 'loading' && (
          <>
            <h2
              className={`text-2xl font-semibold mb-4 ${
                status === 'success' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {status === 'success' ? 'Success!' : 'Verification Failed'}
            </h2>
            <p className={status === 'success' ? 'text-green-500' : 'text-red-500'}>{message}</p>
          </>
        )}
      </div>
      <div className="h-24" />
      <Footer />
    </>
  );
};

export default VerifyEmail;
