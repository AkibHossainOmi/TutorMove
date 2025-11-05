// components/UpgradePremiumModal.js
import React from 'react';
import { Link } from 'react-router-dom';

const UpgradePremiumModal = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
    }}>
      <div style={{
        background: 'white', borderRadius: 8, padding: '32px 30px', maxWidth: 350, textAlign: 'center'
      }}>
        <h3 style={{ marginBottom: 15 }}>Upgrade to Premium</h3>
        <p>You’ve reached your monthly application limit.<br />
        <b>Upgrade to Premium</b> for unlimited job applications and more benefits!</p>
        <Link
          to="/point-purchase?premium=1"
          style={{
            display: 'inline-block',
            background: '#ffc107',
            color: '#212529',
            borderRadius: 5,
            padding: '9px 26px',
            fontWeight: 500,
            margin: '20px 0 0',
            textDecoration: 'none'
          }}
        >
          Upgrade Now
        </Link>
        <div>
          <button
            onClick={onClose}
            style={{
              marginTop: 14,
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              padding: '7px 18px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
export default UpgradePremiumModal;
