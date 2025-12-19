// src/components/Navbar.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/UseAuth";
import { useTheme } from "../contexts/ThemeContext";
import ProfileImageWithBg from "../components/ProfileImageWithBg";
import { Sun, Moon, Menu, X, ChevronDown, User, LogOut, MessageSquare, LayoutDashboard, SwitchCamera, GraduationCap } from "lucide-react";

// NavLink Component
const NavLink = ({ to, text }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`relative px-3 py-2 text-sm font-medium transition-all duration-300 rounded-lg group ${
        isActive
          ? "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/10"
          : "text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-white/5"
      }`}
    >
      {text}
      {isActive && (
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary-600 dark:bg-primary-400 rounded-full" />
      )}
    </Link>
  );
};

// DropdownLink Component
const DropdownLink = ({ to, text, onClick, icon: Icon }) => (
  <Link
    to={to}
    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-primary-600 dark:hover:text-primary-400 transition-all rounded-lg mx-1"
    onClick={onClick}
  >
    {Icon && <Icon className="w-4 h-4 opacity-70" />}
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
          ? "glass border-b border-white/20 dark:border-white/5 py-2"
          : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-primary-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-500/30 group-hover:scale-105 transition-transform duration-300">
                T
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 tracking-tight group-hover:to-primary-500 transition-all">
                TutorMove
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 bg-white/50 dark:bg-white/5 backdrop-blur-sm px-2 py-1.5 rounded-2xl border border-white/20 dark:border-white/5 shadow-sm">

            {/* Find Tutors Dropdown */}
            {(userType === "student" || userType === "admin" || userType === "moderator" || !isAuthenticated) && (
              <div className="relative group">
                <button
                  onClick={() => toggleDropdown("tutors")}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                    activeDropdown === "tutors"
                      ? "text-primary-600 bg-primary-50 dark:bg-primary-900/20 dark:text-primary-400"
                      : "text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-white/5"
                  }`}
                >
                  Find Tutors
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === "tutors" ? "rotate-180" : ""}`} />
                </button>

                {/* Desktop Dropdown Panel */}
                {activeDropdown === "tutors" && (
                  <div className="absolute top-full left-0 mt-3 w-64 bg-white dark:bg-dark-card rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-white/10 p-2 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                     <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Browse</div>
                     <DropdownLink to="/tutors" text="All Tutors" onClick={() => setActiveDropdown(null)} />
                     <DropdownLink to="/tutors?type=online" text="Online Tutors" onClick={() => setActiveDropdown(null)} />
                     <DropdownLink to="/tutors?type=home" text="Home Tutors" onClick={() => setActiveDropdown(null)} />
                  </div>
                )}
              </div>
            )}

            {/* Find Jobs Dropdown */}
            {(userType === "tutor" || userType === "admin" || userType === "moderator" || !isAuthenticated) && (
              <div className="relative">
                <button
                  onClick={() => toggleDropdown("jobs")}
                   className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                    activeDropdown === "jobs"
                      ? "text-primary-600 bg-primary-50 dark:bg-primary-900/20 dark:text-primary-400"
                      : "text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-white/5"
                  }`}
                >
                  Find Jobs
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === "jobs" ? "rotate-180" : ""}`} />
                </button>
                {activeDropdown === "jobs" && (
                  <div className="absolute top-full left-0 mt-3 w-64 bg-white dark:bg-dark-card rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-white/10 p-2 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                    <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Browse</div>
                    <DropdownLink to="/jobs" text="All Jobs" onClick={() => setActiveDropdown(null)} />
                    <DropdownLink to="/jobs?type=online" text="Online Jobs" onClick={() => setActiveDropdown(null)} />
                    <DropdownLink to="/jobs?type=assignment" text="Assignment Help" onClick={() => setActiveDropdown(null)} />
                  </div>
                )}
              </div>
            )}

            <NavLink to="/qna" text="Q&A" />
            {isAuthenticated && <NavLink to="/dashboard" text="Dashboard" />}
          </div>

          {/* Desktop Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl transition-all duration-300 border ${
                isDarkMode
                  ? 'bg-slate-800/50 border-slate-700 text-yellow-400 hover:bg-slate-700 hover:text-yellow-300 hover:shadow-glow-secondary'
                  : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-primary-600 hover:border-primary-200'
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
                  className="flex items-center gap-2.5 pl-3 pr-1.5 py-1.5 rounded-full border border-slate-200 dark:border-white/10 hover:border-primary-300 dark:hover:border-primary-500/50 hover:shadow-lg hover:shadow-primary-500/10 transition-all bg-white dark:bg-white/5 group"
                >
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{userName}</span>
                   {profilePicture ? (
                      <ProfileImageWithBg imageUrl={profilePicture} size={36} className="rounded-full ring-2 ring-white dark:ring-slate-800 shadow-sm" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-600 to-secondary-500 text-white flex items-center justify-center font-bold text-sm shadow-md">
                        {userInitial}
                      </div>
                    )}
                </button>

                {activeDropdown === "account" && (
                  <div className="absolute right-0 top-full mt-3 w-72 bg-white dark:bg-dark-card rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-white/10 p-2 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                    <div className="px-4 py-4 mb-2 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                      <p className="text-base font-bold text-slate-900 dark:text-white">{userName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-semibold mt-1">{userType}</p>
                       {isDualRole && (
                          <div className="mt-2 inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gradient-to-r from-primary-500/10 to-secondary-500/10 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                            Dual Role Account
                          </div>
                        )}
                    </div>

                    <div className="space-y-1">
                      <DropdownLink to="/profile" text="My Profile" icon={User} onClick={() => setActiveDropdown(null)} />
                      <DropdownLink to="/dashboard" text="Dashboard" icon={LayoutDashboard} onClick={() => setActiveDropdown(null)} />
                      <DropdownLink to="/messages" text="Messages" icon={MessageSquare} onClick={() => setActiveDropdown(null)} />
                    </div>

                    <div className="border-t border-slate-100 dark:border-white/10 my-2 pt-2 space-y-1">
                       {isDualRole && (
                        <button
                          onClick={() => {
                            handleSwitchRole();
                            setActiveDropdown(null);
                          }}
                           className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all rounded-lg mx-1"
                        >
                          <SwitchCamera className="w-4 h-4" />
                          Switch to {userType === 'student' ? 'Tutor' : 'Student'}
                        </button>
                      )}
                      {!isDualRole && userType === 'student' && (
                        <button
                          onClick={() => {
                            navigate('/apply-tutor');
                            setActiveDropdown(null);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all rounded-lg mx-1"
                        >
                          <GraduationCap className="w-4 h-4" />
                          Become a Tutor
                        </button>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all rounded-lg mx-1"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleLogin}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={handleRequestTutor}
                  className="btn-primary px-6 py-2.5 text-sm font-semibold rounded-xl"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all ${
                isDarkMode
                  ? 'bg-slate-800 text-yellow-400'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`md:hidden fixed inset-x-0 top-[60px] bg-white dark:bg-dark-bg border-b border-slate-100 dark:border-white/5 shadow-xl transform transition-all duration-300 origin-top overflow-y-auto max-h-[calc(100vh-60px)] ${
          isMenuOpen ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0"
        }`}
      >
        <div className="px-4 py-6 space-y-6">
           {/* Mobile Navigation Links */}
           <div className="space-y-1">
             <Link
                to="/"
                className="block px-4 py-3 rounded-xl text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-primary-600 dark:hover:text-primary-400"
                onClick={() => setIsMenuOpen(false)}
             >
                Home
             </Link>

              {(userType === "student" || userType === "admin" || userType === "moderator" || !isAuthenticated) && (
                <>
                  <div className="px-4 pt-4 pb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Find Tutors</div>
                  <Link to="/tutors" className="block px-4 py-3 rounded-xl text-base font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5" onClick={() => setIsMenuOpen(false)}>Browse All</Link>
                  <Link to="/tutors?type=online" className="block px-4 py-3 rounded-xl text-base font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5" onClick={() => setIsMenuOpen(false)}>Online Tutors</Link>
                </>
              )}

              {(userType === "tutor" || userType === "admin" || userType === "moderator" || !isAuthenticated) && (
                <>
                  <div className="px-4 pt-4 pb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Find Jobs</div>
                  <Link to="/jobs" className="block px-4 py-3 rounded-xl text-base font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5" onClick={() => setIsMenuOpen(false)}>Browse Jobs</Link>
                  <Link to="/jobs?type=online" className="block px-4 py-3 rounded-xl text-base font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5" onClick={() => setIsMenuOpen(false)}>Online Jobs</Link>
                </>
              )}

              <Link
                to="/qna"
                className="block px-4 py-3 rounded-xl text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-primary-600 dark:hover:text-primary-400 mt-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Q&A Forum
              </Link>

              {isAuthenticated && (
                <Link
                  to="/dashboard"
                  className="block px-4 py-3 rounded-xl text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-primary-600 dark:hover:text-primary-400"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
           </div>

           {/* Mobile Auth Actions */}
           <div className="pt-6 border-t border-slate-100 dark:border-white/5">
             {isAuthenticated ? (
               <div className="space-y-4 px-2">
                 <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-white/5 rounded-2xl">
                   {profilePicture ? (
                      <ProfileImageWithBg imageUrl={profilePicture} size={48} className="rounded-full" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-600 to-secondary-500 text-white flex items-center justify-center font-bold text-lg">
                        {userInitial}
                      </div>
                    )}
                   <div>
                     <div className="font-bold text-slate-900 dark:text-white">{userName}</div>
                     <div className="text-xs text-slate-500 dark:text-slate-400 capitalize">{userType}</div>
                   </div>
                 </div>

                 <div className="grid grid-cols-2 gap-2">
                   <Link to="/profile" className="flex justify-center py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 font-medium" onClick={() => setIsMenuOpen(false)}>Profile</Link>
                   <Link to="/messages" className="flex justify-center py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 font-medium" onClick={() => setIsMenuOpen(false)}>Messages</Link>
                 </div>

                 <button
                    onClick={handleLogout}
                    className="block w-full py-3 rounded-xl text-center text-rose-600 dark:text-rose-400 font-medium bg-rose-50 dark:bg-rose-900/10 hover:bg-rose-100 dark:hover:bg-rose-900/20"
                 >
                    Sign Out
                 </button>
               </div>
             ) : (
               <div className="flex flex-col gap-3 px-2">
                 <button
                    onClick={() => {
                      handleLogin();
                      setIsMenuOpen(false);
                    }}
                    className="w-full py-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-white/5"
                 >
                   Log In
                 </button>
                 <button
                    onClick={() => {
                      handleRequestTutor();
                      setIsMenuOpen(false);
                    }}
                    className="w-full py-3 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-700 shadow-lg shadow-primary-500/20"
                 >
                   Get Started
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
