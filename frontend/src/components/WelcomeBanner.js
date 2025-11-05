import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WELCOME_CREDIT = 10; // Match with backend value

function WelcomeBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [animationClass, setAnimationClass] = useState(''); // For controlling enter/exit animations

  useEffect(() => {
    // Check if the user has already seen the banner in this session (optional, for persistent banner)
    // const hasSeenBanner = sessionStorage.getItem('welcomeBannerShown');
    // if (hasSeenBanner) {
    //   setShowBanner(false);
    //   return;
    // }

    axios.get(`${process.env.REACT_APP_API_URL}/api/points/`)
      .then(res => {
        // Condition: Show ONLY if the user's balance is exactly the WELCOME_CREDIT amount
        // This assumes these points are a one-time welcome bonus
        if (
          Array.isArray(res.data) &&
          res.data.length > 0 && // Ensure there's at least one point entry
          res.data[0]?.balance === WELCOME_CREDIT
        ) {
          setShowBanner(true);
          setAnimationClass('slideIn'); // Trigger slide-in animation

          // Optional: Auto-hide after a delay
          const autoHideTimer = setTimeout(() => {
            setAnimationClass('slideOut'); // Trigger slide-out animation
            const removeBannerTimer = setTimeout(() => {
              setShowBanner(false);
              // sessionStorage.setItem('welcomeBannerShown', 'true'); // Mark as shown for session
            }, 500); // Match slideOut animation duration
            return () => clearTimeout(removeBannerTimer);
          }, 6000); // Banner visible for 6 seconds

          return () => clearTimeout(autoHideTimer); // Clear auto-hide on unmount
        }
      })
      .catch((error) => {
        console.error("Error fetching points for welcome banner:", error);
        setShowBanner(false); // Hide banner if there's an error
      });
  }, []); // Empty dependency array means this runs once on mount

  // If banner should not be shown, return null immediately
  if (!showBanner) return null;

  // --- Inline Styles ---
  const bannerContainerStyle = {
    backgroundColor: '#d4edda', // Soft green background (success theme)
    color: '#155724', // Dark green text
    padding: '15px 25px', // Generous padding
    borderRadius: '8px', // Rounded corners
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)', // Subtle shadow
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '1.05em', // Slightly larger font size
    fontWeight: '500', // Medium font weight
    marginBottom: '30px', // Space below the banner on the page
    width: 'calc(100% - 60px)', // Occupy full width minus padding
    maxWidth: '1200px', // Max width to match page content
    margin: '30px auto', // Center the banner
    position: 'relative', // For animation positioning
    overflow: 'hidden', // Ensure content doesn't spill during animation
    fontFamily: '"Segoe UI", Arial, sans-serif', // Modern font stack
    // Initial state for animation (handled by animationClass)
    opacity: 0,
    transform: 'translateY(-20px)',
  };

  const closeButtonStyle = {
    background: 'none',
    border: 'none',
    fontSize: '28px', // Larger close button
    marginLeft: '20px', // More space
    color: '#109e6d', // Green for close button
    cursor: 'pointer',
    opacity: 0.8, // Slightly transparent
    transition: 'opacity 0.2s ease', // Smooth hover
    lineHeight: '1', // Ensure vertical alignment of 'x'
    flexShrink: 0, // Prevent button from shrinking
  };

  const closeButtonHoverStyle = {
    opacity: 1, // Full opacity on hover
    color: '#0a6442', // Darker green on hover
  };

  // Dynamic animation styles (instead of @keyframes)
  const slideInAnimation = {
    opacity: 1,
    transform: 'translateY(0)',
    transition: 'transform 0.5s ease-out, opacity 0.5s ease-out',
  };

  const slideOutAnimation = {
    opacity: 0,
    transform: 'translateY(-100%)', // Slide up and out
    transition: 'transform 0.5s ease-in, opacity 0.5s ease-in',
  };

  // Apply animation styles
  const currentBannerStyle = {
    ...bannerContainerStyle,
    ...(animationClass === 'slideIn' && slideInAnimation),
    ...(animationClass === 'slideOut' && slideOutAnimation),
  };

  return (
    <div style={currentBannerStyle}>
      <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '1.5em' }} role="img" aria-label="party popper">🎉</span>
        Welcome! You've received <b style={{ color: '#0f5132' }}>{WELCOME_CREDIT} free points</b> to try TutorMove. Happy learning!
      </span>
      <button
        onClick={() => {
          setAnimationClass('slideOut'); // Trigger exit animation
          const removeBannerTimer = setTimeout(() => {
            setShowBanner(false);
            // sessionStorage.setItem('welcomeBannerShown', 'true'); // Mark as shown for session
          }, 500); // Match slideOut animation duration
          return () => clearTimeout(removeBannerTimer);
        }}
        style={closeButtonStyle}
        onMouseEnter={(e) => Object.assign(e.currentTarget.style, closeButtonHoverStyle)}
        onMouseLeave={(e) => Object.assign(e.currentTarget.style, closeButtonStyle)}
        aria-label="Close welcome banner"
      >
        &times; {/* Using HTML entity for consistency */}
      </button>
    </div>
  );
}

export default WelcomeBanner;