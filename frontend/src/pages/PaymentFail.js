import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const PaymentFail = () => {
  const [searchParams] = useSearchParams();

  const transactionId = searchParams.get('tran_id') || null;
  const status = searchParams.get('status') || 'FAILED';
  const errorMessage = searchParams.get('reason') || 'An unknown error occurred during your payment.';

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-red-400 animate-fade-in">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-red-500 to-orange-600 p-6 text-center">
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
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Payment Failed</h1>
          <p className="text-white text-opacity-90">
            We encountered an issue processing your payment
          </p>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {/* Error details */}
          <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium text-gray-800">{status}</span>
              </div>
              <div>
                <span className="text-gray-600">Message:</span>
                <p className="font-medium text-gray-800 mt-1">{errorMessage}</p>
              </div>
              {transactionId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-medium text-gray-800">{transactionId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Additional guidance */}
          <div className="flex items-start mb-6">
            <svg 
              className="flex-shrink-0 w-5 h-5 text-red-500 mt-0.5 mr-2" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path 
                fillRule="evenodd" 
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                clipRule="evenodd" 
              />
            </svg>
            <p className="text-gray-600">
              Please check your payment details and try again, or contact support if the problem persists.
            </p>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <Link
                to="/point-purchase"
                className="block w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:text-black font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:from-amber-600 hover:to-amber-700 text-center"
              >
              Try Again
            </Link>
            <Link
              to="/contact"
              className="block w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:from-blue-600 hover:to-blue-700 text-center"
            >
              Contact Support
            </Link>

            <Link
              to="/"
              className="block w-full px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-200 transition-all duration-300 text-center"
            >
              Back to Home
            </Link>
          </div>

          {/* Support information */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center mb-2">
              Need immediate assistance?
            </p>
            <div className="flex justify-center space-x-4">
              <a 
                href="mailto:support@example.com" 
                className="text-xs text-blue-600 hover:underline"
              >
                support@example.com
              </a>
              <span className="text-xs text-gray-400">|</span>
              <a 
                href="tel:+880123456789" 
                className="text-xs text-blue-600 hover:underline"
              >
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

export default PaymentFail;