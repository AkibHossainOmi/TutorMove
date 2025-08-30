import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/UseAuth";
import LanguageSwitcher from "./LanguageSwitcher";
import ProfileImageWithBg from "../components/ProfileImageWithBg";
import { userApi } from "../utils/apiService"; // same API as Profile.js

// Chevron icon
const ChevronDownIcon = () => (
  <svg
    className="ml-1 h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors"
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

// Nav link
const NavLink = ({ to, text, onClick }) => (
  <Link
    to={to}
    className="text-gray-700 hover:text-blue-600 font-medium text-base transition-colors"
    onClick={onClick}
  >
    {text}
  </Link>
);

// Dropdown link
const DropdownLink = ({ to, text, onClick }) => (
  <Link
    to={to}
    className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 text-sm transition-all rounded-md"
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
  const [userData, setUserData] = useState(null);

  const navigate = useNavigate();
  const isAuthenticated = useAuth();

  // Fetch user on login
  useEffect(() => {
    const fetchUser = async () => {
      if (!isAuthenticated) return;
      try {
        const res = await userApi.getUser();
        setUserData(res.data);
        localStorage.setItem("user", JSON.stringify(res.data)); // keep in sync
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };
    fetchUser();
  }, [isAuthenticated]);

  // Handlers
  const handleLogin = () => {
    navigate("/login");
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUserData(null);
    navigate("/");
    setIsMenuOpen(false);
  };

  const handleRequestTutor = () => {
    isAuthenticated ? navigate("/dashboard") : navigate("/signup");
    setIsMenuOpen(false);
  };

  const closeAllDropdowns = () => {
    setIsTutorsDropdownOpen(false);
    setIsJobsDropdownOpen(false);
    setIsAccountDropdownOpen(false);
    setIsMenuOpen(false);
  };

  const tutorsDropdownRef = useRef(null);
  const jobsDropdownRef = useRef(null);
  const accountDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const mobileMenuButtonRef = useRef(null);

  // Close dropdowns on outside click
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

  const userName = userData?.username || "User";
  const userType = userData?.user_type || null;
  const profilePicture = userData?.profile_picture || null;
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <nav className="fixed top-0 left-0 right-0 z-[1100] border-b border-gray-200 bg-white/90 backdrop-blur-sm shadow-md">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navbar Flex */}
        <div className="flex justify-between items-center h-12 sm:h-14">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl sm:text-3xl font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center"
          >
            TutorMove
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-5">
            <div className="flex items-center space-x-4">
              {(userType === "student" || !isAuthenticated) && (
                <div className="relative" ref={tutorsDropdownRef}>
                  <button
                    onClick={() => setIsTutorsDropdownOpen((prev) => !prev)}
                    className="group flex items-center text-gray-700 hover:text-blue-600 font-medium text-base transition-colors"
                  >
                    Find Tutors
                    <ChevronDownIcon />
                  </button>
                  {isTutorsDropdownOpen && (
                    <div className="absolute left-0 mt-1 w-44 rounded-xl shadow-md py-2 px-2 z-20 border border-gray-200 bg-white top-full">
                      <DropdownLink to="/tutors" text="All Tutors" onClick={closeAllDropdowns} />
                      <DropdownLink to="/tutors?type=online" text="Online Tutors" onClick={closeAllDropdowns} />
                      <DropdownLink to="/tutors?type=home" text="Home Tutors" onClick={closeAllDropdowns} />
                    </div>
                  )}
                </div>
              )}

              {(userType === "tutor" || !isAuthenticated) && (
                <div className="relative" ref={jobsDropdownRef}>
                  <button
                    onClick={() => setIsJobsDropdownOpen((prev) => !prev)}
                    className="group flex items-center text-gray-700 hover:text-blue-600 font-medium text-base transition-colors"
                  >
                    Find Jobs
                    <ChevronDownIcon />
                  </button>
                  {isJobsDropdownOpen && (
                    <div className="absolute left-0 mt-1 w-44 rounded-xl shadow-md py-2 px-2 z-20 border border-gray-200 bg-white top-full">
                      <DropdownLink to="/jobs" text="Teaching Jobs" onClick={closeAllDropdowns} />
                      <DropdownLink to="/jobs?type=online" text="Online Teaching" onClick={closeAllDropdowns} />
                      <DropdownLink to="/jobs?type=assignment" text="Assignment Jobs" onClick={closeAllDropdowns} />
                    </div>
                  )}
                </div>
              )}

              {isAuthenticated && <NavLink to="/dashboard" text="Dashboard" onClick={closeAllDropdowns} />}
            </div>

            {/* Auth */}
            <div className="flex items-center gap-3">
              {isAuthenticated && userData ? (
                <div className="relative" ref={accountDropdownRef}>
                  <button
                    onClick={() => setIsAccountDropdownOpen((prev) => !prev)}
                    className="flex items-center space-x-2 focus:outline-none"
                  >
                    {profilePicture ? (
                      <ProfileImageWithBg imageUrl={profilePicture} size={32} />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium border border-gray-200">
                        {userInitial}
                      </div>
                    )}
                    <span className="font-medium text-gray-700">{userName}</span>
                    <ChevronDownIcon />
                  </button>
                  {isAccountDropdownOpen && (
                    <div className="absolute right-0 mt-1 w-44 rounded-xl shadow-md py-2 px-2 z-30 border border-gray-200 bg-white top-full">
                      <DropdownLink to="/profile" text="Profile" onClick={closeAllDropdowns} />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100 rounded transition-colors"
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
                    className="px-4 py-1.5 border border-blue-600 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={handleRequestTutor}
                    className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-md"
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
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      <div
        className={`lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Mobile Drawer */}
      <div
        ref={mobileMenuRef}
        className={`lg:hidden fixed top-12 sm:top-14 right-0 w-60 h-[calc(100vh-3rem)] sm:h-[calc(100vh-3.5rem)] rounded-l-2xl border-l border-gray-200 bg-white/95 backdrop-blur-sm shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        } overflow-y-auto`}
      >
        <div className="px-4 py-6 space-y-4">
          {/* Links */}
          <div className="space-y-1">
            {(userType === "student" || !isAuthenticated) && (
              <Link
                to="/tutors"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
                onClick={closeAllDropdowns}
              >
                Find Tutors
              </Link>
            )}
            {(userType === "tutor" || !isAuthenticated) && (
              <Link
                to="/jobs"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
                onClick={closeAllDropdowns}
              >
                Find Jobs
              </Link>
            )}
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
                onClick={closeAllDropdowns}
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* Account */}
          {isAuthenticated && userData ? (
            <div className="pt-4 border-t border-gray-200 space-y-1">
              <div className="flex items-center gap-2 px-3">
                {profilePicture ? (
                  <ProfileImageWithBg imageUrl={profilePicture} size={32} />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium border border-gray-200">
                    {userInitial}
                  </div>
                )}
                <span className="font-medium text-gray-700">{userName}</span>
              </div>
              <Link
                to="/profile"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
                onClick={closeAllDropdowns}
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-100 transition-all"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-gray-200 space-y-3">
              <button
                onClick={handleLogin}
                className="w-full px-4 py-1.5 border border-blue-600 text-blue-600 rounded-lg text-base font-medium hover:bg-blue-50 transition-all"
              >
                Login
              </button>
              <button
                onClick={handleRequestTutor}
                className="w-full px-4 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-base font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-md"
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Language Switcher */}
          <div className="pt-4 border-t border-gray-200">
            <LanguageSwitcher mobile />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
