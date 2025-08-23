import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import LoadingSpinner from './LoadingSpinner';
import Footer from './Footer';
import { premiumAPI, userApi } from '../utils/apiService';
import { FaCheckCircle, FaLock } from 'react-icons/fa';
import { format } from 'date-fns';

const BuyPremiumPage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumExpiry, setPremiumExpiry] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  const PREMIUM_PRICE = 500; // 1-month price in BDT

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser?.user_id) {
          setCurrentUser(storedUser);

          // Check premium status from API
          const res = await userApi.getUser();
          if (res.data.is_premium) {
            setIsPremium(true);
            setPremiumExpiry(res.data.premium_expires);
          }
        } else {
          setError("You must be logged in to access this page.");
        }
      } catch (err) {
        setError("Failed to load user data. Please log in again.");
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const handlePurchasePremium = async () => {
    if (!currentUser?.user_id) {
      setError("Please log in to continue");
      return;
    }

    setIsLoading(true);
    setError(null);
    setStatusMessage('Processing your request...');

    try {
      const purchaseData = {
        amount: PREMIUM_PRICE,
        user_id: currentUser.user_id,
      };

      const response = await premiumAPI.upgradeToPremium(purchaseData);

      if (response.data.status === 'SUCCESS' && response.data.payment_url) {
        setStatusMessage('Redirecting to payment gateway...');
        window.location.href = response.data.payment_url;
      } else {
        throw new Error(response.data.error || 'Payment initiation failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Payment failed');
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
        <main className="max-w-3xl mx-auto px-4 py-8">

          {isPremium ? (
            <div className="bg-white rounded-xl shadow-md p-8 max-w-3xl mx-auto mb-6 border-2 border-yellow-400 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">You are a Premium User!</h2>
              <p className="text-gray-700 mb-2">
                Your premium subscription expires on: <strong>{format(new Date(premiumExpiry), 'PPP')}</strong>
              </p>
              <FaCheckCircle className="text-yellow-500 text-4xl mx-auto mt-4" />
            </div>
          ) : (
            <>
              {/* Hero Banner */}
              <div className="bg-gradient-to-r from-yellow-400 via-yellow-600 to-yellow-500 rounded-xl shadow-lg p-8 text-center text-white mb-8 max-w-4xl mx-auto">
                <h1 className="text-3xl sm:text-4xl font-bold">Go Premium!</h1>
                <p className="mt-2 text-lg sm:text-xl">Unlock all premium features and priority support.</p>
              </div>

              {/* Plan Card */}
              <div className="bg-white rounded-xl shadow-md p-8 max-w-3xl mx-auto mb-6 border-2 border-yellow-400">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">1 Month Premium</h3>
                  <span className="text-xl font-bold text-yellow-600">{PREMIUM_PRICE} BDT</span>
                </div>

                {/* Benefits */}
                <ul className="mb-6 space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <FaCheckCircle className="text-yellow-500 mr-2" /> Access to all premium features
                  </li>
                  <li className="flex items-center">
                    <FaCheckCircle className="text-yellow-500 mr-2" /> Priority support
                  </li>
                  <li className="flex items-center">
                    <FaCheckCircle className="text-yellow-500 mr-2" /> Exclusive content & updates
                  </li>
                </ul>

                <button
                  onClick={handlePurchasePremium}
                  disabled={isLoading}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    isLoading
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                  }`}
                >
                  {isLoading ? 'Processing...' : 'Proceed to Payment'}
                </button>

                {statusMessage && <p className="text-sm text-yellow-600 mt-3 text-center">{statusMessage}</p>}
                {error && <p className="text-sm text-red-600 mt-3 text-center">{error}</p>}

                <div className="mt-6 flex justify-center space-x-6 text-gray-500 text-xs">
                  <div className="flex items-center">
                    <FaLock className="mr-1" /> Secure Payment
                  </div>
                  <div className="flex items-center">
                    <FaCheckCircle className="mr-1" /> Instant Activation
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default BuyPremiumPage;
