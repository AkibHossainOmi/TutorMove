import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import LanguageSwitcher from './LanguageSwitcher'; // Assuming this is already modernized

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for mobile menu
  const [isTutorsDropdownOpen, setIsTutorsDropdownOpen] = useState(false);
  const [isJobsDropdownOpen, setIsJobsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { unreadCount } = useChat();

  // Refs for dropdowns to handle click-outside close
  const tutorsDropdownRef = useRef(null);
  const jobsDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Close dropdowns/mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tutorsDropdownRef.current && !tutorsDropdownRef.current.contains(event.target)) {
        setIsTutorsDropdownOpen(false);
      }
      if (jobsDropdownRef.current && !jobsDropdownRef.current.contains(event.target)) {
        setIsJobsDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogin = () => {
    navigate('/login');
    setIsMenuOpen(false); // Close mobile menu on navigation
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false); // Close mobile menu on navigation
  };

  const handleRequestTutor = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
    setIsMenuOpen(false); // Close mobile menu on navigation
  };

  // --- Inline Styles ---
  const navStyle = {
    backgroundColor: '#ffffff', // White background
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)', // Softer, more prominent shadow
    padding: '0 25px', // More horizontal padding
    position: 'sticky',
    top: 0,
    zIndex: 2000, // Ensure navbar is always on top
    fontFamily: '"Segoe UI", Arial, sans-serif', // Modern font
    borderBottom: '1px solid #e0e0e0', // Subtle bottom border
  };

  const navContainerStyle = {
    maxWidth: '1300px', // Wider content area
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '75px', // Slightly taller navbar
  };

  const logoStyle = {
    fontSize: '28px', // Larger logo text
    fontWeight: '700', // Bolder logo
    color: '#007bff', // Primary blue color
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    letterSpacing: '-0.5px', // Tighter letter spacing
    transition: 'color 0.2s ease',
  };

  const logoHoverStyle = {
    color: '#0056b3', // Darker blue on hover
  };

  const desktopNavLinksContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '30px', // More space between main nav items
    '@media (maxWidth: 992px)': { // Hide on smaller screens
      display: 'none',
    },
  };

  const mainNavLinkStyle = {
    color: '#495057', // Dark grey text
    textDecoration: 'none',
    fontWeight: '500', // Medium font weight
    fontSize: '16px',
    padding: '8px 0', // Vertical padding for larger clickable area
    transition: 'color 0.2s ease, transform 0.1s ease',
    position: 'relative',
  };

  const mainNavLinkHoverStyle = {
    color: '#007bff', // Primary blue on hover
    transform: 'translateY(-2px)', // Slight lift
  };

  const dropdownContainerStyle = {
    position: 'relative',
  };

  const dropdownMenuBaseStyle = {
    position: 'absolute',
    top: '100%', // Position right below the trigger
    left: '0',
    backgroundColor: 'white',
    border: '1px solid #e0e0e0', // Light border
    borderRadius: '8px', // Rounded corners
    boxShadow: '0 6px 20px rgba(0,0,0,0.15)', // More prominent shadow
    minWidth: '200px',
    zIndex: 2001, // Above navbar content
    marginTop: '10px', // Space between trigger and dropdown
    overflow: 'hidden', // Ensures rounded corners clip content
  };

  const dropdownLinkStyle = {
    display: 'block',
    padding: '12px 20px', // More padding
    color: '#495057',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: '400',
    transition: 'background-color 0.2s ease, color 0.2s ease',
    borderBottom: '1px solid #f8f9fa', // Very light separator
  };

  const dropdownLinkHoverStyle = {
    backgroundColor: '#e6f2ff', // Light blue on hover
    color: '#007bff',
  };

  const authButtonsContainerStyle = {
    display: 'flex',
    gap: '12px', // Space between auth buttons
    alignItems: 'center',
  };

  const baseButtonStyle = {
    padding: '10px 18px',
    border: 'none',
    borderRadius: '6px', // Rounded buttons
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, color 0.3s ease, transform 0.1s ease',
    outline: 'none',
    whiteSpace: 'nowrap', // Prevent text wrapping on buttons
  };

  const loginButtonStyle = {
    ...baseButtonStyle,
    backgroundColor: 'transparent',
    color: '#007bff',
    border: '1.5px solid #007bff', // Blue border for login
  };
  const loginButtonHoverStyle = {
    backgroundColor: '#e6f2ff', // Light blue background on hover
    transform: 'translateY(-1px)',
    boxShadow: '0 2px 8px rgba(0,123,255,0.1)',
  };

  const requestTutorButtonStyle = {
    ...baseButtonStyle,
    backgroundColor: '#28a745', // Green for 'Request a Tutor'
    color: 'white',
    boxShadow: '0 2px 8px rgba(40,167,69,0.15)',
  };
  const requestTutorButtonHoverStyle = {
    backgroundColor: '#218838',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 10px rgba(40,167,69,0.25)',
  };

  const logoutButtonStyle = {
    ...baseButtonStyle,
    backgroundColor: '#dc3545', // Red for logout
    color: 'white',
    boxShadow: '0 2px 8px rgba(220,53,69,0.15)',
  };
  const logoutButtonHoverStyle = {
    backgroundColor: '#c82333',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 10px rgba(220,53,69,0.25)',
  };

  const unreadBadgeStyle = {
    position: 'absolute',
    top: '-6px',
    right: '-10px',
    backgroundColor: '#fd7e14', // Orange for unread count
    color: 'white',
    borderRadius: '50%',
    width: '22px',
    height: '22px',
    fontSize: '11px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
  };

  // Mobile specific styles
  const mobileMenuButton = {
    background: 'none',
    border: 'none',
    fontSize: '28px', // Larger burger icon
    cursor: 'pointer',
    color: '#495057',
    '@media (minWidth: 993px)': { // Hide on larger screens
      display: 'none',
    },
    '@media (maxWidth: 992px)': { // Show on smaller screens
      display: 'block',
    },
  };

  const mobileMenuOverlayStyle = {
    position: 'fixed',
    top: '75px', // Below the navbar
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', // Dim background
    zIndex: 1999, // Below navbar, above page content
    transition: 'opacity 0.3s ease-in-out',
    opacity: isMenuOpen ? 1 : 0,
    pointerEvents: isMenuOpen ? 'auto' : 'none', // Allow/disallow interaction
  };

  const mobileMenuStyle = {
    position: 'fixed',
    top: '75px', // Below navbar
    right: 0,
    width: '280px', // Fixed width for mobile menu
    height: 'calc(100vh - 75px)', // Fill remaining height
    backgroundColor: '#ffffff',
    boxShadow: '-4px 0 15px rgba(0,0,0,0.15)',
    zIndex: 2000, // Same as desktop nav for consistency
    transform: isMenuOpen ? 'translateX(0)' : 'translateX(100%)', // Slide in/out
    transition: 'transform 0.3s ease-in-out',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
  };

  const mobileNavLinkStyle = {
    display: 'block',
    padding: '12px 0',
    color: '#495057',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '17px',
    borderBottom: '1px solid #eee',
    transition: 'background-color 0.2s ease',
  };

  const mobileNavLinkHoverStyle = {
    backgroundColor: '#f8f9fa',
  };

  return (
    <nav style={navStyle}>
      <div style={navContainerStyle}>
        {/* Logo */}
        <Link
          to="/"
          style={logoStyle}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, logoHoverStyle)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, logoStyle)}
        >
          TutorMove
        </Link>

        {/* Desktop Navigation */}
        <div style={desktopNavLinksContainerStyle}>
          <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
            {/* Find Tutors Dropdown */}
            <div
              style={dropdownContainerStyle}
              onMouseEnter={() => setIsTutorsDropdownOpen(true)}
              onMouseLeave={() => setIsTutorsDropdownOpen(false)}
              ref={tutorsDropdownRef}
            >
              <span
                style={{ ...mainNavLinkStyle, cursor: 'pointer' }}
                onMouseEnter={(e) => Object.assign(e.currentTarget.style, mainNavLinkHoverStyle)}
                onMouseLeave={(e) => Object.assign(e.currentTarget.style, mainNavLinkStyle)}
              >
                {t('navigation.findTutors', 'Find Tutors')} <span style={{ fontSize: '0.8em', verticalAlign: 'middle' }}>▼</span>
              </span>

              {isTutorsDropdownOpen && (
                <div style={dropdownMenuBaseStyle}>
                  <Link
                    to="/tutors"
                    style={dropdownLinkStyle}
                    onMouseEnter={(e) => Object.assign(e.currentTarget.style, dropdownLinkHoverStyle)}
                    onMouseLeave={(e) => Object.assign(e.currentTarget.style, dropdownLinkStyle)}
                    onClick={() => setIsTutorsDropdownOpen(false)}
                  >
                    {t('navigation.allTutors', 'All Tutors')}
                  </Link>
                  <Link
                    to="/tutors?type=online"
                    style={dropdownLinkStyle}
                    onMouseEnter={(e) => Object.assign(e.currentTarget.style, dropdownLinkHoverStyle)}
                    onMouseLeave={(e) => Object.assign(e.currentTarget.style, dropdownLinkStyle)}
                    onClick={() => setIsTutorsDropdownOpen(false)}
                  >
                    {t('navigation.onlineTutors', 'Online Tutors')}
                  </Link>
                  <Link
                    to="/tutors?type=home"
                    style={{...dropdownLinkStyle, borderBottom: 'none'}} // Last item
                    onMouseEnter={(e) => Object.assign(e.currentTarget.style, dropdownLinkHoverStyle)}
                    onMouseLeave={(e) => Object.assign(e.currentTarget.style, dropdownLinkStyle)}
                    onClick={() => setIsTutorsDropdownOpen(false)}
                  >
                    {t('navigation.homeTutors', 'Home Tutors')}
                  </Link>
                </div>
              )}
            </div>

            {/* Find Jobs Dropdown */}
            <div
              style={dropdownContainerStyle}
              onMouseEnter={() => setIsJobsDropdownOpen(true)}
              onMouseLeave={() => setIsJobsDropdownOpen(false)}
              ref={jobsDropdownRef}
            >
              <span
                style={{ ...mainNavLinkStyle, cursor: 'pointer' }}
                onMouseEnter={(e) => Object.assign(e.currentTarget.style, mainNavLinkHoverStyle)}
                onMouseLeave={(e) => Object.assign(e.currentTarget.style, mainNavLinkStyle)}
              >
                {t('navigation.findJobs', 'Find Jobs')} <span style={{ fontSize: '0.8em', verticalAlign: 'middle' }}>▼</span>
              </span>

              {isJobsDropdownOpen && (
                <div style={dropdownMenuBaseStyle}>
                  <Link
                    to="/jobs"
                    style={dropdownLinkStyle}
                    onMouseEnter={(e) => Object.assign(e.currentTarget.style, dropdownLinkHoverStyle)}
                    onMouseLeave={(e) => Object.assign(e.currentTarget.style, dropdownLinkStyle)}
                    onClick={() => setIsJobsDropdownOpen(false)}
                  >
                    {t('navigation.teachingJobs', 'Teaching Jobs')}
                  </Link>
                  <Link
                    to="/jobs?type=online"
                    style={dropdownLinkStyle}
                    onMouseEnter={(e) => Object.assign(e.currentTarget.style, dropdownLinkHoverStyle)}
                    onMouseLeave={(e) => Object.assign(e.currentTarget.style, dropdownLinkStyle)}
                    onClick={() => setIsJobsDropdownOpen(false)}
                  >
                    {t('navigation.onlineTeaching', 'Online Teaching')}
                  </Link>
                  <Link
                    to="/jobs?type=assignment"
                    style={{...dropdownLinkStyle, borderBottom: 'none'}} // Last item
                    onMouseEnter={(e) => Object.assign(e.currentTarget.style, dropdownLinkHoverStyle)}
                    onMouseLeave={(e) => Object.assign(e.currentTarget.style, dropdownLinkStyle)}
                    onClick={() => setIsJobsDropdownOpen(false)}
                  >
                    {t('navigation.assignmentJobs', 'Assignment Jobs')}
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/assignment-help"
              style={mainNavLinkStyle}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, mainNavLinkHoverStyle)}
              onMouseLeave={(e) => Object.assign(e.currentTarget.style, mainNavLinkStyle)}
            >
              {t('navigation.assignmentHelp', 'Assignment Help')}
            </Link>
          </div>

          {/* Auth Buttons */}
          <div style={authButtonsContainerStyle}>
            <LanguageSwitcher />

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  style={{ ...mainNavLinkStyle, margin: '0 5px' }} // Adjusted margin
                  onMouseEnter={(e) => Object.assign(e.currentTarget.style, mainNavLinkHoverStyle)}
                  onMouseLeave={(e) => Object.assign(e.currentTarget.style, { ...mainNavLinkStyle, margin: '0 5px' })}
                >
                  {t('navigation.dashboard', 'Dashboard')}
                </Link>
                <Link
                  to="/messages"
                  style={{ ...mainNavLinkStyle, position: 'relative', margin: '0 5px' }}
                  onMouseEnter={(e) => Object.assign(e.currentTarget.style, mainNavLinkHoverStyle)}
                  onMouseLeave={(e) => Object.assign(e.currentTarget.style, { ...mainNavLinkStyle, position: 'relative', margin: '0 5px' })}
                >
                  {t('navigation.messages', 'Messages')}
                  {unreadCount > 0 && (
                    <span style={unreadBadgeStyle}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                <span style={{ color: '#6c757d', fontSize: '15px', whiteSpace: 'nowrap' }}>
                  {t('dashboard.welcome', 'Welcome')}, <b style={{ color: '#333' }}>{user.username}</b>
                </span>
                <button
                  onClick={handleLogout}
                  style={logoutButtonStyle}
                  onMouseEnter={(e) => Object.assign(e.currentTarget.style, logoutButtonHoverStyle)}
                  onMouseLeave={(e) => Object.assign(e.currentTarget.style, logoutButtonStyle)}
                >
                  {t('navigation.logout', 'Logout')}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleLogin}
                  style={loginButtonStyle}
                  onMouseEnter={(e) => Object.assign(e.currentTarget.style, loginButtonHoverStyle)}
                  onMouseLeave={(e) => Object.assign(e.currentTarget.style, loginButtonStyle)}
                >
                  {t('navigation.login', 'Login')}
                </button>
                <button
                  onClick={handleRequestTutor}
                  style={requestTutorButtonStyle}
                  onMouseEnter={(e) => Object.assign(e.currentTarget.style, requestTutorButtonHoverStyle)}
                  onMouseLeave={(e) => Object.assign(e.currentTarget.style, requestTutorButtonStyle)}
                >
                  {t('navigation.requestTutor', 'Request a Tutor')}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Button (Hamburger) */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '30px', // Larger burger icon
            cursor: 'pointer',
            color: '#495057',
            display: window.innerWidth <= 992 ? 'block' : 'none', // Responsive display
          }}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu Overlay and Content */}
      <div style={mobileMenuOverlayStyle}>
        <div style={mobileMenuStyle} ref={mobileMenuRef}>
          {/* Mobile Links */}
          <Link
            to="/tutors"
            style={mobileNavLinkStyle}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, mobileNavLinkHoverStyle)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, mobileNavLinkStyle)}
            onClick={() => setIsMenuOpen(false)}
          >
            {t('navigation.findTutors', 'Find Tutors')}
          </Link>
          <Link
            to="/jobs"
            style={mobileNavLinkStyle}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, mobileNavLinkHoverStyle)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, mobileNavLinkStyle)}
            onClick={() => setIsMenuOpen(false)}
          >
            {t('navigation.findJobs', 'Find Jobs')}
          </Link>
          <Link
            to="/assignment-help"
            style={mobileNavLinkStyle}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, mobileNavLinkHoverStyle)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, mobileNavLinkStyle)}
            onClick={() => setIsMenuOpen(false)}
          >
            {t('navigation.assignmentHelp', 'Assignment Help')}
          </Link>

          <div style={{ marginTop: '20px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
            <LanguageSwitcher />
          </div>

          {user ? (
            <>
              <Link
                to="/dashboard"
                style={{ ...mobileNavLinkStyle, marginTop: '20px' }}
                onMouseEnter={(e) => Object.assign(e.currentTarget.style, mobileNavLinkHoverStyle)}
                onMouseLeave={(e) => Object.assign(e.currentTarget.style, mobileNavLinkStyle)}
                onClick={() => setIsMenuOpen(false)}
              >
                {t('navigation.dashboard', 'Dashboard')}
              </Link>
              <Link
                to="/messages"
                style={mobileNavLinkStyle}
                onMouseEnter={(e) => Object.assign(e.currentTarget.style, mobileNavLinkHoverStyle)}
                onMouseLeave={(e) => Object.assign(e.currentTarget.style, mobileNavLinkStyle)}
                onClick={() => setIsMenuOpen(false)}
              >
                {t('navigation.messages', 'Messages')}
                {unreadCount > 0 && (
                  <span style={{ ...unreadBadgeStyle, position: 'static', marginLeft: '10px', verticalAlign: 'middle', transform: 'none' }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              <span style={{ ...mobileNavLinkStyle, borderBottom: 'none', cursor: 'default' }}>
                {t('dashboard.welcome', 'Welcome')}, <b>{user.username}</b>
              </span>
              <button
                onClick={handleLogout}
                style={{ ...logoutButtonStyle, alignSelf: 'flex-start', marginTop: '20px' }}
                onMouseEnter={(e) => Object.assign(e.currentTarget.style, logoutButtonHoverStyle)}
                onMouseLeave={(e) => Object.assign(e.currentTarget.style, logoutButtonStyle)}
              >
                {t('navigation.logout', 'Logout')}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleLogin}
                style={{ ...loginButtonStyle, alignSelf: 'flex-start', marginTop: '20px' }}
                onMouseEnter={(e) => Object.assign(e.currentTarget.style, loginButtonHoverStyle)}
                onMouseLeave={(e) => Object.assign(e.currentTarget.style, loginButtonStyle)}
              >
                {t('navigation.login', 'Login')}
              </button>
              <button
                onClick={handleRequestTutor}
                style={{ ...requestTutorButtonStyle, alignSelf: 'flex-start', marginTop: '10px' }}
                onMouseEnter={(e) => Object.assign(e.currentTarget.style, requestTutorButtonHoverStyle)}
                onMouseLeave={(e) => Object.assign(e.currentTarget.style, requestTutorButtonStyle)}
              >
                {t('navigation.requestTutor', 'Request a Tutor')}
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;