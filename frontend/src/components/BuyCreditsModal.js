
import React, { useEffect, useRef } from 'react';

const BuyCreditsModal = ({ show, onClose, onBuyCredits, message }) => {
  const modalRef = useRef();

  // Close on Esc key
  useEffect(() => {
    if (!show) return;
    const onEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
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
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.35)', zIndex: 1200,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={modalRef}
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: 36,
          minWidth: 320,
          boxShadow: '0 6px 24px rgba(0,0,0,0.18)',
          textAlign: 'center',
          maxWidth: 400,
          position: 'relative'
        }}
      >
        <button
          aria-label="Close"
          onClick={onClose}
          style={{
            position: 'absolute',
            right: 16,
            top: 16,
            background: 'none',
            border: 'none',
            fontSize: 24,
            color: '#adb5bd',
            cursor: 'pointer',
            lineHeight: 1
          }}
        >×</button>
        <h3 style={{ marginBottom: 10, color: '#212529', fontWeight: 600 }}>Not enough credits</h3>
        <p style={{ margin: '15px 0', color: '#495057', fontSize: 16 }}>
          {message || "You need more credits to perform this action."}
        </p>
        <button
          onClick={onBuyCredits}
          style={{
            background: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '10px 26px',
            fontSize: 17,
            cursor: 'pointer',
            marginRight: 10,
            fontWeight: 500
          }}
        >
          Buy Credits
        </button>
        <button
          onClick={onClose}
          style={{
            background: '#6c757d',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '10px 20px',
            fontSize: 17,
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default BuyCreditsModal;
