import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar'; // Assuming you have a Navbar component
import LoadingSpinner from '../components/LoadingSpinner'; // Assuming you have a LoadingSpinner component

/**
 * Custom hook for managing notifications.
 * Provides a simple function to show notifications (logs to console).
 */
const useNotification = () => {
  const showNotification = (message, type) => console.log(`Notification (${type}): ${message}`);
  return { showNotification };
};

const BuyCreditPage = () => {
  const { showNotification } = useNotification();

  // State to manage the current authenticated user
  const [currentUser, setCurrentUser] = useState(null);
  // State for the number of credits the user wants to buy
  const [creditsToBuy, setCreditsToBuy] = useState(1); // Default to 1 credit
  // State for the calculated total amount
  const [totalAmount, setTotalAmount] = useState(0);
  // Loading state for API calls
  const [isLoading, setIsLoading] = useState(true);
  // Error state for API calls
  const [error, setError] = useState(null);
  // Status message for user feedback (e.g., success, redirection)
  const [statusMessage, setStatusMessage] = useState('');
  // Price per credit (10 Taka as per your requirement)
  const PRICE_PER_CREDIT = 1;
  // Backend API endpoint for purchasing credits
  const CREDIT_PURCHASE_ENDPOINT = `http://localhost:8000/api/credits/purchase/`;

  /**
   * useEffect hook to load user data from localStorage on component mount.
   * If no user or user_id is found, it will set an error and stop loading.
   */
  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser && storedUser.user_id) {
        setCurrentUser(storedUser);
        setIsLoading(false);
      } else {
        setError("You must be logged in to buy credits.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Failed to parse user from localStorage:", err);
      setError("Failed to load user data. Please log in again.");
      setIsLoading(false);
    }
  }, []);

  /**
   * useEffect hook to calculate total amount whenever creditsToBuy changes.
   */
  useEffect(() => {
    setTotalAmount(creditsToBuy * PRICE_PER_CREDIT);
  }, [creditsToBuy]);

  /**
   * Handles the change in the credits input field.
   * Ensures the input is a positive integer.
   * @param {Object} e - The event object from the input change.
   */
  const handleCreditsChange = (e) => {
    const value = parseInt(e.target.value);
    // Allow empty string for a moment so user can clear input, but then default to 1 if not a valid number
    if (isNaN(value) || value < 1) {
      setCreditsToBuy(1);
    } else {
      setCreditsToBuy(value);
    }
  };

  /**
   * Handles the credit purchase process.
   * Makes a POST request to the backend.
   */
  const handlePurchaseCredits = async () => {
    if (!currentUser || !currentUser.user_id) {
      showNotification("User not logged in or user ID not found.", 'error');
      setError("Authentication error. Please log in again.");
      return;
    }
    if (creditsToBuy <= 0) {
      showNotification("Please enter a valid number of credits to buy.", 'error');
      setError("Invalid credit amount.");
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

      const response = await axios.post(
        CREDIT_PURCHASE_ENDPOINT,
        purchaseData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === 'SUCCESS' && response.data.payment_url) {
        setStatusMessage('Redirecting to payment gateway...');
        showNotification('Redirecting to payment gateway!', 'info');
        window.location.href = response.data.payment_url;
      } else {
        const errorMessage = response.data.error || 'Unknown error during payment initiation.';
        setError(`Payment initiation failed: ${errorMessage}`);
        showNotification(`Payment initiation failed: ${errorMessage}`, 'error');
      }
    } catch (err) {
      console.error('Error initiating credit purchase:', err.response?.data || err.message);
      const userMessage = err.response?.data?.error || 'Could not initiate payment. Please try again.';
      setError(`Error: ${userMessage}`);
      showNotification(`Error: ${userMessage}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // --- UI Rendering ---

  if (isLoading && !currentUser && !error) { // Show spinner if still loading user and no error yet
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 font-inter">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 text-center">{error}</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors shadow-md"
          >
            Go to Login
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 font-inter text-gray-800">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4 pt-20"> {/* pt-20 for navbar */}
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 hover:scale-105">
          <h1 className="text-3xl font-extrabold text-center text-blue-700 mb-6">
            💳 Buy Credits
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Fund your account to unlock more opportunities! Each credit costs <span className="font-bold text-green-600">10 Taka</span>.
          </p>

          <div className="mb-6">
            <label htmlFor="credits" className="block text-lg font-semibold text-gray-700 mb-2">
              Number of Credits:
            </label>
            <input
              type="number"
              id="credits"
              value={creditsToBuy}
              onChange={handleCreditsChange}
              min="1"
              step="1"
              className="w-full p-4 border border-gray-300 rounded-lg text-2xl font-bold text-center focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-200"
              placeholder="e.g., 10"
            />
          </div>

          <div className="mb-8 p-4 bg-blue-50 rounded-lg flex justify-between items-center shadow-inner">
            <span className="text-lg font-semibold text-blue-700">Total Amount:</span>
            <span className="text-3xl font-extrabold text-blue-800">
              {totalAmount} Taka
            </span>
          </div>

          <button
            onClick={handlePurchaseCredits}
            disabled={isLoading}
            className={`w-full py-4 px-6 rounded-xl text-xl font-bold tracking-wide transition-all duration-300 transform
              ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700 hover:scale-102 active:scale-98 shadow-lg'}
              focus:outline-none focus:ring-4 focus:ring-green-300`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <LoadingSpinner size="sm" className="mr-3" /> {statusMessage || 'Processing...'}
              </span>
            ) : (
              'Buy Now'
            )}
          </button>

          {error && (
            <p className="mt-4 text-center text-red-500 font-medium">{error}</p>
          )}
          {!isLoading && statusMessage && !error && (
            <p className="mt-4 text-center text-green-600 font-medium">{statusMessage}</p>
          )}

        </div>
      </div>

      {/* Tailwind CSS CDN (include this in your public/index.html or similar entry point) */}
      <script src="https://cdn.tailwindcss.com"></script>
    </div>
  );
};

export default BuyCreditPage;
