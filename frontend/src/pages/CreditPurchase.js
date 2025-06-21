import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SuccessBanner from '../components/SuccessBanner';

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

const CreditPurchase = () => {
  const [loadingIdx, setLoadingIdx] = useState(null);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const creditPackages = [
    { credits: 10, price: 5.00 },
    { credits: 25, price: 12.00 },
    { credits: 50, price: 20.00 },
    { credits: 100, price: 35.00 }
  ];

  // On mount, show a banner if redirected after payment success
  useEffect(() => {
    if (getQueryParam('success') === '1') {
      setSuccessMsg('Credits added to your account successfully!');
      // Optionally, you can clean the URL
      const url = new URL(window.location);
      url.searchParams.delete('success');
      window.history.replaceState({}, document.title, url.pathname);
    }
  }, []);

  // Auto-hide success banner after 4 seconds
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 7000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  const handlePurchase = async (credits, price, idx) => {
    setLoadingIdx(idx);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/credits/purchase/', 
        { credits, amount: price },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Redirect to SSLCommerz payment gateway
      if (response.data.payment_url) {
        window.location.href = response.data.payment_url;
      } else {
        setError('Failed to get payment URL.');
      }
    } catch (err) {
      setError('Failed to initiate payment. Please try again.');
    } finally {
      setLoadingIdx(null);
    }
  };

  return (
    <div>
      {successMsg && (
        <SuccessBanner message={successMsg} onClose={() => setSuccessMsg('')} />
      )}

      <h2>Purchase Credits</h2>
      <p>Credits are used to apply for jobs, view contact information, and boost your gig rankings.</p>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <div>
        <h3>Credit Packages</h3>
        {creditPackages.map((pkg, idx) => (
          <div key={idx} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
            <h4>{pkg.credits} Credits</h4>
            <p>Price: ${pkg.price.toFixed(2)}</p>
            <button 
              onClick={() => handlePurchase(pkg.credits, pkg.price, idx)}
              disabled={loadingIdx !== null}
              style={{
                background: loadingIdx === idx ? "#6c757d" : "#007bff",
                color: "white",
                border: "none",
                borderRadius: "5px",
                padding: "8px 18px",
                fontSize: "15px",
                cursor: loadingIdx !== null ? "not-allowed" : "pointer"
              }}
            >
              {loadingIdx === idx ? 'Processing...' : 'Buy Now'}
            </button>
          </div>
        ))}
      </div>
      
      <div>
        <h3>Payment Information</h3>
        <ul>
          <li>• Secure payment via SSLCommerz</li>
          <li>• Credits are added instantly after successful payment</li>
          <li>• Credits never expire</li>
          <li>• Transferable to other users</li>
        </ul>
      </div>
    </div>
  );
};

export default CreditPurchase;
