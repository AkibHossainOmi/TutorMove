import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  
  const transactionId = searchParams.get('tran_id') || 'N/A';
  const amount = searchParams.get('amount') || 'N/A';
  const currency = searchParams.get('currency') || 'BDT';
  const paymentType = searchParams.get('payment_type') || 'points'; // 'premium' or 'points'
  const creditAmount = searchParams.get('point') || 'N/A'; // for points

  // Message based on payment type
  const successMessage = paymentType === 'premium'
    ? "Your account has been successfully upgraded to Premium!"
    : `Your payment was successful! You've received ${creditAmount} points.`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-emerald-400 animate-fade-in">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-6 text-center">
          <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg 
              className="w-12 h-12 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Payment Successful!</h1>
          <p className="text-white text-opacity-90">{successMessage}</p>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {/* Transaction details */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-medium text-gray-800">{transactionId}</span>
              </div>

              {/* Show amount for both point and premium */}
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium text-gray-800">{amount} {currency}</span>
              </div>

              {/* Show points only for point purchase */}
              {paymentType === 'points' && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Points Added:</span>
                  <span className="font-medium text-gray-800">{creditAmount}</span>
                </div>
              )}
            </div>
          </div>

          {/* Additional success message */}
          <div className="flex items-start mb-6">
            <svg 
              className="flex-shrink-0 w-5 h-5 text-emerald-500 mt-0.5 mr-2" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path 
                fillRule="evenodd" 
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                clipRule="evenodd" 
              />
            </svg>
            <p className="text-gray-600">
              {paymentType === 'premium' 
                ? "You now have access to all premium features!"
                : "Your points have been added to your account instantly."}
            </p>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <Link
              to="/dashboard"
              className="block w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg shadow-md hover:from-blue-700 hover:to-blue-800 hover:shadow-lg hover:text-white transition-all duration-300 text-center"
            >
              Go to Dashboard
            </Link>
            <Link
              to="/"
              className="block w-full px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-200 transition-all duration-300 text-center"
            >
              Back to Home
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex justify-center space-x-4">
              <div className="flex items-center text-xs text-gray-500">
                <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Secure Payment
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <svg className="w-4 h-4 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Instant Delivery
              </div>
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

export default PaymentSuccess;
