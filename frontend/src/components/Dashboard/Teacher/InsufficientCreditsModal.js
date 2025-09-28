import React from 'react';

const InsufficientCreditsModal = ({ 
  showInsufficientCreditsModal, 
  setShowInsufficientCreditsModal, 
  handleNavigateToBuyCredits 
}) => {
  if (!showInsufficientCreditsModal) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Insufficient Points</h3>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-rose-100 p-3 rounded-full">
              <svg className="h-8 w-8 text-rose-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <p className="text-center text-gray-600 mb-6">
            You don't have enough points to create a new gig. Please purchase more points to continue.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setShowInsufficientCreditsModal(false)}
              className="px-5 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setShowInsufficientCreditsModal(false);
                handleNavigateToBuyCredits();
              }}
              className="px-5 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Buy Points
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsufficientCreditsModal;