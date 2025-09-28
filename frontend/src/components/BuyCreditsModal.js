import React, { useEffect, useRef } from 'react';

const BuyCreditsModal = ({ show, onClose, onBuyCredits, message }) => {
  const modalRef = useRef();

  // Close on Escape
  useEffect(() => {
    if (!show) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [show, onClose]);

  // Close on click outside
  useEffect(() => {
    if (!show) return;
    const handleClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg p-6 max-w-sm w-full relative"
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-400 hover:text-gray-600 text-2xl font-bold"
          aria-label="Close"
        >
          &times;
        </button>

        <h3 className="text-lg font-semibold mb-4">Not Enough Points</h3>
        <p className="mb-4 text-gray-700 text-sm leading-6">
          {message || "You need more points to perform this action."}
        </p>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={onBuyCredits}
            className="px-4 py-2 rounded text-white font-medium bg-blue-600 hover:bg-blue-700"
          >
            Buy Points
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyCreditsModal;
