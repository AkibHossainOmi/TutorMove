import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PaymentSuccess = () => {
  const { type } = useParams(); // 'credits' or 'premium'
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const transactionId = urlParams.get('tran_id');
        const valId = urlParams.get('val_id');
        
        if (!transactionId || !valId) {
          setError('Invalid payment verification data');
          setLoading(false);
          return;
        }

        const token = localStorage.getItem('token');
        
        // Verify payment with backend
        await axios.post('/api/payments/verify/', {
          transaction_id: transactionId,
          val_id: valId,
          type: type
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setLoading(false);
        
        // Redirect after 3 seconds
        setTimeout(() => {
          if (type === 'credits') {
            navigate('/dashboard');
          } else if (type === 'premium') {
            navigate('/premium');
          }
        }, 3000);

      } catch (err) {
        setError('Payment verification failed');
        setLoading(false);
      }
    };

    verifyPayment();
  }, [type, navigate]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Verifying Payment...</h2>
        <p>Please wait while we confirm your payment.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2 style={{ color: 'red' }}>Payment Verification Failed</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/dashboard')}>
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h2 style={{ color: 'green' }}>Payment Successful!</h2>
      <p>
        Your {type === 'credits' ? 'credits' : 'premium subscription'} payment has been processed successfully.
      </p>
      <p>You will be redirected to your dashboard in a few seconds...</p>
      <button onClick={() => navigate('/dashboard')}>
        Go to Dashboard Now
      </button>
    </div>
  );
};

export default PaymentSuccess;
