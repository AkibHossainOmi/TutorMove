import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTutorsDropdownOpen, setIsTutorsDropdownOpen] = useState(false);
  const [isJobsDropdownOpen, setIsJobsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { unreadCount } = useChat();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleRequestTutor = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  return (
    <nav style={{
      backgroundColor: '#fff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      padding: '0 20px',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '70px'
      }}>
        {/* Logo */}
        <Link to="/" style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#007bff',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          TutorMove
        </Link>

        {/* Desktop Navigation */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '30px'
        }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            {/* Find Tutors Dropdown */}
            <div 
              style={{ position: 'relative' }}
              onMouseEnter={() => setIsTutorsDropdownOpen(true)}
              onMouseLeave={() => setIsTutorsDropdownOpen(false)}
            >
              <span style={{
                color: '#495057',
                textDecoration: 'none',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}>
                {t('navigation.findTutors', 'Find Tutors')} ▼
              </span>
              
              {isTutorsDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: '0',
                  backgroundColor: 'white',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  minWidth: '200px',
                  zIndex: 1001
                }}> 
                  <Link to="/tutors" style={{
                    display: 'block',
                    padding: '12px 16px',
                    color: '#495057',
                    textDecoration: 'none',
                    borderBottom: '1px solid #f8f9fa'
                  }}>
                    {t('navigation.allTutors', 'All Tutors')}
                  </Link>
                  <Link to="/tutors?type=online" style={{
                    display: 'block',
                    padding: '12px 16px',
                    color: '#495057',
                    textDecoration: 'none',
                    borderBottom: '1px solid #f8f9fa'
                  }}>
                    {t('navigation.onlineTutors', 'Online Tutors')}
                  </Link>
                  <Link to="/tutors?type=home" style={{
                    display: 'block',
                    padding: '12px 16px',
                    color: '#495057',
                    textDecoration: 'none'
                  }}>
                    {t('navigation.homeTutors', 'Home Tutors')}
                  </Link>
                </div>
              )}
            </div>

            {/* Find Jobs Dropdown */}
            <div 
              style={{ position: 'relative' }}
              onMouseEnter={() => setIsJobsDropdownOpen(true)}
              onMouseLeave={() => setIsJobsDropdownOpen(false)}
            >
              <span style={{
                color: '#495057',
                textDecoration: 'none',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}>
                {t('navigation.findJobs', 'Find Jobs')} ▼
              </span>
              
              {isJobsDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: '0',
                  backgroundColor: 'white',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  minWidth: '200px',
                  zIndex: 1001
                }}>
                  <Link to="/jobs" style={{
                    display: 'block',
                    padding: '12px 16px',
                    color: '#495057',
                    textDecoration: 'none',
                    borderBottom: '1px solid #f8f9fa'
                  }}>
                    {t('navigation.teachingJobs', 'Teaching Jobs')}
                  </Link>
                  <Link to="/jobs?type=online" style={{
                    display: 'block',
                    padding: '12px 16px',
                    color: '#495057',
                    textDecoration: 'none',
                    borderBottom: '1px solid #f8f9fa'
                  }}>
                    {t('navigation.onlineTeaching', 'Online Teaching')}
                  </Link>
                  <Link to="/jobs?type=assignment" style={{
                    display: 'block',
                    padding: '12px 16px',
                    color: '#495057',
                    textDecoration: 'none'
                  }}>
                    {t('navigation.assignmentJobs', 'Assignment Jobs')}
                  </Link>
                </div>
              )}
            </div>

            <Link to="/assignment-help" style={{
              color: '#495057',
              textDecoration: 'none',
              fontWeight: '500'
            }}>
              {t('navigation.assignmentHelp', 'Assignment Help')}
            </Link>
          </div>

          {/* Auth Buttons */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <LanguageSwitcher />

            {user ? (
              <>
                <Link to="/dashboard" style={{
                  color: '#495057',
                  textDecoration: 'none',
                  fontWeight: '500'
                }}>
                  {t('navigation.dashboard', 'Dashboard')}
                </Link>
                <Link to="/messages" style={{
                  color: '#495057',
                  textDecoration: 'none',
                  fontWeight: '500',
                  position: 'relative'
                }}>
                  {t('navigation.messages', 'Messages')}
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                <span style={{ color: '#6c757d' }}>
                  {t('dashboard.welcome', 'Welcome')}, {user.username}
                </span>
                <button
                  onClick={handleLogout}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {t('navigation.logout', 'Logout')}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleLogin}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'transparent',
                    color: '#007bff',
                    border: '1px solid #007bff',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {t('navigation.login', 'Login')}
                </button>
                <button 
                  onClick={handleRequestTutor}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {t('navigation.requestTutor', 'Request a Tutor')}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{
            display: 'none',
            '@media (maxWidth: 768px)': {
              display: 'block'
            },
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer'
          }}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div style={{
          display: 'block',
          '@media (minWidth: 769px)': {
            display: 'none'
          },
          backgroundColor: '#fff',
          borderTop: '1px solid #dee2e6',
          padding: '20px'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
          }}>
            <Link to="/tutors" style={{
              color: '#495057',
              textDecoration: 'none',
              fontWeight: '500'
            }}>
              {t('navigation.findTutors', 'Find Tutors')}
            </Link>
            <Link to="/jobs" style={{
              color: '#495057',
              textDecoration: 'none',
              fontWeight: '500'
            }}>
              {t('navigation.findJobs', 'Find Jobs')}
            </Link>
            <Link to="/assignment-help" style={{
              color: '#495057',
              textDecoration: 'none',
              fontWeight: '500'
            }}>
              {t('navigation.assignmentHelp', 'Assignment Help')}
            </Link>
            
            <div style={{ marginTop: '10px' }}>
              <LanguageSwitcher />
            </div>
            
            {user ? (
              <>
                <Link to="/dashboard" style={{
                  color: '#495057',
                  textDecoration: 'none',
                  fontWeight: '500'
                }}>
                  {t('navigation.dashboard', 'Dashboard')}
                </Link>
                <Link to="/messages" style={{
                  color: '#495057',
                  textDecoration: 'none',
                  fontWeight: '500'
                }}>
                  {t('navigation.messages', 'Messages')}
                  {unreadCount > 0 && ` (${unreadCount})`}
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    alignSelf: 'flex-start'
                  }}
                >
                  {t('navigation.logout', 'Logout')}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleLogin}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'transparent',
                    color: '#007bff',
                    border: '1px solid #007bff',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    alignSelf: 'flex-start'
                  }}
                >
                  {t('navigation.login', 'Login')}
                </button>
                <button 
                  onClick={handleRequestTutor}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {t('navigation.requestTutor', 'Request a Tutor')}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
