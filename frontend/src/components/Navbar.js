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
  const { isAuthenticated } = useAuth();

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
            {/* <svg
              className="w-8 h-8 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 14L8 10H16L12 14Z"
                fill="currentColor"
                className="text-blue-600"
              />
              <path
                d="M12 10L16 14H8L12 10Z"
                fill="currentColor"
                className="text-blue-800"
              />
              <path
                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                stroke="currentColor"
                strokeWidth="2"
                className="text-blue-600"
                fill="none"
              />
            </svg> */}
            TutorMove
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <div className="flex items-center space-x-6">
              {/* Tutors Dropdown */}
              <div className="relative" ref={tutorsDropdownRef}>
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
              </div>

              {/* Jobs Dropdown */}
              <div className="relative" ref={jobsDropdownRef}>
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
              </div>

              <NavLink to="/assignment-help" text="Assignment Help" />
              {isAuthenticated && <NavLink to="/dashboard" text="Dashboard" />}
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-4">
              <LanguageSwitcher />

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
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=32&h=32&q=80"
                        alt="User profile"
                        className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 hover:border-blue-500 transition-colors"
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
