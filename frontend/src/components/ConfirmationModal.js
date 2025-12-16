import React from 'react';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", isDanger = true }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div
        className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100 animate-in fade-in zoom-in duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className={`px-6 py-4 flex items-center justify-between border-b ${isDanger ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
          <div className="flex items-center gap-3">
            {isDanger && <FaExclamationTriangle className="text-red-500 text-xl" />}
            <h3 className={`font-bold text-lg ${isDanger ? 'text-red-900' : 'text-gray-900'}`}>
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 hover:bg-black/5"
          >
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-600 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-gray-700 bg-white border border-gray-300 font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 rounded-lg text-white font-medium shadow-sm transition-colors
              ${isDanger
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
