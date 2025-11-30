import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LoadingSpinner from "../components/LoadingSpinner";
import { premiumAPI, creditAPI, userApi } from "../utils/apiService";
import { FaCrown, FaCoins, FaCheckCircle, FaTimes } from "react-icons/fa";

// --- Modern Plan Card with Better Visual Hierarchy ---
const PlanCard = ({
  title,
  priceBDT,
  priceUSD,
  subtext,
  features,
  isActive,
  isPopular,
  onClick,
  badgeText,
  icon,
  isPremiumCard,
}) => (
  <div
    onClick={onClick}
    className={`relative flex flex-col rounded-xl border-2 transition-all duration-300 cursor-pointer overflow-hidden h-full
      ${
        isActive
          ? "border-blue-600 shadow-2xl bg-gradient-to-br from-blue-50 via-white to-blue-50 transform scale-105"
          : "border-gray-200 bg-white hover:shadow-xl hover:border-blue-300 hover:scale-102"
      }
      ${isPremiumCard ? "md:min-h-[400px]" : ""}
    `}
  >
    {/* Popular Badge */}
    {isPopular && (
      <div className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-4 py-1 rounded-bl-lg rounded-tr-lg shadow-lg">
        ⭐ {badgeText || "BEST VALUE"}
      </div>
    )}

    {/* Active Indicator */}
    {isActive && (
      <div className="absolute top-4 right-4 bg-blue-600 text-white p-2 rounded-full shadow-lg">
        <FaCheckCircle className="text-lg" />
      </div>
    )}

    {/* Content */}
    <div className="p-6 flex flex-col h-full">
      {/* Title & Icon */}
      <div className="flex items-center gap-3 mb-4">
        {icon && <span className="text-3xl">{icon}</span>}
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      </div>

      {/* Pricing */}
      {priceBDT && (
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-gray-900">৳{priceBDT}</span>
            <span className="text-lg text-gray-500 font-medium">${priceUSD}</span>
          </div>
          {subtext && (
            <p className="text-sm text-blue-600 font-semibold mt-1 flex items-center gap-1">
              <span className="text-green-500">✨</span> {subtext}
            </p>
          )}
        </div>
      )}

      {/* Features */}
      <ul className="space-y-3 mb-6 flex-grow">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-3 text-gray-700 text-sm">
            <FaCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {/* Action Button */}
      <button
        className={`w-full py-3.5 rounded-lg font-semibold text-white transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5
          ${
            isActive
              ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          }`}
      >
        {isActive ? (
          <span className="flex items-center justify-center gap-2">
            <FaCheckCircle /> Selected
          </span>
        ) : (
          "Select Package"
        )}
      </button>
    </div>
  </div>
);

// --- Sticky Selected Package Sidebar ---
const SelectedPackageSidebar = ({
  pkg,
  isLoading,
  onProceed,
  isPremium,
  couponCode,
  setCouponCode,
  onApplyCoupon,
  couponError,
  couponApplied
}) => {
  if (!pkg) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-dashed border-gray-300 sticky top-24">
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCoins className="text-4xl text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Package Selected
          </h3>
          <p className="text-gray-500 text-sm">
            Choose a point package from the left to continue
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-2xl p-6 border-2 border-blue-200 sticky top-24">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
          <FaCoins className="text-3xl text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-1">Selected Package</h3>
        <p className="text-sm text-gray-600">Review your selection</p>
      </div>

      {/* Package Details */}
      <div className="bg-white rounded-lg p-5 mb-5 shadow-md space-y-4">
        {/* Package Title */}
        <div className="border-b border-gray-200 pb-3">
          <p className="text-lg font-bold text-gray-800">Package {pkg.id}</p>
        </div>

        {/* Points Breakdown */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-medium">Base Points</span>
            <span className="text-lg font-bold text-gray-900">{pkg.points}</span>
          </div>
          
          {pkg.bonus > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-green-600 font-medium">Bonus Points</span>
              <span className="text-lg font-bold text-green-600">+{pkg.bonus}</span>
            </div>
          )}

          <div className="border-t-2 border-gray-200 pt-3 flex justify-between items-center">
            <span className="text-gray-900 font-semibold">Total Points</span>
            <span className="text-2xl font-extrabold text-blue-600">
              {pkg.totalPoints}
            </span>
          </div>
        </div>

        {/* Coupon Section */}
        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">Have a coupon?</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter code"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              disabled={!!couponApplied}
            />
            {couponApplied ? (
               <button
                onClick={() => { setCouponCode(''); onApplyCoupon(null); }}
                className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-100"
              >
                Remove
              </button>
            ) : (
              <button
                onClick={() => onApplyCoupon(couponCode)}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-900"
              >
                Apply
              </button>
            )}
          </div>
          {couponError && <p className="text-red-500 text-xs mt-1">{couponError}</p>}
          {couponApplied && (
            <p className="text-green-600 text-xs mt-1 font-semibold">
              Coupon applied: {couponApplied.discount_percentage}% off!
            </p>
          )}
        </div>

        {/* Price */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mt-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-semibold">Total Price</span>
            <div className="text-right">
              {couponApplied ? (
                <>
                  <p className="text-sm text-gray-400 line-through">৳{pkg.priceBDT}</p>
                  <p className="text-2xl font-extrabold text-green-600">
                    ৳{Math.round(pkg.priceBDT * (1 - couponApplied.discount_percentage / 100))}
                  </p>
                </>
              ) : (
                <p className="text-2xl font-extrabold text-gray-900">৳{pkg.priceBDT}</p>
              )}
              <p className="text-sm text-gray-600">${pkg.priceUSD} USD</p>
            </div>
          </div>
          {pkg.save > 0 && (
            <div className="mt-2 text-center">
              <span className="inline-block bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                SAVE {pkg.save}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={onProceed}
        disabled={isLoading}
        className={`w-full py-4 rounded-lg font-bold text-white text-lg transition-all shadow-lg transform
          ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 hover:shadow-2xl hover:-translate-y-1"
          }
        `}
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-3">
            <LoadingSpinner size="sm" />
            Processing...
          </div>
        ) : (
          <span className="flex items-center justify-center gap-2">
            Proceed to Payment →
          </span>
        )}
      </button>

      {/* Security Badge */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-600 flex items-center justify-center gap-1">
          <span className="text-green-500">🔒</span>
          Secure payment powered by bKash
        </p>
      </div>
    </div>
  );
};

// --- Status Banner ---
const StatusBanner = ({ type, message, onClose }) => (
  <div
    className={`rounded-lg p-4 mb-6 flex items-center justify-between shadow-md animate-slideDown
    ${
      type === "error"
        ? "bg-red-50 border-l-4 border-red-500"
        : "bg-blue-50 border-l-4 border-blue-500"
    }`}
  >
    <div className="flex items-center gap-3">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center
        ${type === "error" ? "bg-red-100" : "bg-blue-100"}
      `}
      >
        <span className="text-lg">{type === "error" ? "⚠️" : "ℹ️"}</span>
      </div>
      <p
        className={`font-medium ${
          type === "error" ? "text-red-800" : "text-blue-800"
        }`}
      >
        {message}
      </p>
    </div>
    <button
      onClick={onClose}
      className="text-gray-500 hover:text-gray-700 transition-colors"
    >
      <FaTimes className="text-xl" />
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

  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(null);
  const [couponError, setCouponError] = useState("");

  const PREMIUM_PRICE = 500;

  // Point packages with more attractive pricing structure
  const pointPackages = [
    { id: 1, points: 50, bonus: 0, totalPoints: 50, priceBDT: 119, priceUSD: 1.0, save: 0 },
    { id: 2, points: 100, bonus: 5, totalPoints: 105, priceBDT: 235, priceUSD: 1.98, save: 3 },
    { id: 3, points: 250, bonus: 15, totalPoints: 265, priceBDT: 589, priceUSD: 4.9, save: 5 },
    { id: 4, points: 500, bonus: 40, totalPoints: 540, priceBDT: 1149, priceUSD: 9.5, save: 8 },
    { id: 5, points: 1000, bonus: 100, totalPoints: 1100, priceBDT: 2199, priceUSD: 18.2, save: 12 },
    { id: 6, points: 2500, bonus: 300, totalPoints: 2800, priceBDT: 4849, priceUSD: 40.0, save: 20 },
    { id: 7, points: 5000, bonus: 800, totalPoints: 5800, priceBDT: 7999, priceUSD: 66.0, save: 34 },
    { id: 8, points: 7500, bonus: 1500, totalPoints: 9000, priceBDT: 10399, priceUSD: 85.0, save: 43 },
    { id: 9, points: 10000, bonus: 2000, totalPoints: 12000, priceBDT: 11999, priceUSD: 100.0, save: 50 },
  ];

  // Load User
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await userApi.getUser();
        setCurrentUser(res.data);
        if (res.data.is_premium) {
          setIsPremium(true);
          setPremiumExpiry(res.data.premium_expires);
        }
      } catch (err) {
        setError("Please log in to continue");
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  // Purchase Premium
  const handlePurchasePremium = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await premiumAPI.upgradeToPremium({
        amount: PREMIUM_PRICE,
        user_id: currentUser?.id,
      });
      if (res.data.payment_url) {
        window.location.href = res.data.payment_url;
      }
    } catch (err) {
      setError("Payment failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyCoupon = async (code) => {
    if (code === null) {
      setCouponApplied(null);
      setCouponError("");
      return;
    }
    if (!code) {
      setCouponError("Please enter a code");
      return;
    }
    try {
      const res = await creditAPI.validateCoupon(code);
      setCouponApplied(res.data);
      setCouponError("");
    } catch (err) {
      setCouponError(err.response?.data?.error || "Invalid coupon");
      setCouponApplied(null);
    }
  };

  // Purchase Points
  const handlePurchasePoints = async () => {
    if (!selectedPackage) {
      setError("Please select a package first");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // Send the original amount, backend will handle the discount
      const amount = selectedPackage.priceBDT;

      const res = await creditAPI.purchaseCredits({
        points: selectedPackage.points,
        amount: amount,
        user_id: currentUser?.id,
        coupon_code: couponApplied ? couponApplied.code : null
      });
      if (res.data.payment_url) {
        window.location.href = res.data.payment_url;
      }
    } catch (err) {
      setError("Payment failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearStatus = () => {
    setStatusMessage("");
    setError(null);
  };

  // Loading State
  if (isLoading && !currentUser && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6">
            <LoadingSpinner size="lg" />
          </div>
          <p className="text-xl font-semibold text-gray-700">Loading your account...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait a moment</p>
        </div>
      </div>
    );
  }

  // Error State - Not Logged In
  if (error && !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 px-4">
        <div className="bg-white shadow-2xl p-10 rounded-2xl text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🔒</span>
          </div>
          <h2 className="text-red-600 font-bold text-2xl mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-8 text-lg">{error}</p>
          <button
            onClick={() => (window.location.href = "/login")}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-10 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl w-full text-lg font-semibold"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // --- Main UI ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8 mt-16 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Upgrade Your Experience
          </h1>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
            Unlock unlimited possibilities with our flexible plans. Choose premium for full access or buy points as needed.
          </p>
        </div>

        {/* Status Messages */}
        {error && <StatusBanner type="error" message={error} onClose={clearStatus} />}
        {statusMessage && (
          <StatusBanner type="info" message={statusMessage} onClose={clearStatus} />
        )}

        {/* Premium Membership Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <FaCrown className="text-3xl text-yellow-500" />
            <h2 className="text-3xl font-bold text-gray-900">Membership Plans</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <PlanCard
              title="Free Plan"
              priceBDT="0"
              priceUSD="0.00"
              subtext="Always Free"
              features={[
                "Basic feature access",
                "Limited monthly points",
                "Browse all job listings",
                "Standard email support",
                "Community forum access",
              ]}
              icon="🎯"
              isPremiumCard
            />
            
            <PlanCard
              title={isPremium ? "Premium Active ✓" : "Premium Plan"}
              priceBDT={isPremium ? null : PREMIUM_PRICE.toString()}
              priceUSD={isPremium ? null : "4.17"}
              subtext={isPremium ? `Active until ${premiumExpiry || "N/A"}` : "Unlimited Access"}
              features={[
                "All features unlocked",
                "Priority 24/7 support",
                "Exclusive member discounts",
                "Unlimited point purchases",
                "Early access to new features",
                "Ad-free experience",
              ]}
              isPopular={!isPremium}
              isActive={isPremium}
              onClick={!isPremium ? handlePurchasePremium : undefined}
              icon={<FaCrown />}
              badgeText="BEST VALUE"
              isPremiumCard
            />
          </div>
        </section>

        {/* Point Packages Section with Sidebar Layout */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <FaCoins className="text-3xl text-yellow-500" />
            <h2 className="text-3xl font-bold text-gray-900">Point Packages</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Side - Point Packages (2 columns) */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {pointPackages.map((pkg) => (
                  <PlanCard
                    key={pkg.id}
                    title={`${pkg.totalPoints} Points`}
                    priceBDT={pkg.priceBDT}
                    priceUSD={pkg.priceUSD}
                    subtext={pkg.save > 0 ? `Save ${pkg.save}%` : "Standard Rate"}
                    features={[
                      `${pkg.points} base points`,
                      pkg.bonus > 0
                        ? `+${pkg.bonus} bonus points (${Math.round((pkg.bonus/pkg.points)*100)}% extra)`
                        : "No bonus included",
                      "Instant delivery to account",
                      "Never expires",
                      "Use anytime",
                    ]}
                    isActive={selectedPackage?.id === pkg.id}
                    onClick={() => setSelectedPackage(pkg)}
                    isPopular={pkg.id === 5}
                    badgeText={pkg.id === 5 ? "MOST POPULAR" : pkg.id === 9 ? "BEST SAVINGS" : null}
                    icon="💰"
                  />
                ))}
              </div>
            </div>

            {/* Right Side - Selected Package Sidebar (Sticky) */}
            <div className="lg:col-span-1">
              <SelectedPackageSidebar
                pkg={selectedPackage}
                isLoading={isLoading}
                onProceed={handlePurchasePoints}
                isPremium={isPremium}
                couponCode={couponCode}
                setCouponCode={setCouponCode}
                onApplyCoupon={handleApplyCoupon}
                couponError={couponError}
                couponApplied={couponApplied}
              />
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="mt-12 bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Choose Our Points System?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl">⚡</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Instant Delivery</h4>
              <p className="text-gray-600 text-sm">
                Points are added to your account immediately after payment
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl">🎁</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Bonus Points</h4>
              <p className="text-gray-600 text-sm">
                Get up to 20% extra points on larger packages
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl">♾️</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Never Expire</h4>
              <p className="text-gray-600 text-sm">
                Your points remain in your account forever, use them anytime
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BuyPointsAndPremiumPage;