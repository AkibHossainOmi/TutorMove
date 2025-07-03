import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import Footer from '../components/Footer';

// Custom hook for notifications
const useNotification = () => {
  const showNotification = (message, type) => {
    console.log(`Notification (${type}): ${message}`);
  };
  return { showNotification };
};

const BuyCreditPage = () => {
  const { showNotification } = useNotification();
  const [currentUser, setCurrentUser] = useState(null);
  const [creditsToBuy, setCreditsToBuy] = useState(1);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [selectedPackage, setSelectedPackage] = useState(null);
  
  const PRICE_PER_CREDIT = 10;
  const CREDIT_PURCHASE_ENDPOINT = `${process.env.REACT_APP_API_URL}/api/credits/purchase/`;

  // Credit packages with discounts for bulk purchases
  const creditPackages = [
    { id: 1, credits: 10, price: 10, discount: 0, bonus: 0 },
    { id: 2, credits: 50, price: 45, discount: 10, bonus: 5 },
    { id: 3, credits: 100, price: 80, discount: 20, bonus: 10 },
    { id: 4, credits: 200, price: 150, discount: 25, bonus: 25 }
  ];

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser?.user_id) {
        setCurrentUser(storedUser);
      } else {
        setError("You must be logged in to buy credits.");
      }
      setIsLoading(false);
    } catch (err) {
      console.error("Failed to parse user:", err);
      setError("Failed to load user data. Please log in again.");
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedPackage) {
      setTotalAmount(selectedPackage.price);
      setCreditsToBuy(selectedPackage.credits);
    } else {
      setTotalAmount(creditsToBuy * PRICE_PER_CREDIT);
    }
  }, [creditsToBuy, selectedPackage]);

  const handleCreditsChange = (e) => {
    const value = parseInt(e.target.value);
    setSelectedPackage(null); // Clear package selection when manually entering credits
    
    if (!isNaN(value) && value >= 1) {
      setCreditsToBuy(value);
    } else {
      setCreditsToBuy(1);
    }
  };

  const selectPackage = (pkg) => {
    setSelectedPackage(pkg);
  };

  const handlePurchaseCredits = async () => {
    if (!currentUser?.user_id) {
      showNotification("Authentication required", 'error');
      setError("Please log in to continue");
      return;
    }

    setIsLoading(true);
    setError(null);
    setStatusMessage('Processing your request...');

    try {
      const purchaseData = {
        credits: creditsToBuy,
        amount: totalAmount,
        user_id: currentUser.user_id
      };

      const response = await axios.post(CREDIT_PURCHASE_ENDPOINT, purchaseData, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.data.status === 'SUCCESS' && response.data.payment_url) {
        setStatusMessage('Redirecting to payment gateway...');
        window.location.href = response.data.payment_url;
      } else {
        throw new Error(response.data.error || 'Payment initiation failed');
      }
    } catch (err) {
      console.error('Purchase error:', err);
      setError(err.response?.data?.error || err.message || 'Payment failed');
      showNotification('Payment failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !currentUser && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50 p-4">
          <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.href = '/login'}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md w-full"
            >
              Go to Login
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-6xl mt-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Buy Credits</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Purchase credits to unlock premium features and opportunities on our platform
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Credit Packages */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
              <h2 className="text-2xl font-bold">Credit Packages</h2>
              <p className="opacity-90">Save more with our bulk packages</p>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {creditPackages.map((pkg) => (
                <div 
                  key={pkg.id}
                  onClick={() => selectPackage(pkg)}
                  className={`border rounded-lg p-4 cursor-pointer transition-all duration-300 ${
                    selectedPackage?.id === pkg.id 
                      ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">{pkg.credits} Credits</h3>
                      <p className="text-gray-600 text-sm">
                        {pkg.discount > 0 ? `${pkg.discount}% discount` : 'Standard rate'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">{pkg.price} Taka</p>
                      {pkg.bonus > 0 && (
                        <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-1">
                          +{pkg.bonus} bonus
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Purchase Form */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-green-600 to-green-700 text-white">
              <h2 className="text-2xl font-bold">Purchase Summary</h2>
              <p>Complete your credit purchase</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Amount (Credits)
                </label>
                <input
                  type="number"
                  value={selectedPackage ? selectedPackage.credits : creditsToBuy}
                  onChange={handleCreditsChange}
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  disabled={!!selectedPackage}
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Credits:</span>
                  <span className="font-semibold">{selectedPackage ? selectedPackage.credits : creditsToBuy}</span>
                </div>
                {selectedPackage?.discount > 0 && (
                  <div className="flex justify-between items-center mb-2 text-green-600">
                    <span>Discount:</span>
                    <span className="font-semibold">{selectedPackage.discount}%</span>
                  </div>
                )}
                {selectedPackage?.bonus > 0 && (
                  <div className="flex justify-between items-center mb-2 text-blue-600">
                    <span>Bonus Credits:</span>
                    <span className="font-semibold">+{selectedPackage.bonus}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-800 font-medium">Total:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {totalAmount} Taka
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePurchaseCredits}
                disabled={isLoading}
                className={`w-full py-4 px-6 rounded-lg text-lg font-bold text-white transition-all ${
                  isLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    Processing...
                  </span>
                ) : (
                  'Proceed to Payment'
                )}
              </button>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {statusMessage && !error && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                    </svg>
                    <p className="text-blue-700">{statusMessage}</p>
                  </div>
                </div>
              )}

              <div className="text-center text-sm text-gray-500 mt-4">
                <p>Secure payment processing powered by our trusted partners</p>
                <div className="flex justify-center space-x-4 mt-2">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">SSL Secure</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">PCI Compliant</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BuyCreditPage;