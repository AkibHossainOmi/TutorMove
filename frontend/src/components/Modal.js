// src/components/Modal.js
import React, { useEffect, useState } from 'react';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'medium',
  showCloseButton = true 
}) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setShow(true);
    } else {
      document.body.style.overflow = 'unset';
      const timer = setTimeout(() => setShow(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen && !show) return null;

  const getMaxWidth = () => {
    switch (size) {
      case 'small': return 'max-w-md';
      case 'large': return 'max-w-4xl';
      case 'extra-large': return 'max-w-6xl';
      default: return 'max-w-2xl';
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[1200] flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ${
        isOpen ? 'visible opacity-100' : 'invisible opacity-0'
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={`relative w-full ${getMaxWidth()} bg-white rounded-2xl shadow-2xl transform transition-all duration-300 flex flex-col max-h-[90vh] ${
          isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            {title && (
              <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                {title}
              </h3>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
