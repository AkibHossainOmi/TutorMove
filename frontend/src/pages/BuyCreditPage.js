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

  const packages = [
    {
      id: 1,
      name: 'Premium',
      price: 2.99,
      description: 'Everything you need to create your website.',
      tools: [
        'AI website builder',
        'AI image generator',
        'AI writer',
        'AI blog generator',
        'AI SEO tools',
      ],
      highlight: false,
      discount: 0,
    },
    {
      id: 2,
      name: 'Business',
      price: 3.79,
      description: 'Level up with more power and enhanced features.',
      tools: [
        'AI website builder',
        'AI image generator',
        'AI writer',
        'AI blog generator',
        'AI SEO tools',
      ],
      highlight: true,
      discount: 73,
    },
    {
      id: 3,
      name: 'Cloud Startup',
      price: 7.99,
      description: 'Enjoy optimized performance & powerful resources.',
      tools: [
        'AI website builder',
        'AI image generator',
        'AI writer',
        'AI blog generator',
        'AI SEO tools',
      ],
      highlight: false,
      discount: 71,
    },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const response = await userApi.getUser();
        setCurrentUser(response.data);
      } catch (err) {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser?.user_id) setCurrentUser(storedUser);
        else setError('Failed to load user data. Please log in again.');
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
      showNotification('Authentication required', 'error');
      setError('Please log in to continue');
      return;
    }

    if (!selectedPackage) {
      setError('Please select a package before proceeding.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setStatusMessage('Processing your request...');

    try {
      const purchaseData = {
        plan: selectedPackage.name,
        amount: totalAmount,
        user_id: currentUser.user_id,
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
              onClick={() => (window.location.href = '/login')}
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
        <main className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Choose Your Plan</h1>
            <p className="text-gray-500 mt-2">Pick the plan that works best for you</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative border rounded-2xl shadow-sm bg-white p-6 flex flex-col ${
                  pkg.highlight ? 'border-purple-500 ring-2 ring-purple-300' : 'border-gray-200'
                }`}
              >
                {pkg.highlight && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Best deal - Limited time only
                    </span>
                  </div>
                )}
                {pkg.discount > 0 && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                      {pkg.discount}% OFF
                    </span>
                  </div>
                )}
                <h2 className="text-xl font-bold text-gray-800 mb-2">{pkg.name}</h2>
                <p className="text-gray-500 mb-4">{pkg.description}</p>
                <div className="text-3xl font-extrabold text-gray-800">
                  US${pkg.price}
                  <span className="text-base font-normal">/mo</span>
                </div>
                <p className="text-sm text-purple-600 mt-1">+2 months free</p>
                <button
                  onClick={() => setSelectedPackage(pkg)}
                  className={`mt-6 w-full py-2 rounded-lg font-medium transition-colors ${
                    selectedPackage?.id === pkg.id
                      ? 'bg-purple-600 text-white'
                      : 'border border-purple-600 text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  Choose plan
                </button>
                <ul className="mt-6 space-y-2 text-sm text-gray-600">
                  {pkg.tools.map((tool, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      {tool}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 max-w-md mx-auto mt-12">
            <h3 className="font-medium text-gray-700 mb-2">Selected Plan</h3>
            {selectedPackage ? (
              <div className="flex justify-between items-center mb-4">
                <span>{selectedPackage.name}</span>
                <span className="font-semibold">US${selectedPackage.price}/mo</span>
              </div>
            ) : (
              <p className="text-gray-400 mb-4">No plan selected</p>
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
            {error && <p className="text-sm text-red-600 mt-2 text-center">{error}</p>}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default BuyCreditPage;
