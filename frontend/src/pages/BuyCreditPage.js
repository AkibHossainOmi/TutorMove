import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LoadingSpinner from "../components/LoadingSpinner";
import { premiumAPI, creditAPI, userApi } from "../utils/apiService";
import { FaCrown, FaCoins } from "react-icons/fa";
import { format } from "date-fns";

// --- Modern Hostinger-Style Plan Card ---
const PlanCard = ({
  title,
  price,
  subtext,
  features,
  isActive,
  isPopular,
  onClick,
  badgeText,
  icon,
}) => (
  <div
    onClick={onClick}
    className={`relative flex flex-col rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden 
      ${
        isActive
          ? "border-blue-600 shadow-xl bg-gradient-to-br from-blue-50 to-blue-100 scale-[1.02]"
          : "border-gray-200 bg-white hover:shadow-lg hover:scale-[1.01]"
      }`}
  >
    {/* Badge */}
    {isPopular && (
      <div className="absolute top-0 left-0 right-0 bg-blue-600 text-white text-sm font-semibold text-center py-2">
        {badgeText || "MOST POPULAR"}
      </div>
    )}

    {/* Content */}
    <div className={`p-6 ${isPopular ? "pt-12" : "pt-6"}`}>
      <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
        {icon && <span className="text-yellow-500">{icon}</span>}
        {title}
      </h3>
      {price && (
        <p className="text-3xl font-extrabold text-gray-900 mb-1">
          {price}
          <span className="text-base text-gray-600 font-medium ml-1">
            /mo
          </span>
        </p>
      )}
      {subtext && (
        <p className="text-sm text-blue-600 mb-4 font-medium">{subtext}</p>
      )}

      <ul className="space-y-2 mb-6">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-gray-700 text-sm">
            <span className="text-green-500 mt-[3px]">✔</span> {f}
          </li>
        ))}
      </ul>

      <button
        className={`w-full py-3 rounded-lg font-semibold text-white transition-all 
          ${
            isActive
              ? "bg-green-600 hover:bg-green-700"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
      >
        {isActive ? "Selected" : "Choose Plan"}
      </button>
    </div>
  </div>
);

// --- Selected Package Box ---
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
            <span className="font-semibold text-gray-700">Total Points</span>
            <span className="text-lg font-bold text-blue-600">
              {pkg.totalPoints}
              {pkg.bonusPoints > 0 && (
                <span className="text-sm text-green-600 ml-1">
                  (+{pkg.bonusPoints} bonus)
                </span>
              )}
            </span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Base Points</span>
            <span className="font-medium">{pkg.packagePoints}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Bonus Points</span>
            <span className="font-medium text-green-600">+{pkg.bonusPoints}</span>
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Price (BDT)</span>
              <span className="font-medium">{pkg.priceBDT}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Price (USD)</span>
              <span className="font-medium">{pkg.priceUSD}</span>
            </div>
            {pkg.savePercent > 0 && (
              <div className="flex justify-between text-sm text-green-600 mt-1">
                <span>You Save</span>
                <span className="font-medium">{pkg.savePercent}%</span>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={onProceed}
          disabled={isLoading}
          className={`w-full py-3 rounded-lg font-semibold text-white transition-all
            ${
              isLoading
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
        <p className="text-gray-500">Select a points package above</p>
      </div>
    )}
  </div>
);

// --- Status Banner ---
const StatusBanner = ({ type, message, onClose }) => (
  <div
    className={`rounded-lg p-4 mb-6 flex items-center justify-between
    ${
      type === "error"
        ? "bg-red-50 border border-red-200"
        : "bg-blue-50 border border-blue-200"
    }`}
  >
    <p
      className={`font-medium ${
        type === "error" ? "text-red-800" : "text-blue-800"
      }`}
    >
      {message}
    </p>
    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
      ×
    </button>
  </div>
);

// --- Main Component ---
const BuyPointsAndPremiumPage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumExpiry, setPremiumExpiry] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState(null);

  const PREMIUM_PRICE = 500;

  const pointsPackages = [
    { 
      id: 1, 
      packagePoints: 50, 
      bonusPoints: 0, 
      totalPoints: 50, 
      priceBDT: "b119", 
      priceUSD: "$1.00", 
      savePercent: 0 
    },
    { 
      id: 2, 
      packagePoints: 100, 
      bonusPoints: 5, 
      totalPoints: 105, 
      priceBDT: "b235", 
      priceUSD: "$1.98", 
      savePercent: 3 
    },
    { 
      id: 3, 
      packagePoints: 250, 
      bonusPoints: 15, 
      totalPoints: 265, 
      priceBDT: "b589", 
      priceUSD: "$4.90", 
      savePercent: 5 
    },
    { 
      id: 4, 
      packagePoints: 500, 
      bonusPoints: 40, 
      totalPoints: 540, 
      priceBDT: "b1,149", 
      priceUSD: "$9.50", 
      savePercent: 8 
    },
    { 
      id: 5, 
      packagePoints: 1000, 
      bonusPoints: 100, 
      totalPoints: 1100, 
      priceBDT: "b2,199", 
      priceUSD: "$18.20", 
      savePercent: 12 
    },
    { 
      id: 6, 
      packagePoints: 2500, 
      bonusPoints: 300, 
      totalPoints: 2800, 
      priceBDT: "b4,849", 
      priceUSD: "$40.00", 
      savePercent: 20 
    },
    { 
      id: 7, 
      packagePoints: 5000, 
      bonusPoints: 800, 
      totalPoints: 5800, 
      priceBDT: "b7,999", 
      priceUSD: "$66.00", 
      savePercent: 34 
    },
    { 
      id: 8, 
      packagePoints: 7500, 
      bonusPoints: 1500, 
      totalPoints: 9000, 
      priceBDT: "b10,399", 
      priceUSD: "$85.00", 
      savePercent: 43 
    },
    { 
      id: 9, 
      packagePoints: 10000, 
      bonusPoints: 2000, 
      totalPoints: 12000, 
      priceBDT: "b11,999", 
      priceUSD: "$100.00", 
      savePercent: 50 
    },
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

  const handlePurchasePoints = async () => {
    if (!selectedPackage) return;
    setIsLoading(true);
    try {
      const res = await creditAPI.purchaseCredits({
        points: selectedPackage.totalPoints,
        amount: parseInt(selectedPackage.priceBDT.replace(/[^0-9]/g, '')),
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

  // --- Loading or Error States ---
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
          <h2 className="text-red-600 font-bold text-xl mb-3">
            Authentication Required
          </h2>
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

  // --- Main UI ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col mt-10">
      <Navbar />
      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Upgrade Your Experience
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose the plan that works best for you. Go premium for unlimited
            access or buy points as you need.
          </p>
        </div>

        {/* Status */}
        {error && <StatusBanner type="error" message={error} onClose={clearStatus} />}
        {statusMessage && (
          <StatusBanner type="info" message={statusMessage} onClose={clearStatus} />
        )}

        {/* Membership Plans */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <FaCrown className="text-yellow-500" />
            Membership Plans
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PlanCard
              title="Free Plan"
              price="0"
              subtext="+3 months free"
              features={[
                "Basic feature access",
                "Limited monthly points",
                "Free job browsing",
                "Standard support",
              ]}
              icon="🎯"
            />
            <PlanCard
              title={isPremium ? "Premium Active" : "Premium Plan"}
              price={isPremium ? null : PREMIUM_PRICE.toString()}
              subtext={isPremium ? null : "+3 months free"}
              features={[
                "Priority support",
                "Exclusive discounts",
                "Unlimited access",
                "Advanced features",
                "Early access to new features",
              ]}
              isPopular
              isActive={isPremium}
              onClick={!isPremium ? handlePurchasePremium : undefined}
              icon={<FaCrown className="text-yellow-500" />}
            />
          </div>
        </section>

        {/* Points Packages */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <FaCoins className="text-yellow-500" />
            Points Packages
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pointsPackages.map((pkg) => (
              <PlanCard
                key={pkg.id}
                title={`${pkg.packagePoints} Points`}
                price={pkg.priceUSD}
                subtext={
                  pkg.savePercent > 0 ? `${pkg.savePercent}% SAVE` : "Standard rate"
                }
                features={[
                  `Total: ${pkg.totalPoints} points`,
                  pkg.bonusPoints > 0 ? `+${pkg.bonusPoints} bonus points` : "No bonus",
                  `Price: ${pkg.priceBDT} BDT`,
                  "Instant delivery",
                  "No expiration",
                ]}
                isActive={selectedPackage?.id === pkg.id}
                onClick={() => setSelectedPackage(pkg)}
                isPopular={pkg.id === 9}
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
            onProceed={handlePurchasePoints}
          />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BuyPointsAndPremiumPage;