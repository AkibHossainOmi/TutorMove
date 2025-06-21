import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const PaymentFail = () => {
  const { type } = useParams(); // 'credits' or 'premium'
  const navigate = useNavigate();
  
  const urlParams = new URLSearchParams(window.location.search);
  const failReason = urlParams.get('error') || 'Payment processing failed';

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h2 style={{ color: 'red' }}>Payment Failed</h2>
      <p>{failReason}</p>
      <p>
        Your {type === 'credits' ? 'credits' : 'premium subscription'} payment was not successful. 
        Please try again or contact support if the problem persists.
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
        <p>If you continue to experience issues, please contact our support team:</p>
        <p>Email: support@tutormove.com</p>
      </div>
    </div>
  );
};

export default PaymentFail;
