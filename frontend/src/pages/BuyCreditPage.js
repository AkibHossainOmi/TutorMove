// pages/BuyCreditPage.jsx
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import Footer from '../components/Footer';
import { creditAPI } from '../utils/apiService';

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

  const USD_CONVERSION_RATE = 122.33;
  const PRICE_PER_CREDIT = 10;

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
    setSelectedPackage(null);
    if (!isNaN(value) && value >= 1) {
      setCreditsToBuy(value);
    } else {
      setCreditsToBuy(1);
    }
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
    return <span className="text-sm text-gray-500 ml-2">(${usd} USD)</span>;
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
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl shadow text-center max-w-sm">
            <h2 className="text-xl font-semibold mb-4 text-red-600">{error}</h2>
            <button
              onClick={() => window.location.href = '/login'}
              className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700"
            >
              Go to Login
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Buy Credits</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {creditPackages.map(pkg => (
              <div
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg)}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedPackage?.id === pkg.id ? 'border-blue-500 bg-blue-50' : 'hover:border-blue-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold">{pkg.credits} Credits</h2>
                    <p className="text-sm text-gray-500">{pkg.discount > 0 ? `${pkg.discount}% off` : 'Standard price'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-600 font-semibold">{pkg.price} Taka {renderPriceInUSD(pkg.price)}</p>
                    {pkg.bonus > 0 && <span className="text-xs text-green-600">+{pkg.bonus} Bonus</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Purchase Summary</h2>
            <label className="block text-sm font-medium text-gray-700 mb-1">Custom Credits</label>
            <input
              type="number"
              className="w-full px-4 py-2 border rounded-lg mb-4"
              value={selectedPackage ? selectedPackage.credits : creditsToBuy}
              onChange={handleCreditsChange}
              disabled={!!selectedPackage}
            />

            <div className="text-sm text-gray-600 mb-2">Total: <span className="font-semibold text-blue-600">{totalAmount} Taka</span> {renderPriceInUSD(totalAmount)}</div>

            <button
              onClick={handlePurchaseCredits}
              disabled={isLoading}
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              {isLoading ? 'Processing...' : 'Proceed to Payment'}
            </button>

            {statusMessage && <p className="text-sm text-blue-600 mt-2">{statusMessage}</p>}
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BuyCreditPage;
