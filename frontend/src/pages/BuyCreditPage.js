// pages/BuyCreditPage.jsx
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import Footer from '../components/Footer';
import { creditAPI, userApi } from '../utils/apiService';

const useNotification = () => {
  const showNotification = (message, type) => {
    console.log(`Notification (${type}): ${message}`);
  };
  return { showNotification };
};

const BuyCreditPage = () => {
  const { showNotification } = useNotification();
  const [currentUser, setCurrentUser] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [selectedPackage, setSelectedPackage] = useState(null);

  const USD_CONVERSION_RATE = 122.33;

  const creditPackages = [
    { id: 1, credits: 10, price: 10, discount: 0, bonus: 0 },
    { id: 2, credits: 20, price: 18, discount: 10, bonus: 0 },
    { id: 3, credits: 50, price: 45, discount: 10, bonus: 5 },
    { id: 4, credits: 75, price: 65, discount: 13, bonus: 8 },
    { id: 5, credits: 100, price: 80, discount: 20, bonus: 10 },
    { id: 6, credits: 150, price: 120, discount: 20, bonus: 15 },
    { id: 7, credits: 200, price: 150, discount: 25, bonus: 25 },
    { id: 8, credits: 300, price: 210, discount: 30, bonus: 40 },
    { id: 9, credits: 500, price: 325, discount: 35, bonus: 75 },
    { id: 10, credits: 750, price: 450, discount: 40, bonus: 125 },
    { id: 11, credits: 1000, price: 550, discount: 45, bonus: 200 },
    { id: 12, credits: 2000, price: 1000, discount: 50, bonus: 500 }
  ];

  const premiumPackages = [
    { id: 101, credits: 2500, price: 1000, discount: 55, bonus: 700 },
    { id: 102, credits: 3000, price: 1200, discount: 60, bonus: 900 }
  ];

  // Load user from API or localStorage
  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        // Try API first
        const response = await userApi.getUser();
        setCurrentUser(response.data);
      } catch (err) {
        // fallback to localStorage
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser?.user_id) setCurrentUser(storedUser);
        else setError("Failed to load user data. Please log in again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    setTotalAmount(selectedPackage?.price || 0);
  }, [selectedPackage]);

  const handlePurchaseCredits = async () => {
    if (!currentUser?.id) {
      showNotification("Authentication required", 'error');
      setError("Please log in to continue");
      return;
    }

    if (!selectedPackage) {
      setError("Please select a package before proceeding.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setStatusMessage('Processing your request...');

    try {
      const purchaseData = {
        credits: selectedPackage.credits,
        amount: totalAmount,
        user_id: currentUser.user_id
      };
      const response = await creditAPI.purchaseCredits(purchaseData);
      if (response.data.status === 'SUCCESS' && response.data.payment_url) {
        setStatusMessage('Redirecting to payment gateway...');
        window.location.href = response.data.payment_url;
      } else {
        throw new Error(response.data.error || 'Payment initiation failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Payment failed');
      showNotification('Payment failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPriceInUSD = (taka) => {
    const usd = (taka / USD_CONVERSION_RATE).toFixed(2);
    return <span className="text-xs text-gray-400">(${usd})</span>;
  };

  if (isLoading && !currentUser && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error && !currentUser) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center pt-20">
          <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-sm w-full mx-4">
            <h2 className="text-xl font-semibold mb-4 text-red-600">{error}</h2>
            <button
              onClick={() => window.location.href = '/login'}
              className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-grow pt-20">
        <main className="max-w-5xl mx-auto px-4 py-8">

          {/* Page Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Buy Credits</h1>
            <p className="text-gray-500 mt-2">Choose a package that fits your needs</p>
          </div>

          {/* Premium Packages */}
          {currentUser?.is_premium ? (
            <div className="mb-6">
              <h2 className="font-semibold text-lg mb-4 text-gray-700">Premium Packages</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {premiumPackages.map(pkg => (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg)}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedPackage?.id === pkg.id
                        ? 'border-yellow-500 bg-yellow-50 shadow-md'
                        : 'border-gray-200 hover:border-yellow-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h2 className="font-semibold text-lg text-gray-800">{pkg.credits} Credits</h2>
                      <div className="text-right">
                        <span className="font-medium text-yellow-600">{pkg.price} BDT</span>
                        {renderPriceInUSD(pkg.price)}
                        {pkg.discount > 0 && (
                          <div className="text-xs text-gray-500 line-through mt-1">
                            {Math.round(pkg.price / (1 - pkg.discount / 100))} BDT
                          </div>
                        )}
                      </div>
                    </div>
                    {pkg.bonus > 0 && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                        +{pkg.bonus} Bonus
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-6 text-center">
              <p className="text-gray-500 bg-yellow-50 p-4 rounded-lg mb-4">
                Upgrade to Premium to access special packages with higher discounts and bonus credits!
              </p>
              <button
                onClick={() => window.location.href = '/buy-premium'}
                className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
              >
                Upgrade to Premium
              </button>
            </div>
          )}

          {/* Normal Credit Packages */}
          <div className="mb-8">
            <h2 className="font-semibold text-lg mb-4 text-gray-700">Credit Packages</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {creditPackages.map(pkg => (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg)}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedPackage?.id === pkg.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="font-semibold text-lg text-gray-800">{pkg.credits} Credits</h2>
                      {pkg.bonus > 0 && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                          +{pkg.bonus} Bonus
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-blue-600">{pkg.price} BDT</span>
                      {renderPriceInUSD(pkg.price)}
                      {pkg.discount > 0 && (
                        <div className="text-xs text-gray-500 line-through mt-1">
                          {Math.round(pkg.price / (1 - pkg.discount / 100))} BDT
                        </div>
                      )}
                    </div>
                  </div>
                  {pkg.discount > 0 && (
                    <div className="mt-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        Save {pkg.discount}%
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Selected Package & Payment Button */}
          <div className="bg-white rounded-lg shadow-sm p-6 max-w-md mx-auto mb-8">
            <h3 className="font-medium text-gray-700 mb-2">Selected Package</h3>
            {selectedPackage ? (
              <div className="flex justify-between items-center mb-4">
                <span>
                  {selectedPackage.credits} Credits
                  {selectedPackage.bonus > 0 && (
                    <span className="text-green-600 ml-2">+{selectedPackage.bonus} Bonus</span>
                  )}
                </span>
                <span className="font-semibold">
                  {selectedPackage.price} BDT {renderPriceInUSD(selectedPackage.price)}
                </span>
              </div>
            ) : (
              <p className="text-gray-400 mb-4">No package selected</p>
            )}

            <button
              onClick={handlePurchaseCredits}
              disabled={isLoading || !selectedPackage}
              className={`w-full py-2.5 rounded-lg font-medium transition-colors ${
                isLoading || !selectedPackage
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isLoading ? 'Processing...' : 'Proceed to Payment'}
            </button>

            {statusMessage && (
              <p className="text-sm text-blue-600 mt-2 text-center">{statusMessage}</p>
            )}
            {error && (
              <p className="text-sm text-red-600 mt-2 text-center">{error}</p>
            )}
          </div>

        </main>
      </div>
      <Footer />
    </div>
  );
};

export default BuyCreditPage;
