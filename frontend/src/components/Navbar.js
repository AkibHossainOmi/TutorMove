import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/UseAuth";
import { useTranslation } from 'react-i18next';
import { useChat } from '../contexts/ChatContext';
import LanguageSwitcher from './LanguageSwitcher'; // Assuming this is already modernized



// Helper component for desktop navigation links
const NavLink = ({ to, text }) => (
  <Link
    to={to}
    className="text-gray-700 hover:text-blue-600 font-medium text-base py-2 relative transition-colors duration-200 ease-in-out"
  >
    {text}
  </Link>
);
const authButtonsContainerStyle = {
  display: 'flex',
  gap: '12px', // Space between auth buttons
  alignItems: 'center',
};
// Helper component for dropdown links
const DropdownLink = ({ to, text, onClick }) => (
  <Link
    to={to}
    className="block px-5 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 text-sm font-normal transition-colors duration-200 ease-in-out border-b border-gray-100 last:border-b-0"
    onClick={onClick}
  >
    {text}
  </Link>
);

// Main Navbar Component
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for mobile menu
  const [isTutorsDropdownOpen, setIsTutorsDropdownOpen] = useState(false);
  const [isJobsDropdownOpen, setIsJobsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = useAuth(); // useAuth now returns a boolean

  // Refs for dropdowns and mobile menu to handle click-outside close
  const tutorsDropdownRef = useRef(null);
  const jobsDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const mobileMenuButtonRef = useRef(null); // Ref for the mobile menu toggle button

  // Close dropdowns/mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close Tutors dropdown
      if (tutorsDropdownRef.current && !tutorsDropdownRef.current.contains(event.target)) {
        setIsTutorsDropdownOpen(false);
      }
      // Close Jobs dropdown
      if (jobsDropdownRef.current && !jobsDropdownRef.current.contains(event.target)) {
        setIsJobsDropdownOpen(false);
      }
      // Close Mobile Menu
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        mobileMenuButtonRef.current &&
        !mobileMenuButtonRef.current.contains(event.target)
      ) {
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
    // Reverted to original logout logic as useAuth no longer provides a logout function
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    console.log("Logged out successfully"); // Keep console log for debugging/info
    navigate("/"); // Redirect to home or login after logout
    setIsMenuOpen(false); // Close mobile menu on navigation
  };

  const handleRequestTutor = () => {
    // Logic adapted for isAuthenticated
    if (isAuthenticated) {
      navigate('/dashboard'); // If logged in, go to dashboard
    } else {
      navigate('/signup'); // If not logged in, go to signup
    }
    setIsMenuOpen(false); // Close mobile menu on navigation
  };

  return (
    <nav className="bg-white shadow-lg fixed top-0 left-0 right-0 z-50 px-6 border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex justify-between items-center h-16 sm:h-[75px]">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center text-2xl sm:text-3xl font-bold text-blue-600 hover:text-blue-800 gap-2 tracking-tight transition-colors duration-200 ease-in-out"
        >
          TutorMove
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-8">
          <div className="flex items-center space-x-6">
            {/* Find Tutors Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsTutorsDropdownOpen(true)}
              onMouseLeave={() => setIsTutorsDropdownOpen(false)}
              ref={tutorsDropdownRef}
            >
              <span className="text-gray-700 hover:text-blue-600 font-medium text-base py-2 relative cursor-pointer transition-colors duration-200 ease-in-out">
                {'Find Tutors'} <span className="text-sm align-middle">▼</span>
              </span>

              {isTutorsDropdownOpen && (
                <div className="absolute top-full left-0 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[200px] z-10 mt-2 overflow-hidden">
                  <DropdownLink to="/tutors" text={'All Tutors'} onClick={() => setIsTutorsDropdownOpen(false)} />
                  <DropdownLink to="/tutors?type=online" text={'Online Tutors'} onClick={() => setIsTutorsDropdownOpen(false)} />
                  <DropdownLink to="/tutors?type=home" text={'Home Tutors'} onClick={() => setIsTutorsDropdownOpen(false)} />
                </div>
              )}
            </div>

            {/* Find Jobs Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsJobsDropdownOpen(true)}
              onMouseLeave={() => setIsJobsDropdownOpen(false)}
              ref={jobsDropdownRef}
            >
              <span className="text-gray-700 hover:text-blue-600 font-medium text-base py-2 relative cursor-pointer transition-colors duration-200 ease-in-out">
                {'Find Jobs'} <span className="text-sm align-middle">▼</span>
              </span>

              {isJobsDropdownOpen && (
                <div className="absolute top-full left-0 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[200px] z-10 mt-2 overflow-hidden">
                  <DropdownLink to="/jobs" text={'Teaching Jobs'} onClick={() => setIsJobsDropdownOpen(false)} />
                  <DropdownLink to="/jobs?type=online" text={'Online Teaching'} onClick={() => setIsJobsDropdownOpen(false)} />
                  <DropdownLink to="/jobs?type=assignment" text={'Assignment Jobs'} onClick={() => setIsJobsDropdownOpen(false)} />
                </div>
              )}
            </div>

            <NavLink to="/assignment-help" text={'Assignment Help'} />
          </div>

          {/* Auth Buttons */}
          <div style={authButtonsContainerStyle}>
            <LanguageSwitcher />

            {isAuthenticated ? (
              <>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 border border-transparent text-white bg-red-600 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 ease-in-out"
                >
                  {'Logout'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleLogin}
                  className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md text-sm font-medium hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ease-in-out"
                >
                  {'Login'}
                </button>
                <button
                  onClick={handleRequestTutor}
                  className="px-4 py-2 border border-transparent text-white bg-green-600 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 ease-in-out"
                >
                  {'Request a Tutor'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Button (Hamburger) */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-800 text-3xl cursor-pointer"
          ref={mobileMenuButtonRef}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu Overlay and Content */}
      {/* Overlay to dim background */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ease-in-out ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      ></div>

      {/* Mobile Menu Content */}
      <div
        className={`fixed top-16 right-0 w-72 h-[calc(100vh-4rem)] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col p-5 ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        ref={mobileMenuRef}
      >
        {/* Mobile Links */}
        <Link
          to="/tutors"
          className="block py-3 px-0 text-gray-700 font-medium text-lg border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200 ease-in-out"
          onClick={() => setIsMenuOpen(false)}
        >
          {'Find Tutors'}
        </Link>
        <Link
          to="/jobs"
          className="block py-3 px-0 text-gray-700 font-medium text-lg border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200 ease-in-out"
          onClick={() => setIsMenuOpen(false)}
        >
          {'Find Jobs'}
        </Link>
        <Link
          to="/assignment-help"
          className="block py-3 px-0 text-gray-700 font-medium text-lg border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200 ease-in-out"
          onClick={() => setIsMenuOpen(false)}
        >
          {'Assignment Help'}
        </Link>

        {/* LanguageSwitcher removed */}

        {isAuthenticated ? (
          <>
            <Link
              to="/dashboard"
              className="block py-3 px-0 text-gray-700 font-medium text-lg border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200 ease-in-out mt-5"
              onClick={() => setIsMenuOpen(false)}
            >
              {'Dashboard'}
            </Link>
            {/* Messages link and unread count removed */}
            <span className="block py-3 px-0 text-gray-700 font-medium text-lg border-b border-gray-200 last:border-b-0 cursor-default">
              {'Welcome'}! {/* Simplified as username is unavailable */}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-transparent text-white bg-red-600 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 ease-in-out self-start mt-5"
            >
              {'Logout'}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleLogin}
              className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md text-sm font-medium hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ease-in-out self-start mt-5"
            >
              {'Login'}
            </button>
            <button
              onClick={handleRequestTutor}
              className="px-4 py-2 border border-transparent text-white bg-green-600 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 ease-in-out self-start mt-3"
            >
              {'Request a Tutor'}
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
