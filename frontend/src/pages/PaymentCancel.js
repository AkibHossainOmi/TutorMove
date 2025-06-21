import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const PaymentCancel = () => {
  const { type } = useParams(); // 'credits' or 'premium'
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h2>Payment Cancelled</h2>
      <p>
        Your {type === 'credits' ? 'credits' : 'premium subscription'} payment was cancelled.
        No charges have been made to your account.
      </p>
      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={() => navigate(type === 'credits' ? '/credits/purchase' : '/premium')}
          style={{ marginRight: '10px' }}
        >
          Try Again
        </button>
        <button onClick={() => navigate('/dashboard')}>
          Return to Dashboard
        </button>
      </div>
      <div style={{ marginTop: '20px' }}>
        <p>If you have any questions, feel free to contact our support team:</p>
        <p>Email: support@tutormove.com</p>
      </div>
    </div>
  );
};

export default PaymentCancel;
