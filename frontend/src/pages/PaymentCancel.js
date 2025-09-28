import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const PaymentCancel = () => {
  const { type } = useParams(); // expected 'points' or 'premium'
  const navigate = useNavigate();
  const isCredits = type === 'points';

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-gray-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-amber-400 animate-fade-in">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-center">
          <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg 
              className="w-12 h-12 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" 
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Payment Cancelled</h1>
          <p className="text-white text-opacity-90">
            No charges have been made to your account
          </p>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {/* Main message */}
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-4">
              Your {isCredits ? 'points purchase' : 'premium subscription'} payment was cancelled.
            </p>
            <p className="text-gray-600">
              You can try again or return to your dashboard.
            </p>
          </div>

          {/* Action buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => navigate(isCredits ? '/points/purchase' : '/premium')}
              className="w-full px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-gray-900 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:from-amber-500 hover:to-amber-600"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:from-gray-600 hover:to-gray-700"
            >
              Return to Dashboard
            </button>
          </div>

          {/* Support information */}
          <div className="border-t border-gray-200 pt-6">
            <p className="text-sm text-gray-500 text-center mb-3">
              Need help with your payment?
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4">
              <a 
                href="mailto:support@tutormove.com" 
                className="text-sm text-blue-600 hover:underline flex items-center"
              >
                <svg 
                  className="w-4 h-4 mr-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                  />
                </svg>
                support@tutormove.com
              </a>
              <span className="hidden sm:inline text-gray-400">|</span>
              <a 
                href="tel:+880123456789" 
                className="text-sm text-blue-600 hover:underline flex items-center"
              >
                <svg 
                  className="w-4 h-4 mr-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" 
                  />
                </svg>
                +880 1234 56789
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default PaymentCancel;