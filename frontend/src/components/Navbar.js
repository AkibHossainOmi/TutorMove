import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/UseAuth";
import LanguageSwitcher from "./LanguageSwitcher";

const ChevronDownIcon = () => (
  <svg
    className="ml-1 h-4 w-4 text-gray-500 group-hover:text-blue-600 transition-colors"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M5.23 7.21a.75.75 0 011.06.02L10 10.939l3.71-3.71a.75.75 0 011.08 1.04l-4.24 4.25a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z"
      clipRule="evenodd"
    />
  </svg>
);

const NavLink = ({ to, text }) => (
  <Link
    to={to}
    className="text-gray-700 hover:text-blue-600 font-medium text-base py-2 transition-colors"
  >
    {text}
  </Link>
);

const DropdownLink = ({ to, text, onClick }) => (
  <Link
    to={to}
    className="block px-4 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-600 text-sm transition-colors rounded"
    onClick={onClick}
  >
    {text}
  </Link>
);

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTutorsDropdownOpen, setIsTutorsDropdownOpen] = useState(false);
  const [isJobsDropdownOpen, setIsJobsDropdownOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = useAuth();
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userType = user?.user_type || null;
  const tutorsDropdownRef = useRef(null);
  const jobsDropdownRef = useRef(null);
  const accountDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const mobileMenuButtonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (tutorsDropdownRef.current && !tutorsDropdownRef.current.contains(e.target)) {
        setIsTutorsDropdownOpen(false);
      }
      if (jobsDropdownRef.current && !jobsDropdownRef.current.contains(e.target)) {
        setIsJobsDropdownOpen(false);
      }
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(e.target)) {
        setIsAccountDropdownOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target) &&
        mobileMenuButtonRef.current &&
        !mobileMenuButtonRef.current.contains(e.target)
      ) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogin = () => {
    navigate("/login");
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    setIsMenuOpen(false);
  };

  const handleRequestTutor = () => {
    isAuthenticated ? navigate("/dashboard") : navigate("/signup");
    setIsMenuOpen(false);
  };

  const toggleTutorsDropdown = () => setIsTutorsDropdownOpen((prev) => !prev);
  const toggleJobsDropdown = () => setIsJobsDropdownOpen((prev) => !prev);
  const toggleAccountDropdown = () => setIsAccountDropdownOpen((prev) => !prev);

  return (
    <nav className="bg-white shadow-sm fixed top-0 left-0 right-0 z-[1100] border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-[75px]">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl sm:text-3xl font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center"
          >
            TutorMove
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-10">
            <div className="flex items-center space-x-6">
              {/* Tutors Dropdown */}
              {userType === "student" && <div className="relative" ref={tutorsDropdownRef}>
                <button
                  onClick={toggleTutorsDropdown}
                  className="group flex items-center text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  aria-haspopup="true"
                  aria-expanded={isTutorsDropdownOpen}
                >
                  Find Tutors
                  <ChevronDownIcon />
                </button>

                {isTutorsDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 px-2 z-20 border border-gray-100">
                    <DropdownLink
                      to="/tutors"
                      text="All Tutors"
                      onClick={() => setIsTutorsDropdownOpen(false)}
                    />
                    <DropdownLink
                      to="/tutors?type=online"
                      text="Online Tutors"
                      onClick={() => setIsTutorsDropdownOpen(false)}
                    />
                    <DropdownLink
                      to="/tutors?type=home"
                      text="Home Tutors"
                      onClick={() => setIsTutorsDropdownOpen(false)}
                    />
                  </div>
                )}
              </div>}

              {/* Jobs Dropdown */}
              {userType === "tutor" && <div className="relative" ref={jobsDropdownRef}>
                <button
                  onClick={toggleJobsDropdown}
                  className="group flex items-center text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  aria-haspopup="true"
                  aria-expanded={isJobsDropdownOpen}
                >
                  Find Jobs
                  <ChevronDownIcon />
                </button>

                {isJobsDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 px-2 z-20 border border-gray-100">
                    <DropdownLink
                      to="/jobs"
                      text="Teaching Jobs"
                      onClick={() => setIsJobsDropdownOpen(false)}
                    />
                    <DropdownLink
                      to="/jobs?type=online"
                      text="Online Teaching"
                      onClick={() => setIsJobsDropdownOpen(false)}
                    />
                    <DropdownLink
                      to="/jobs?type=assignment"
                      text="Assignment Jobs"
                      onClick={() => setIsJobsDropdownOpen(false)}
                    />
                  </div>
                )}
              </div>}

              {/* <NavLink to="/assignment-help" text="Assignment Help" /> */}
              {isAuthenticated && <NavLink to="/dashboard" text="Dashboard" />}
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-4">
              {/* <LanguageSwitcher /> */}

              {isAuthenticated ? (
                <div className="relative" ref={accountDropdownRef}>
                  <button
                    onClick={toggleAccountDropdown}
                    className="flex items-center space-x-1 focus:outline-none"
                    aria-haspopup="true"
                    aria-expanded={isAccountDropdownOpen}
                  >
                    <div className="relative">
                      <img
                        src="data:image/png;base64,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"
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <ChevronDownIcon />
                  </button>

                  {isAccountDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 px-2 z-30 border border-gray-100">
                      <DropdownLink
                        to="/profile"
                        text="Profile"
                        onClick={() => setIsAccountDropdownOpen(false)}
                      />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button
                    onClick={handleLogin}
                    className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 hover:border-blue-700 hover:text-blue-700 transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={handleRequestTutor}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition-colors shadow-sm"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 -mr-2 text-gray-600 hover:text-gray-900 focus:outline-none transition-colors"
            ref={mobileMenuButtonRef}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
          isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMenuOpen(false)}
        aria-hidden={!isMenuOpen}
      />

      {/* Mobile Menu */}
      <div
        ref={mobileMenuRef}
        className={`lg:hidden fixed top-16 right-0 w-64 h-[calc(100vh-4rem)] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        } overflow-y-auto`}
      >
        <div className="px-4 py-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Navigation
              </h3>
              <div className="space-y-1">
                <Link
                  to="/tutors"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Find Tutors
                </Link>
                <Link
                  to="/jobs"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Find Jobs
                </Link>
                <Link
                  to="/assignment-help"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Assignment Help
                </Link>
                {isAuthenticated && (
                  <Link
                    to="/dashboard"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                )}
              </div>
            </div>

            {isAuthenticated ? (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Account
                </h3>
                <div className="space-y-1">
                  <Link
                    to="/profile"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-4 pb-2 border-t border-gray-200">
                <div className="space-y-3">
                  <button
                    onClick={handleLogin}
                    className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-lg text-base font-medium hover:bg-blue-50 transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={handleRequestTutor}
                    className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-base font-medium hover:from-blue-700 hover:to-blue-800 transition-colors shadow-sm"
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-gray-200">
              <LanguageSwitcher mobile />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
