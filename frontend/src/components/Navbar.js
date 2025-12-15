// src/components/Navbar.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/UseAuth";
import ProfileImageWithBg from "../components/ProfileImageWithBg";

// Chevron Icon
const ChevronDownIcon = () => (
  <svg
    className="ml-1 h-4 w-4 text-gray-400 group-hover:text-indigo-600 transition-colors"
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
    className="text-gray-600 hover:text-indigo-600 font-medium text-[15px] px-3 py-2 rounded-lg transition-all duration-200"
    onClick={onClick}
  >
    {text}
  </Link>
);

// DropdownLink Component
const DropdownLink = ({ to, text, onClick }) => (
  <Link
    to={to}
    className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
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
  const isDualRole = userData?.is_dual_role || false;

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

  const handleSwitchRole = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/users/switch-role/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Update user data in localStorage, preserving is_dual_role
        const updatedUser = {
          ...userData,
          user_type: data.current_role,
          is_dual_role: data.is_dual_role
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        // Refresh the page to update UI
        window.location.reload();
      } else {
        alert('Failed to switch role');
      }
    } catch (error) {
      console.error('Error switching role:', error);
      alert('Failed to switch role');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-[1100] bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold text-gray-900 tracking-tight hover:text-indigo-600 transition-colors"
          >
            TutorMove
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {(userType === "student" || !isAuthenticated) && (
              <div className="relative" ref={tutorsDropdownRef}>
                <button
                  onClick={() => setIsTutorsDropdownOpen((prev) => !prev)}
                  className="group flex items-center text-gray-600 hover:text-indigo-600 font-medium text-[15px] px-3 py-2"
                >
                  Find Tutors
                  <ChevronDownIcon />
                </button>
                {isTutorsDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20 overflow-hidden ring-1 ring-black ring-opacity-5">
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
                  className="group flex items-center text-gray-600 hover:text-indigo-600 font-medium text-[15px] px-3 py-2"
                >
                  Find Jobs
                  <ChevronDownIcon />
                </button>
                {isJobsDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20 overflow-hidden ring-1 ring-black ring-opacity-5">
                    <DropdownLink to="/jobs" text="All Jobs" onClick={() => setIsJobsDropdownOpen(false)} />
                    <DropdownLink to="/jobs?type=online" text="Online Teaching" onClick={() => setIsJobsDropdownOpen(false)} />
                    <DropdownLink to="/jobs?type=assignment" text="Assignment Jobs" onClick={() => setIsJobsDropdownOpen(false)} />
                  </div>
                )}
              </div>
            )}

            <NavLink to="/qna" text="Q&A Forum" />

            {isAuthenticated && <NavLink to="/dashboard" text="Dashboard" />}

            {/* Auth Buttons */}
            <div className="flex items-center gap-4 ml-2">
              {isAuthenticated ? (
                <div className="relative" ref={accountDropdownRef}>
                  <button
                    onClick={() => setIsAccountDropdownOpen((prev) => !prev)}
                    className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-50 transition-colors"
                  >
                    {profilePicture ? (
                      <ProfileImageWithBg imageUrl={profilePicture} size={36} />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-sm shadow-sm">
                        {userInitial}
                      </div>
                    )}
                    <ChevronDownIcon />
                  </button>
                  {isAccountDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-30 ring-1 ring-black ring-opacity-5">
                      <div className="px-4 py-3 border-b border-gray-100 mb-2">
                        <p className="text-sm font-medium text-gray-900">{userName}</p>
                        <p className="text-xs text-gray-500 capitalize">{userType}</p>
                        {isDualRole && (
                          <p className="text-xs text-indigo-600 font-medium mt-1">✨ Dual Role</p>
                        )}
                      </div>
                      <DropdownLink to="/profile" text="Profile" onClick={() => setIsAccountDropdownOpen(false)} />
                      {isDualRole && (
                        <button
                          onClick={() => {
                            handleSwitchRole();
                            setIsAccountDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-indigo-600 hover:bg-indigo-50 transition-colors font-medium"
                        >
                          🔄 Switch to {userType === 'student' ? 'Tutor' : 'Student'}
                        </button>
                      )}
                      {!isDualRole && userType === 'student' && (
                        <button
                          onClick={() => {
                            navigate('/apply-tutor');
                            setIsAccountDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 transition-colors font-medium"
                        >
                          📝 Apply to be a Tutor
                        </button>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
                    className="px-5 py-2.5 text-[15px] font-medium text-gray-700 hover:text-indigo-600 transition-colors"
                  >
                    Log In
                  </button>
                  <button
                    onClick={handleRequestTutor}
                    className="px-5 py-2.5 text-[15px] font-medium rounded-full bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 hover:shadow transition-all duration-200"
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
            className="lg:hidden p-2 text-gray-600 hover:text-indigo-600 transition-colors rounded-lg hover:bg-gray-50"
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
        className={`lg:hidden fixed inset-x-0 top-16 bg-white border-b border-gray-100 shadow-lg transform transition-all duration-300 ease-in-out ${
          isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <div className="px-4 py-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {(userType === "student" || !isAuthenticated) && (
            <div className="space-y-2">
              <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Find Tutors</p>
              <NavLink to="/tutors" text="All Tutors" onClick={() => setIsMenuOpen(false)} />
              <NavLink to="/tutors?type=online" text="Online Tutors" onClick={() => setIsMenuOpen(false)} />
              <NavLink to="/tutors?type=home" text="Home Tutors" onClick={() => setIsMenuOpen(false)} />
            </div>
          )}

          {(userType === "tutor" || !isAuthenticated) && (
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <p className="px-2 mt-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Find Jobs</p>
              <NavLink to="/jobs" text="All Jobs" onClick={() => setIsMenuOpen(false)} />
              <NavLink to="/jobs?type=online" text="Online Teaching" onClick={() => setIsMenuOpen(false)} />
              <NavLink to="/jobs?type=assignment" text="Assignment Jobs" onClick={() => setIsMenuOpen(false)} />
            </div>
          )}

          <div className="pt-4 border-t border-gray-100">
             <NavLink to="/qna" text="Q&A Forum" onClick={() => setIsMenuOpen(false)} />
             {isAuthenticated && <NavLink to="/dashboard" text="Dashboard" onClick={() => setIsMenuOpen(false)} />}
          </div>

          {isAuthenticated ? (
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3 px-2 mb-4">
                {profilePicture ? (
                  <ProfileImageWithBg imageUrl={profilePicture} size={40} />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-base shadow-sm">
                    {userInitial}
                  </div>
                )}
                <div>
                  <span className="block font-medium text-gray-900">{userName}</span>
                  <span className="block text-xs text-gray-500 capitalize">{userType}</span>
                </div>
              </div>
              <NavLink to="/profile" text="Profile" onClick={() => setIsMenuOpen(false)} />
              <button
                onClick={handleLogout}
                className="w-full mt-3 text-left px-3 py-2.5 rounded-lg text-red-600 font-medium hover:bg-red-50 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
              <button
                onClick={handleLogin}
                className="w-full px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                Log In
              </button>
              <button
                onClick={handleRequestTutor}
                className="w-full px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium shadow-sm hover:bg-indigo-700 transition-all"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;