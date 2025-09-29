// src/components/Navbar.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/UseAuth";
import ProfileImageWithBg from "../components/ProfileImageWithBg";

// Chevron Icon
const ChevronDownIcon = () => (
  <svg
    className="ml-1 h-3.5 w-3.5 text-gray-400 group-hover:text-indigo-500 transition-colors"
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

// NavLink Component
const NavLink = ({ to, text, onClick }) => (
  <Link
    to={to}
    className="text-gray-700 hover:text-indigo-600 font-medium text-base px-2 py-1 rounded-lg transition-colors"
    onClick={onClick}
  >
    {text}
  </Link>
);

// DropdownLink Component
const DropdownLink = ({ to, text, onClick }) => (
  <Link
    to={to}
    className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 text-base rounded-md transition-colors"
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
  const userData = JSON.parse(localStorage.getItem("user")) || {};

  const userName = userData?.username || "User";
  const userType = userData?.user_type || null;
  const profilePicture = userData?.profile_picture || null;
  const userInitial = userName.charAt(0).toUpperCase();

  // Refs for click outside
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

  const handleLogin = () => navigate("/login");
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

  return (
    <nav className="fixed top-0 left-0 right-0 z-[1100] bg-white/80 backdrop-blur-md shadow-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-10 sm:h-11">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-green-600 to-indigo-600 bg-clip-text text-transparent leading-none"
          >
            TutorMove
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-5">
            {(userType === "student" || !isAuthenticated) && (
              <div className="relative" ref={tutorsDropdownRef}>
                <button
                  onClick={() => setIsTutorsDropdownOpen((prev) => !prev)}
                  className="group flex items-center text-gray-700 hover:text-indigo-600 font-medium text-base"
                >
                  Find Tutors
                  <ChevronDownIcon />
                </button>
                {isTutorsDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20">
                    <DropdownLink to="/tutors" text="All Tutors" onClick={() => setIsTutorsDropdownOpen(false)} />
                    <DropdownLink to="/tutors?type=online" text="Online Tutors" onClick={() => setIsTutorsDropdownOpen(false)} />
                    <DropdownLink to="/tutors?type=home" text="Home Tutors" onClick={() => setIsTutorsDropdownOpen(false)} />
                  </div>
                )}
              </div>
            )}

            {(userType === "tutor" || !isAuthenticated) && (
              <div className="relative" ref={jobsDropdownRef}>
                <button
                  onClick={() => setIsJobsDropdownOpen((prev) => !prev)}
                  className="group flex items-center text-gray-700 hover:text-indigo-600 font-medium text-base"
                >
                  Find Jobs
                  <ChevronDownIcon />
                </button>
                {isJobsDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20">
                    <DropdownLink to="/jobs" text="All Jobs" onClick={() => setIsJobsDropdownOpen(false)} />
                    <DropdownLink to="/jobs?type=online" text="Online Teaching" onClick={() => setIsJobsDropdownOpen(false)} />
                    <DropdownLink to="/jobs?type=assignment" text="Assignment Jobs" onClick={() => setIsJobsDropdownOpen(false)} />
                  </div>
                )}
              </div>
            )}

            {isAuthenticated && <NavLink to="/dashboard" text="Dashboard" />}

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <div className="relative" ref={accountDropdownRef}>
                  <button
                    onClick={() => setIsAccountDropdownOpen((prev) => !prev)}
                    className="flex items-center space-x-2"
                  >
                    {profilePicture ? (
                      <ProfileImageWithBg imageUrl={profilePicture} size={32} />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-base">
                        {userInitial}
                      </div>
                    )}
                    <span className="font-medium text-gray-700 text-base">{userName}</span>
                    <ChevronDownIcon />
                  </button>
                  {isAccountDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-30">
                      <DropdownLink to="/profile" text="Profile" onClick={() => setIsAccountDropdownOpen(false)} />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-base text-red-600 hover:bg-red-100 rounded-md transition-colors"
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
                    className="px-3 py-1 text-base font-medium border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition"
                  >
                    Login
                  </button>
                  <button
                    onClick={handleRequestTutor}
                    className="px-3 py-1 text-base font-medium rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow hover:from-indigo-700 hover:to-purple-700 transition"
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
            className="lg:hidden p-1.5 text-gray-700 hover:text-indigo-600 transition"
            ref={mobileMenuButtonRef}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        ref={mobileMenuRef}
        className={`lg:hidden fixed top-10 inset-x-0 w-full bg-white/95 backdrop-blur-md shadow-xl border-t border-gray-200 transform transition-all duration-300 ${
          isMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-5 opacity-0 pointer-events-none"
        }`}
      >
        <div className="px-6 py-5 space-y-4">
          {(userType === "student" || !isAuthenticated) && <NavLink to="/tutors" text="Find Tutors" onClick={() => setIsMenuOpen(false)} />}
          {(userType === "tutor" || !isAuthenticated) && <NavLink to="/jobs" text="Find Jobs" onClick={() => setIsMenuOpen(false)} />}
          {isAuthenticated && <NavLink to="/dashboard" text="Dashboard" onClick={() => setIsMenuOpen(false)} />}

          {isAuthenticated ? (
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                {profilePicture ? (
                  <ProfileImageWithBg imageUrl={profilePicture} size={32} />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-base">
                    {userInitial}
                  </div>
                )}
                <span className="font-medium text-gray-700 text-base">{userName}</span>
              </div>
              <DropdownLink to="/profile" text="Profile" onClick={() => setIsMenuOpen(false)} />
              <button
                onClick={handleLogout}
                className="w-full mt-2 text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-100 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-gray-200 space-y-3">
              <button
                onClick={handleLogin}
                className="w-full px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg text-base font-medium hover:bg-indigo-50 transition"
              >
                Login
              </button>
              <button
                onClick={handleRequestTutor}
                className="w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-base font-medium shadow hover:from-indigo-700 hover:to-purple-700 transition"
              >
                Sign Up
              </button>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200">
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
