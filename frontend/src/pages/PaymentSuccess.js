import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FaCheckCircle, FaHome, FaReceipt } from 'react-icons/fa';

const PaymentSuccess = () => {
  const location = useLocation();
  const [countdown, setCountdown] = useState(10);
  
  // Parse query parameters if needed in the future
  const queryParams = new URLSearchParams(location.search);
  const transactionId = queryParams.get('tran_id') || 'N/A';

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    const redirect = setTimeout(() => {
      window.location.href = '/dashboard';
    }, 10000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirect);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-lg w-full text-center border border-gray-100 relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-600"></div>

          <div className="mb-8 relative">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-bounce-slow">
              <FaCheckCircle className="text-6xl text-green-500" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>

          <p className="text-gray-600 mb-8 text-lg">
            Thank you for your purchase. Your transaction has been completed successfully and your account has been updated.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-8 text-left border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-500 text-sm">Status</span>
              <span className="text-green-600 font-bold text-sm bg-green-100 px-2 py-1 rounded">COMPLETED</span>
            </div>
            <div className="flex justify-between items-center">
               <span className="text-gray-500 text-sm">Transaction ID</span>
               <span className="text-gray-800 font-mono text-sm">{transactionId}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/dashboard"
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-6 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <FaHome /> Go to Dashboard
            </Link>
          </div>

          <p className="mt-8 text-sm text-gray-400">
            Redirecting to dashboard in {countdown} seconds...
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentSuccess;
