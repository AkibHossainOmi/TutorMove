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
    className={`relative flex flex-col rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden h-full group
      ${
        isActive
          ? "border-primary-500 shadow-xl bg-white dark:bg-dark-card transform scale-[1.02]"
          : "border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-700 hover:scale-[1.01]"
      }
      ${isPremiumCard ? "md:min-h-[400px]" : ""}
    `}
  >
    {/* Background Glow */}
    {isActive && <div className="absolute inset-0 bg-primary-500/5 pointer-events-none"></div>}

    {/* Popular Badge */}
    {isPopular && (
      <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl shadow-sm z-10">
        ⭐ {badgeText || "BEST VALUE"}
      </div>
    )}

    {/* Active Indicator */}
    {isActive && (
      <div className="absolute top-4 right-4 text-primary-600 dark:text-primary-400 animate-in fade-in zoom-in duration-300">
        <FaCheckCircle className="text-2xl drop-shadow-sm" />
      </div>
    )}

    {/* Content */}
    <div className="p-6 flex flex-col h-full relative z-10">
      {/* Title & Icon */}
      <div className="flex items-center gap-3 mb-4">
        {icon && <span className="text-3xl filter drop-shadow-sm">{icon}</span>}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
      </div>

      {/* Pricing */}
      {priceBDT && (
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-gray-900 dark:text-white">৳{priceBDT}</span>
            <span className="text-lg text-gray-500 dark:text-gray-400 font-medium">${priceUSD}</span>
          </div>
          {subtext && (
            <p className="text-sm font-semibold mt-1 flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <span className="text-emerald-500">✨</span> {subtext}
            </p>
          )}
        </div>
      )}

      {/* Features */}
      <ul className="space-y-3 mb-6 flex-grow">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-3 text-gray-600 dark:text-gray-300 text-sm">
            <FaCheckCircle className="text-emerald-500 mt-0.5 flex-shrink-0" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {/* Action Button */}
      <button
        className={`w-full py-3.5 rounded-xl font-bold text-white transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5
          ${
            isActive
              ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
              : "bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
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
      <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border-2 border-dashed border-gray-200 dark:border-dark-border sticky top-24 p-6">
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-gray-50 dark:bg-dark-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCoins className="text-4xl text-gray-300 dark:text-gray-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Package Selected
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Choose a point package from the left to continue
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl dark:shadow-glow border border-primary-100 dark:border-primary-900/30 sticky top-24 overflow-hidden">
      <div className="bg-gradient-to-br from-primary-50 to-white dark:from-dark-bg-secondary dark:to-dark-card p-6 border-b border-primary-100 dark:border-dark-border">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
            <FaCoins className="text-3xl text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Selected Package</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Review your selection</p>
        </div>

        {/* Package Details */}
        <div className="space-y-4">
          <div className="border-b border-gray-100 dark:border-dark-border pb-3">
            <p className="text-lg font-bold text-gray-800 dark:text-gray-200">Package {pkg.id}</p>
          </div>

          {/* Points Breakdown */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Base Points</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">{pkg.points}</span>
            </div>

            {pkg.bonus > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Bonus Points</span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">+{pkg.bonus}</span>
              </div>
            )}

            <div className="border-t border-gray-100 dark:border-dark-border pt-3 flex justify-between items-center">
              <span className="text-gray-900 dark:text-white font-semibold">Total Points</span>
              <span className="text-2xl font-extrabold text-primary-600 dark:text-primary-400">
                {pkg.totalPoints}
              </span>
            </div>
          </div>

          {/* Coupon Section */}
          <div className="border-t border-gray-100 dark:border-dark-border pt-4">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Have a coupon?</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter code"
                className="flex-1 bg-gray-50 dark:bg-dark-bg-secondary border border-gray-200 dark:border-dark-border rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                disabled={!!couponApplied}
              />
              {couponApplied ? (
                 <button
                  onClick={() => { setCouponCode(''); onApplyCoupon(null); }}
                  className="bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
                >
                  Remove
                </button>
              ) : (
                <button
                  onClick={() => onApplyCoupon(couponCode)}
                  className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                >
                  Apply
                </button>
              )}
            </div>
            {couponError && <p className="text-rose-500 text-xs mt-1">{couponError}</p>}
            {couponApplied && (
              <p className="text-emerald-600 dark:text-emerald-400 text-xs mt-1 font-semibold">
                Coupon applied: {couponApplied.discount_percentage}% off!
              </p>
            )}
          </div>

          {/* Price */}
          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4 mt-4 border border-primary-100 dark:border-primary-800/30">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300 font-semibold">Total Price</span>
              <div className="text-right">
                {couponApplied ? (
                  <>
                    <p className="text-sm text-gray-400 line-through">৳{pkg.priceBDT}</p>
                    <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                      ৳{Math.round(pkg.priceBDT * (1 - couponApplied.discount_percentage / 100))}
                    </p>
                  </>
                ) : (
                  <p className="text-2xl font-extrabold text-gray-900 dark:text-white">৳{pkg.priceBDT}</p>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-400">${pkg.priceUSD} USD</p>
              </div>
            </div>
            {pkg.save > 0 && (
              <div className="mt-2 text-center">
                <span className="inline-block bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  SAVE {pkg.save}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 bg-white dark:bg-dark-card border-t border-gray-100 dark:border-dark-border">
        {/* Action Button */}
        <button
          onClick={onProceed}
          disabled={isLoading}
          className={`w-full py-4 rounded-xl font-bold text-white text-lg transition-all shadow-lg transform
            ${
              isLoading
                ? "bg-gray-400 dark:bg-gray-700 cursor-not-allowed"
                : "bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 hover:shadow-xl hover:-translate-y-1"
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
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
            <span className="text-emerald-500">🔒</span>
            Secure payment powered by bKash
          </p>
        </div>
      </div>
    </div>
  );
};

// --- Status Banner ---
const StatusBanner = ({ type, message, onClose }) => (
  <div
    className={`rounded-xl p-4 mb-6 flex items-center justify-between shadow-sm animate-in slide-in-from-top-2
    ${
      type === "error"
        ? "bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800"
        : "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800"
    }`}
  >
    <div className="flex items-center gap-3">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center
        ${type === "error" ? "bg-rose-100 dark:bg-rose-800/50 text-rose-600 dark:text-rose-200" : "bg-blue-100 dark:bg-blue-800/50 text-blue-600 dark:text-blue-200"}
      `}
      >
        <span className="text-lg">{type === "error" ? "⚠️" : "ℹ️"}</span>
      </div>
      <p
        className={`font-medium ${
          type === "error" ? "text-rose-800 dark:text-rose-200" : "text-blue-800 dark:text-blue-200"
        }`}
      >
        {message}
      </p>
    </div>
    <button
      onClick={onClose}
      className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
    >
      <FaTimes className="text-lg" />
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
  const [pointPackages, setPointPackages] = useState([]);

  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(null);
  const [couponError, setCouponError] = useState("");

  const PREMIUM_PRICE = 500;

  // Load User and Packages
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      // Load user data (if logged in)
      try {
        const userRes = await userApi.getUser();
        setCurrentUser(userRes.data);
        if (userRes.data.is_premium) {
          setIsPremium(true);
          setPremiumExpiry(userRes.data.premium_expires);
        }
      } catch (err) {
        console.log("User not logged in");
      }

      // Load packages from API (available to everyone)
      try {
        const packagesRes = await creditAPI.getPackages();
        const packages = Array.isArray(packagesRes.data)
          ? packagesRes.data
          : (packagesRes.data.results || []);

        const activePackages = packages.filter(pkg => pkg.is_active);

        // Transform API packages to match the expected format
        const transformedPackages = activePackages.map(pkg => ({
          id: pkg.id,
          points: pkg.points || pkg.base_points || 0,
          bonus: Math.round((pkg.discount_percentage / 100) * (pkg.points || pkg.base_points || 0)) || 0,
          totalPoints: (pkg.points || pkg.base_points || 0) + Math.round((pkg.discount_percentage / 100) * (pkg.points || pkg.base_points || 0)),
          priceBDT: pkg.price || pkg.price_usd * 120 || 0,
          priceUSD: pkg.price_usd || (pkg.price / 120).toFixed(2) || 0,
          save: pkg.discount_percentage || 0,
          name: pkg.name,
          description: pkg.description
        }));

        setPointPackages(transformedPackages);
      } catch (err) {
        console.error("Error loading packages:", err);
        setError("Failed to load packages. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6">
            <LoadingSpinner size="lg" />
          </div>
          <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">Loading your account...</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Please wait a moment</p>
        </div>
      </div>
    );
  }

  // Error State - Not Logged In
  if (error && !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg px-4 transition-colors duration-300">
        <div className="bg-white dark:bg-dark-card shadow-2xl dark:shadow-glow p-10 rounded-2xl text-center max-w-md border border-gray-100 dark:border-dark-border">
          <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🔒</span>
          </div>
          <h2 className="text-rose-600 dark:text-rose-400 font-bold text-2xl mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">{error}</p>
          <button
            onClick={() => (window.location.href = "/login")}
            className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 px-10 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl w-full text-lg font-bold"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // --- Main UI ---
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col font-sans transition-colors duration-300">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8 mt-16 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-600">
              Upgrade Your Experience
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed">
            Unlock unlimited possibilities with our flexible plans. Choose premium for full access or buy points as needed.
          </p>
        </div>

        {/* Status Messages */}
        {error && <StatusBanner type="error" message={error} onClose={clearStatus} />}
        {statusMessage && (
          <StatusBanner type="info" message={statusMessage} onClose={clearStatus} />
        )}

        {/* Premium Membership Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
               <FaCrown className="text-2xl text-amber-500" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Membership Plans</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
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
              icon={<FaCrown className="text-amber-500" />}
              badgeText="BEST VALUE"
              isPremiumCard
            />
          </div>
        </section>

        {/* Point Packages Section with Sidebar Layout */}
        <section className="pb-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
               <FaCoins className="text-2xl text-yellow-500" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Point Packages</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
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
        <section className="mt-8 bg-white dark:bg-dark-card rounded-2xl shadow-lg dark:shadow-dark-lg p-10 border border-gray-100 dark:border-dark-border">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">Why Choose Our Points System?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚡</span>
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Instant Delivery</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Points are added to your account immediately after payment
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎁</span>
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Bonus Points</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Get up to 20% extra points on larger packages
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">♾️</span>
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Never Expire</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
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