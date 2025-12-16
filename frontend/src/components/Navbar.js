// src/components/Navbar.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/UseAuth";
import { useTheme } from "../contexts/ThemeContext";
import ProfileImageWithBg from "../components/ProfileImageWithBg";
import { Sun, Moon } from "lucide-react";

// Icons
const ChevronDownIcon = ({ className }) => (
  <svg
    className={`w-4 h-4 transition-transform duration-200 ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// NavLink Component
const NavLink = ({ to, text }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`relative px-3 py-2 text-sm font-medium transition-colors duration-200 ${
        isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
      }`}
    >
      {text}
      {isActive && (
        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full transform scale-x-100 transition-transform duration-300" />
      )}
    </Link>
  );
};

// DropdownLink Component
const DropdownLink = ({ to, text, onClick }) => (
  <Link
    to={to}
    className="block px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
    onClick={onClick}
  >
    {text}
  </Link>
);

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null); // 'tutors', 'jobs', 'account'
  const [scrolled, setScrolled] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const userData = JSON.parse(localStorage.getItem("user")) || {};

  const userName = userData?.username || "User";
  const userType = userData?.user_type || null;
  const profilePicture = userData?.profile_picture || null;
  const userInitial = userName.charAt(0).toUpperCase();
  const isDualRole = userData?.is_dual_role || false;

  const navRef = useRef(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setActiveDropdown(null);
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
  }, [location]);

  const toggleDropdown = (name) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const handleLogin = () => navigate("/login");
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  const handleRequestTutor = () => {
    isAuthenticated ? navigate("/dashboard") : navigate("/signup");
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
        const updatedUser = {
          ...userData,
          user_type: data.current_role,
          is_dual_role: data.is_dual_role
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
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
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-[50] transition-all duration-300 ${
        scrolled || isMenuOpen
          ? "bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm border-b border-slate-200/50 dark:border-slate-800"
          : "bg-white dark:bg-slate-900 border-b border-transparent dark:border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-indigo-200 shadow-lg group-hover:scale-105 transition-transform">
                T
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                TutorMove
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">

            {/* Find Tutors Dropdown (Student, Admin, Moderator, or Guest) */}
            {(userType === "student" || userType === "admin" || userType === "moderator" || !isAuthenticated) && (
              <div className="relative group">
                <button
                  onClick={() => toggleDropdown("tutors")}
                  className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeDropdown === "tutors"
                      ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400"
                      : "text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  Find Tutors
                  <ChevronDownIcon className={activeDropdown === "tutors" ? "rotate-180" : ""} />
                </button>

                {/* Desktop Dropdown Panel */}
                {activeDropdown === "tutors" && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                     <DropdownLink to="/tutors" text="Browse All Tutors" onClick={() => setActiveDropdown(null)} />
                     <DropdownLink to="/tutors?type=online" text="Online Tutors" onClick={() => setActiveDropdown(null)} />
                     <DropdownLink to="/tutors?type=home" text="Home Tutors" onClick={() => setActiveDropdown(null)} />
                  </div>
                )}
              </div>
            )}

            {/* Find Jobs Dropdown (Tutor, Admin, Moderator, or Guest) */}
            {(userType === "tutor" || userType === "admin" || userType === "moderator" || !isAuthenticated) && (
              <div className="relative">
                <button
                  onClick={() => toggleDropdown("jobs")}
                   className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeDropdown === "jobs"
                      ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400"
                      : "text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  Find Jobs
                  <ChevronDownIcon className={activeDropdown === "jobs" ? "rotate-180" : ""} />
                </button>
                {activeDropdown === "jobs" && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <DropdownLink to="/jobs" text="Browse All Jobs" onClick={() => setActiveDropdown(null)} />
                    <DropdownLink to="/jobs?type=online" text="Online Teaching Jobs" onClick={() => setActiveDropdown(null)} />
                    <DropdownLink to="/jobs?type=assignment" text="Assignment Help" onClick={() => setActiveDropdown(null)} />
                  </div>
                )}
              </div>
            )}

            <NavLink to="/qna" text="Q&A Forum" />
            {isAuthenticated && <NavLink to="/dashboard" text="Dashboard" />}
          </div>

          {/* Desktop Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all duration-300 ${
                isDarkMode
                  ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700 hover:text-yellow-300'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-indigo-600'
              }`}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {isAuthenticated ? (
              <div className="relative ml-2">
                <button
                  onClick={() => toggleDropdown("account")}
                  className="flex items-center gap-2 p-1 pl-2 pr-1 rounded-full border border-slate-200 dark:border-slate-700 hover:border-indigo-200 hover:shadow-md transition-all bg-white dark:bg-slate-900"
                >
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200 pl-1">{userName}</span>
                   {profilePicture ? (
                      <ProfileImageWithBg imageUrl={profilePicture} size={32} className="rounded-full ring-2 ring-white dark:ring-slate-800" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-sm">
                        {userInitial}
                      </div>
                    )}
                </button>

                {activeDropdown === "account" && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-800">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{userName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{userType}</p>
                       {isDualRole && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 mt-1">
                            Dual Role Account
                          </span>
                        )}
                    </div>

                    <div className="py-1">
                      <DropdownLink to="/profile" text="My Profile" onClick={() => setActiveDropdown(null)} />
                      <DropdownLink to="/dashboard" text="Dashboard" onClick={() => setActiveDropdown(null)} />
                      <DropdownLink to="/messages" text="Messages" onClick={() => setActiveDropdown(null)} />
                    </div>

                    <div className="border-t border-slate-50 dark:border-slate-800 py-1">
                       {isDualRole && (
                        <button
                          onClick={() => {
                            handleSwitchRole();
                            setActiveDropdown(null);
                          }}
                           className="w-full text-left px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                        >
                          Switch to {userType === 'student' ? 'Tutor' : 'Student'}
                        </button>
                      )}
                      {!isDualRole && userType === 'student' && (
                        <button
                          onClick={() => {
                            navigate('/apply-tutor');
                            setActiveDropdown(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors"
                        >
                          Become a Tutor
                        </button>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={handleLogin}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={handleRequestTutor}
                  className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-full hover:bg-indigo-700 shadow-sm hover:shadow-indigo-200 hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                >
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {/* Mobile Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all duration-300 ${
                isDarkMode
                  ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`md:hidden fixed inset-x-0 top-[64px] bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-lg transform transition-all duration-300 origin-top overflow-y-auto max-h-[calc(100vh-64px)] ${
          isMenuOpen ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0"
        }`}
      >
        <div className="px-4 py-6 space-y-4">
           {/* Mobile Navigation Links */}
           <div className="space-y-1">
             <Link
                to="/"
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400"
                onClick={() => setIsMenuOpen(false)}
             >
                Home
             </Link>

              {(userType === "student" || userType === "admin" || userType === "moderator" || !isAuthenticated) && (
                <>
                  <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mt-4">Tutors</div>
                  <Link to="/tutors" className="block px-3 py-2 text-base font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 pl-6" onClick={() => setIsMenuOpen(false)}>Browse All</Link>
                  <Link to="/tutors?type=online" className="block px-3 py-2 text-base font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 pl-6" onClick={() => setIsMenuOpen(false)}>Online Tutors</Link>
                </>
              )}

              {(userType === "tutor" || userType === "admin" || userType === "moderator" || !isAuthenticated) && (
                <>
                  <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mt-4">Jobs</div>
                  <Link to="/jobs" className="block px-3 py-2 text-base font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 pl-6" onClick={() => setIsMenuOpen(false)}>Browse Jobs</Link>
                  <Link to="/jobs?type=online" className="block px-3 py-2 text-base font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 pl-6" onClick={() => setIsMenuOpen(false)}>Online Jobs</Link>
                </>
              )}

              <Link
                to="/qna"
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 mt-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Q&A Forum
              </Link>

              {isAuthenticated && (
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
           </div>

           {/* Mobile Auth Actions */}
           <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
             {isAuthenticated ? (
               <div className="space-y-3 px-3">
                 <div className="flex items-center gap-3 mb-4">
                   {profilePicture ? (
                      <ProfileImageWithBg imageUrl={profilePicture} size={40} className="rounded-full" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-base">
                        {userInitial}
                      </div>
                    )}
                   <div>
                     <div className="font-semibold text-slate-900 dark:text-white">{userName}</div>
                     <div className="text-xs text-slate-500 dark:text-slate-400 capitalize">{userType}</div>
                   </div>
                 </div>

                 <Link to="/profile" className="block text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium" onClick={() => setIsMenuOpen(false)}>My Profile</Link>
                 <Link to="/messages" className="block text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium" onClick={() => setIsMenuOpen(false)}>Messages</Link>

                 <button
                    onClick={handleLogout}
                    className="block w-full text-left text-rose-600 dark:text-rose-400 font-medium hover:text-rose-700 dark:hover:text-rose-300"
                 >
                    Sign Out
                 </button>
               </div>
             ) : (
               <div className="grid grid-cols-2 gap-4 px-3">
                 <button
                    onClick={() => {
                      handleLogin();
                      setIsMenuOpen(false);
                    }}
                    className="flex justify-center items-center px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
                 >
                   Log In
                 </button>
                 <button
                    onClick={() => {
                      handleRequestTutor();
                      setIsMenuOpen(false);
                    }}
                    className="flex justify-center items-center px-4 py-2 bg-indigo-600 rounded-lg text-white font-medium hover:bg-indigo-700 shadow-sm"
                 >
                   Sign Up
                 </button>
               </div>
             )}
           </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;