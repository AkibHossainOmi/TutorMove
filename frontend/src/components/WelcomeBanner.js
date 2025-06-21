import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './WelcomeBanner.css';

const WELCOME_CREDIT = 10; // Match with backend value

function WelcomeBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    axios.get('/api/credits/')
      .then(res => {
        if (
          Array.isArray(res.data) &&
          res.data[0]?.balance === WELCOME_CREDIT // Show ONLY for the exact welcome credits
        ) {
          setShowBanner(true);
          // Optional: Auto-hide after 6 seconds
          setTimeout(() => setShowBanner(false), 6000);
        }
      })
      .catch(() => setShowBanner(false));
  }, []);

  if (!showBanner) return null;

  return (
    <div className="welcome-banner">
      🎉 Welcome! You’ve received <b>{WELCOME_CREDIT} free credits</b> to try TutorMove. Happy learning!
      <button
        onClick={() => setShowBanner(false)}
        style={{
          background: "none",
          border: "none",
          fontSize: "22px",
          marginLeft: "18px",
          color: "#109e6d",
          cursor: "pointer"
        }}
        aria-label="Close welcome banner"
      >
        ×
      </button>
    </div>
  );
}

export default WelcomeBanner;
