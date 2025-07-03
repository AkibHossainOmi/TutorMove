import React, { useState, useEffect } from 'react';

const NotificationToast = ({
  message,
  type = 'info', // 'info', 'success', 'error', 'warning'
  duration = 3500, // Slightly longer duration
  onClose // Callback when the toast is dismissed
}) => {
  const [isVisible, setIsVisible] = useState(true); // Controls visibility and animation out
  const [animationClass, setAnimationClass] = useState('slideIn'); // Manages enter/exit animation

  useEffect(() => {
    // Set timer for auto-hide
    const timer = setTimeout(() => {
      setAnimationClass('slideOut'); // Start fade-out animation
      // After animation, hide and call onClose
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, 300); // Duration of the slideOut animation
      return () => clearTimeout(hideTimer);
    }, duration);

    // Cleanup timer if component unmounts prematurely
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  // Don't render if not visible
  if (!isVisible) return null;

  // --- Dynamic Styles based on type ---
  const getBackgroundColor = () => {
    switch (type) {
      case 'success': return '#e6ffed'; // Lighter green
      case 'error': return '#ffe6e6';   // Lighter red
      case 'warning': return '#fff8e6';  // Lighter yellow
      default: return '#e6f7ff';        // Lighter blue (info)
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success': return '#28a745'; // Darker green
      case 'error': return '#dc3545';   // Darker red
      case 'warning': return '#ffc107';  // Darker yellow/orange
      default: return '#007bff';        // Darker blue (info)
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success': return '#b3ffcc'; // Green border
      case 'error': return '#ffb3b3';   // Red border
      case 'warning': return '#ffe0b3';  // Yellow border
      default: return '#b3e0ff';        // Blue border (info)
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return '✔'; // Checkmark
      case 'error': return '✖';   // Multiplication X
      case 'warning': return '⚠️'; // Warning sign emoji for better modern look
      default: return 'ⓘ';       // Info circle
    }
  };

  // --- Base Styles for the Toast Container ---
  const toastBaseStyle = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 1000,
    minWidth: '280px', // Slightly wider min-width
    maxWidth: '400px', // Wider max-width for longer messages
    backgroundColor: getBackgroundColor(),
    color: getTextColor(),
    padding: '15px 25px', // More padding
    borderRadius: '8px', // More rounded corners for a softer look
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)', // Enhanced shadow
    border: `1px solid ${getBorderColor()}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontFamily: '"Segoe UI", Arial, sans-serif', // Modern font
    opacity: 0, // Start hidden for animations
    transform: 'translateX(100%)', // Start off-screen to the right
    transition: 'transform 0.3s ease-out, opacity 0.3s ease-out', // Smooth transition for entry/exit
  };

  // --- Animation Styles ---
  const slideInStyle = {
    transform: 'translateX(0)',
    opacity: 1,
  };

  const slideOutStyle = {
    transform: 'translateX(120%)', // Move further out
    opacity: 0,
  };

  // Apply animation styles dynamically
  const currentToastStyle = {
    ...toastBaseStyle,
    ...(animationClass === 'slideIn' ? slideInStyle : slideOutStyle)
  };

  const iconContainerStyle = {
    fontSize: '20px', // Slightly larger icon size
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    backgroundColor: getTextColor(), // Icon circle background matches text color
    color: getBackgroundColor(), // Icon color matches toast background color
    flexShrink: 0, // Prevent icon from shrinking
  };

  const messageTextStyle = {
    fontSize: '15px', // Slightly larger font for message
    flexGrow: 1, // Allow message to take available space
    marginLeft: '10px',
    lineHeight: '1.4',
  };

  const closeButtonContainerStyle = {
    marginLeft: '15px', // More space from message
    flexShrink: 0, // Prevent button from shrinking
  };

  const closeButtonStyles = {
    background: 'none',
    border: 'none',
    color: getTextColor(),
    cursor: 'pointer',
    fontSize: '24px', // Larger close button
    padding: '0',
    lineHeight: '1', // Ensure vertical alignment
    opacity: 0.7, // Slightly transparent
    transition: 'opacity 0.2s ease',
  };

  const closeButtonHoverStyles = {
    opacity: 1, // Full opacity on hover
  };

  return (
    <div style={currentToastStyle}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={iconContainerStyle}>
          {getIcon()}
        </span>
        <span style={messageTextStyle}>{message}</span>
      </div>

      <div style={closeButtonContainerStyle}>
        <button
          onClick={() => {
            setAnimationClass('slideOut'); // Trigger exit animation
            // Give time for animation before hiding completely
            setTimeout(() => {
              setIsVisible(false);
              if (onClose) onClose();
            }, 300);
          }}
          style={closeButtonStyles}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, closeButtonHoverStyles)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, closeButtonStyles)}
        >
          &times; {/* HTML entity for multiplication sign for universal support */}
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;