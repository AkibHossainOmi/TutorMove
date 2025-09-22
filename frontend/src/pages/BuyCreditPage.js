import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LoadingSpinner from "../components/LoadingSpinner";
import { premiumAPI, creditAPI, userApi } from "../utils/apiService";
import { FaCheckCircle, FaCrown, FaCoins } from "react-icons/fa";
import { format } from "date-fns";

// --- Enhanced Card Component ---
const PlanCard = ({ title, price, description, features, isActive, onClick, icon }) => (
  <div
    onClick={onClick}
    className={`rounded-xl p-6 border-2 transition-all cursor-pointer transform hover:scale-[1.02]
      ${isActive 
        ? "border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg" 
        : "border-gray-200 hover:border-blue-300 hover:shadow-md"
      } ${onClick ? "hover:shadow-lg" : ""}
    `}
  >
    <div className="flex items-center gap-3 mb-4">
      {icon && <div className="text-2xl text-blue-500">{icon}</div>}
      <h3 className="text-xl font-bold text-gray-800">{title}</h3>
    </div>
    
    {price && (
      <div className="mb-4">
        <span className="text-2xl font-bold text-blue-600">{price}</span>
        {price.includes('/month') && (
          <span className="text-sm text-gray-500 ml-1">billed monthly</span>
        )}
      </div>
    )}
    
    {description && (
      <p className="text-gray-600 mb-4 leading-relaxed">{description}</p>
    )}
    
    <ul className="space-y-3">
      {features.map((f, i) => (
        <li key={i} className="flex items-start gap-2">
          <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
          <span className="text-gray-700">{f}</span>
        </li>
      ))}
    </ul>
    
    {onClick && (
      <button
        className={`w-full mt-6 py-3 rounded-lg font-semibold transition-colors
          ${isActive 
            ? "bg-blue-600 hover:bg-blue-700 text-white" 
            : "bg-gray-100 hover:bg-gray-200 text-gray-800"
          }
        `}
      >
        {isActive ? "Selected" : "Select Plan"}
      </button>
    )}
  </div>
);

// --- Enhanced Selected Package Box ---
const SelectedPackageBox = ({ pkg, isLoading, onProceed }) => (
  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6 max-w-md mx-auto border border-blue-200">
    <div className="text-center mb-4">
      <FaCoins className="text-3xl text-yellow-500 mx-auto mb-2" />
      <h3 className="text-lg font-semibold text-gray-800">Selected Package</h3>
    </div>
    
    {pkg ? (
      <>
        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-gray-700">Total Credits</span>
            <span className="text-lg font-bold text-blue-600">
              {pkg.credits + pkg.bonus}
              {pkg.bonus > 0 && (
                <span className="text-sm text-green-600 ml-1">
                  (+{pkg.bonus} bonus)
                </span>
              )}
            </span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Price</span>
            <span className="font-medium">{pkg.price} BDT</span>
          </div>
        </div>
        <button
          onClick={onProceed}
          disabled={isLoading}
          className={`w-full py-3 rounded-lg font-semibold text-white transition-all
            ${isLoading 
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg"
            }
          `}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <LoadingSpinner size="sm" />
              Processing...
            </div>
          ) : (
            "Proceed to Payment"
          )}
        </button>
      </>
    ) : (
      <div className="text-center py-4">
        <p className="text-gray-500">Select a credit package above</p>
      </div>
    )}
  </div>
);

// --- Status Banner Component ---
const StatusBanner = ({ type, message, onClose }) => (
  <div className={`rounded-lg p-4 mb-6 flex items-center justify-between
    ${type === 'error' ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'}
  `}>
    <p className={`font-medium ${type === 'error' ? 'text-red-800' : 'text-blue-800'}`}>
      {message}
    </p>
    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
      ×
    </button>
  </div>
);

const BuyCreditsAndPremiumPage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumExpiry, setPremiumExpiry] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState(null);

  const PREMIUM_PRICE = 500;

  const creditPackages = [
    { id: 1, credits: 10, price: 10, discount: 0, bonus: 0 },
    { id: 2, credits: 20, price: 18, discount: 10, bonus: 0 },
    { id: 3, credits: 50, price: 45, discount: 10, bonus: 5 },
    { id: 4, credits: 100, price: 80, discount: 20, bonus: 10 },
  ];

  // --- Load User ---
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await userApi.getUser();
        setCurrentUser(res.data);
        if (res.data.is_premium) {
          setIsPremium(true);
          setPremiumExpiry(res.data.premium_expires);
        }
      } catch {
        setError("Please log in to continue");
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  // --- Actions ---
  const handlePurchasePremium = async () => {
    setIsLoading(true);
    try {
      const res = await premiumAPI.upgradeToPremium({
        amount: PREMIUM_PRICE,
        user_id: currentUser?.id,
      });
      if (res.data.payment_url) window.location.href = res.data.payment_url;
    } catch (err) {
      setError("Payment failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchaseCredits = async () => {
    if (!selectedPackage) return;
    setIsLoading(true);
    try {
      const res = await creditAPI.purchaseCredits({
        credits: selectedPackage.credits,
        amount: selectedPackage.price,
        user_id: currentUser?.id,
      });
      if (res.data.payment_url) window.location.href = res.data.payment_url;
    } catch {
      setError("Payment failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearStatus = () => {
    setStatusMessage("");
    setError(null);
  };

  // --- UI ---
  if (isLoading && !currentUser && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (error && !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white shadow-xl p-8 rounded-2xl text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h2 className="text-red-600 font-bold text-xl mb-3">Authentication Required</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => (window.location.href = "/login")}
            className="bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors w-full"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col mt-10">
      <Navbar />
      <main className="flex-grow max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upgrade Your Experience</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose the plan that works best for you. Go premium for unlimited access or buy credits as you need.
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <StatusBanner type="error" message={error} onClose={clearStatus} />
        )}
        {statusMessage && (
          <StatusBanner type="info" message={statusMessage} onClose={clearStatus} />
        )}

        {/* Plans Section */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <FaCrown className="text-yellow-500" />
            Membership Plans
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PlanCard
              title="Free Plan"
              description="Perfect for getting started with basic features and exploring the platform."
              features={[
                "Basic feature access",
                "Limited monthly credits", 
                "Free job browsing",
                "Standard support"
              ]}
              icon="🎯"
            />
            <PlanCard
              title={isPremium ? "Premium Active" : "Premium Plan"}
              price={!isPremium ? `${PREMIUM_PRICE} BDT / month` : null}
              description={
                isPremium
                  ? `Your premium membership expires on ${format(new Date(premiumExpiry), "PPP")}`
                  : "Unlock full potential with premium features and priority access."
              }
              features={[
                "Priority support",
                "Exclusive discounts", 
                "Unlimited access",
                "Advanced features",
                "Early access to new features"
              ]}
              isActive={isPremium}
              onClick={!isPremium ? handlePurchasePremium : undefined}
              icon={<FaCrown className="text-yellow-500" />}
            />
          </div>
        </section>

        {/* Credit Packages */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <FaCoins className="text-yellow-500" />
            Credit Packages
          </h2>
          <p className="text-gray-600 mb-6">Buy credits in bulk and save more. Perfect for power users.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {creditPackages.map((pkg) => (
              <PlanCard
                key={pkg.id}
                title={`${pkg.credits} Credits`}
                price={`${pkg.price} BDT`}
                features={[
                  pkg.discount > 0 ? `Save ${pkg.discount}%` : "Standard rate",
                  pkg.bonus > 0 ? `+${pkg.bonus} bonus credits` : "No bonus",
                  "Instant delivery",
                  "No expiration"
                ]}
                isActive={selectedPackage?.id === pkg.id}
                onClick={() => setSelectedPackage(pkg)}
                icon="💰"
              />
            ))}
          </div>
        </section>

        {/* Selected Package */}
        <section className="flex justify-center">
          <SelectedPackageBox
            pkg={selectedPackage}
            isLoading={isLoading}
            onProceed={handlePurchaseCredits}
          />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BuyCreditsAndPremiumPage;