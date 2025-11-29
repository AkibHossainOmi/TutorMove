// UnlockContactModal.js
import React, { useState } from 'react';
import { contactUnlockAPI } from '../utils/apiService';
import { FiLock, FiCheck } from 'react-icons/fi';

const UnlockContactModal = ({ show, onClose, tutorId, onUnlockSuccess, onNeedBuyCredits }) => {
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError] = useState('');

  if (!show) return null;

  const handleUnlockClick = async () => {
    setUnlocking(true);
    setError('');
    try {
      const res = await contactUnlockAPI.unlockContact(tutorId);

      if (res && (res.status === 201 || res.status === 200)) {
        onUnlockSuccess?.(res.data || {});
        onClose();
      } else {
        throw new Error('Unexpected response from server.');
      }
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        (typeof err.response?.data === 'string' ? err.response.data : '') ||
        err.message ||
        'Failed to unlock contact info.';

      setError(msg);

      if (msg.toLowerCase().includes('point') || err.response?.status === 402) {
        onNeedBuyCredits?.(); // delegate to parent
      }
    } finally {
      setUnlocking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl transform transition-all relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
          aria-label="Close"
        >
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>

        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
             <FiLock size={32} />
        </div>

        <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Unlock Contact Info</h3>
        <p className="mb-6 text-center text-gray-600 text-sm leading-relaxed px-4">
          Spend <strong>1 point</strong> to reveal this tutor's phone number and email address instantly.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-100 p-3 mb-5 rounded-lg text-center">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={handleUnlockClick}
            disabled={unlocking}
            className={`w-full py-3 rounded-xl text-white font-semibold shadow-md transition-all ${
              unlocking 
              ? 'bg-blue-300 cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform active:scale-95'
            }`}
          >
            {unlocking ? (
                 <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                </span>
            ) : (
                'Unlock Now'
            )}
          </button>
          
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition"
            disabled={unlocking}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnlockContactModal;
