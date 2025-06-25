import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { jobAPI, tutorAPI } from '../utils/apiService';
import JobPostForm from '../components/JobPostForm';
import JobCard from '../components/JobCard';
import TutorCard from '../components/TutorCard';
import LoadingSpinner from '../components/LoadingSpinner';
import WelcomeBanner from '../components/WelcomeBanner';
import { useAuth } from '../contexts/UseAuth';
import Navbar from '../components/Navbar';

const StudentDashboard = () => {
  const { t } = useTranslation();
  const isAuthenticated = useAuth();

  const getParsedUser = useCallback(() => {
    try {
      const userString = localStorage.getItem('user');
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      console.error("Failed to parse user from local storage:", error);
      return null;
    }
  }, []);

  const [user, setUser] = useState(getParsedUser());
  const [isJobFormOpen, setIsJobFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Your job "Math Tutor" received a new application!', isRead: false, created_at: new Date() },
    { id: 2, message: 'You have a new message from John Doe.', isRead: false, created_at: new Date() },
    { id: 3, message: 'Your payment for "Science Project Help" has been processed.', isRead: true, created_at: new Date() },
  ]);
  const [unreadCount, setUnreadCount] = useState(2);

  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);


  const [dashboardData, setDashboardData] = useState({
    postedJobs: [],
    applications: [],
    favoriteTeachers: [],
    reviews: [],
    credits: {
      available: 0,
      spent: 0,
      pending: 0
    },
    stats: {
      totalJobs: 0,
      activeJobs: 0,
      completedJobs: 0,
      totalReviews: 0
    }
  });

  const [showBecomeTeacher, setShowBecomeTeacher] = useState(false);
  const [becomeTeacherLoading, setBecomeTeacherLoading] = useState(false);
  const [becomeTeacherError, setBecomeTeacherError] = useState('');

  const [showRequestVerification, setShowRequestVerification] = useState(false);
  const [requestVerificationLoading, setRequestVerificationLoading] = useState(false);
  const [verificationRequested, setVerificationRequested] = useState(user?.verification_requested || false);
  const [isVerified, setIsVerified] = useState(user?.is_verified || false);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentUser = getParsedUser();
      if (!currentUser || !currentUser.id || currentUser.user_type !== 'student') {
        console.warn('User data not found, invalid, or not a student. Skipping dashboard data fetch.');
        setDashboardData({
          postedJobs: [],
          applications: [],
          favoriteTeachers: [],
          reviews: [],
          credits: { available: 0, spent: 0, pending: 0 },
          stats: { totalJobs: 0, activeJobs: 0, completedJobs: 0, totalReviews: 0 }
        });
        setIsLoading(false);
        return;
      }

      const jobsResponse = await jobAPI.getJobs({ user: currentUser.id });
      const applicationsResponse = await jobAPI.getMyApplications();
      const favoritesResponse = await tutorAPI.getFavoriteTutors();

      setDashboardData({
        postedJobs: jobsResponse.data.results || [],
        applications: applicationsResponse.data.results || [],
        favoriteTeachers: favoritesResponse.data.results || [],
        reviews: [],
        credits: {
          available: 2500,
          spent: 1800,
          pending: 300
        },
        stats: {
          totalJobs: jobsResponse.data.results?.length || 0,
          activeJobs: jobsResponse.data.results?.filter(job => job.status === 'active').length || 0,
          completedJobs: jobsResponse.data.results?.filter(job => job.status === 'completed').length || 0,
          totalReviews: 12
        }
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  }, [getParsedUser]);
  const creditAPI = {
  /**
   * Fetches the credit balance for a given user ID.
   * @param {string} userId - The ID of the user.
   * @returns {Promise<Object>} A promise resolving to the credit balance data { user_id: number, balance: number }.
   * @throws {Error} If there's an error fetching the credit balance.
   */
  getUserCredits: async (userId) => {
    try {
      // Assuming a mock for now if credit endpoint is not fully implemented
      // In a real scenario, replace this with your actual API call:
      const response = await axios.get(`http://localhost:8000/api/credit/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user credits:", error.response?.data || error.message);
      // For demonstration, return a mock balance if API fails
      // In production, you might want to throw or handle more explicitly
      return { user_id: userId, balance: 0 }; // Return 0 credits on error
    }
  }
};

  useEffect(() => {
    const updateUserAndLoadData = () => {
      const updatedUser = getParsedUser();
      setUser(updatedUser);
      setVerificationRequested(updatedUser?.verification_requested || false);
      setIsVerified(updatedUser?.is_verified || false);

      if (isAuthenticated && updatedUser?.user_type === 'student') {
        loadDashboardData();
      } else {
        setIsLoading(false);
        setDashboardData({
          postedJobs: [],
          applications: [],
          favoriteTeachers: [],
          reviews: [],
          credits: { available: 0, spent: 0, pending: 0 },
          stats: { totalJobs: 0, activeJobs: 0, completedJobs: 0, totalReviews: 0 }
        });
      }
    };

    updateUserAndLoadData();

    window.addEventListener('storage', updateUserAndLoadData);

    return () => {
      window.removeEventListener('storage', updateUserAndLoadData);
    };
  }, [isAuthenticated, getParsedUser, loadDashboardData]);


  const handleJobCreated = (newJob) => {
    setDashboardData(prev => ({
      ...prev,
      postedJobs: [newJob, ...prev.postedJobs],
      stats: {
        ...prev.stats,
        totalJobs: prev.stats.totalJobs + 1,
        activeJobs: prev.stats.activeJobs + 1
      }
    }));
    setIsJobFormOpen(false);
  };

  const handlePostJobClick = () => {
    if (dashboardData.credits.available <= 0) {
      setShowInsufficientCreditsModal(true);
    } else {
      setIsJobFormOpen(true);
    }
  };

  const handleNavigateToBuyCredits = () => {
    window.location.href = '/buy-credits';
  };

  const handleBecomeTeacher = async () => {
    setBecomeTeacherLoading(true);
    setBecomeTeacherError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("Authentication token not found.");
      }
      const response = await fetch('/api/users/become_teacher/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to upgrade to teacher role.');
      }

      const updatedUserResponse = await fetch('/api/users/me/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (updatedUserResponse.ok) {
        const updatedUserData = await updatedUserResponse.json();
        localStorage.setItem('user', JSON.stringify(updatedUserData));
        setUser(updatedUserData);
        setVerificationRequested(updatedUserData.verification_requested || false);
        setIsVerified(updatedUserData.is_verified || false);
      }

      setShowBecomeTeacher(false);
      console.log('Successfully upgraded to teacher!');
      window.location.href = '/dashboard';
    } catch (err) {
      setBecomeTeacherError(err.message || 'Failed to upgrade. Please try again.');
      console.error('Failed to upgrade to teacher:', err);
    } finally {
      setBecomeTeacherLoading(false);
    }
  };

  const handleRequestVerification = async () => {
    setRequestVerificationLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("Authentication token not found.");
      }
      const response = await fetch('/api/users/request_verification/', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Could not send verification request.');
      }

      const updatedUserResponse = await fetch('/api/users/me/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (updatedUserResponse.ok) {
        const updatedUserData = await updatedUserResponse.json();
        localStorage.setItem('user', JSON.stringify(updatedUserData));
        setUser(updatedUserData);
        setVerificationRequested(updatedUserData.verification_requested || false);
        setIsVerified(updatedUserData.is_verified || false);
      }

      setVerificationRequested(true);
      setShowRequestVerification(false);
      console.log('Verification request submitted.');
    } catch (err) {
      console.error('Could not send verification request:', err);
    } finally {
      setRequestVerificationLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: '15px'
    }}>
      <div style={{
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        backgroundColor: `${color}20`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        color: color
      }}>
        {icon}
      </div>
      <div>
        <h3 style={{ margin: '0', color: '#495057' }}>{value}</h3>
        <p style={{ margin: '5px 0 0', color: '#6c757d' }}>{title}</p>
      </div>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <>
        <Navbar />
        <div style={{ height: '100px' }}></div>
        <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2>Access Denied</h2>
          <p>Please log in to view your dashboard.</p>
          <button
            onClick={() => window.location.href = '/login'}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Go to Login
          </button>
        </div>
      </>
    );
  }

  if (!user || user.user_type !== 'student') {
    return (
      <>
        <Navbar />
        <div style={{ height: '100px' }}></div>
        <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2>Access Denied</h2>
          <p>You must be a **student** to access this dashboard. Your current role is: **{user?.user_type || 'Unknown'}**</p>
          {user?.user_type === 'teacher' && (
            <p>Please navigate to the **Teacher Dashboard**.</p>
          )}
          <button
            onClick={() => window.location.href = '/'}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '15px'
            }}
          >
            Go to Home
          </button>
        </div>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div style={{ height: '100px' }}></div>
        <LoadingSpinner />
      </>
    );
  }

  return (
    <div>
      <Navbar />
      <div style={{ height: '100px' }}></div>
      <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
        <WelcomeBanner />

        {showBecomeTeacher && (
          <div style={{
            position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.25)', zIndex: 10000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{
              background: 'white', borderRadius: 8, padding: 36, minWidth: 340, textAlign: 'center'
            }}>
              <h3>Become a Teacher</h3>
              <p>Are you sure you want to become a teacher? You’ll be able to create gigs and apply for jobs as a tutor.</p>
              <button
                style={{ background: '#28a745', color: 'white', borderRadius: 4, padding: '8px 22px', border: 'none', fontWeight: 500, marginRight: 8 }}
                onClick={handleBecomeTeacher}
                disabled={becomeTeacherLoading}
              >
                {becomeTeacherLoading ? 'Upgrading...' : 'Yes, Become Teacher'}
              </button>
              <button
                style={{ background: '#6c757d', color: 'white', borderRadius: 4, padding: '8px 22px', border: 'none', fontWeight: 500 }}
                onClick={() => setShowBecomeTeacher(false)}
              >
                Cancel
              </button>
              {becomeTeacherError && <div style={{ color: 'red', marginTop: 10 }}>{becomeTeacherError}</div>}
            </div>
          </div>
        )}
        {showRequestVerification && (
          <div style={{
            position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.25)', zIndex: 10000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{
              background: 'white', borderRadius: 8, padding: 36, minWidth: 340, textAlign: 'center'
            }}>
              <h3>Request Verification</h3>
              <p>Submit a verification request to be reviewed by our admins. Verified teachers are prioritized in search and gain a trust badge.</p>
              <button
                style={{ background: '#007bff', color: 'white', borderRadius: 4, padding: '8px 22px', border: 'none', fontWeight: 500, marginRight: 8 }}
                onClick={handleRequestVerification}
                disabled={requestVerificationLoading}
              >
                {requestVerificationLoading ? 'Submitting...' : 'Submit Request'}
              </button>
              <button
                style={{ background: '#6c757d', color: 'white', borderRadius: 4, padding: '8px 22px', border: 'none', fontWeight: 500 }}
                onClick={() => setShowRequestVerification(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <h1 style={{ margin: 0, color: '#212529' }}>
            Student Dashboard - Welcome, {user?.username || 'Guest'}!
          </h1>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                style={{
                  padding: '10px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                🔔 Notifications
                {notifications?.filter(n => !n.isRead).length > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {notifications.filter(n => !n.isRead).length}
                  </span>
                )}
              </button>
              {showNotificationsDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  backgroundColor: 'white',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  width: '300px',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  zIndex: 1000
                }}>
                  <div style={{ padding: '15px', borderBottom: '1px solid #dee2e6' }}>
                    <h4 style={{ margin: 0 }}>Notifications</h4>
                  </div>
                  {notifications?.length > 0 ? (
                    notifications.slice(0, 5).map(notification => (
                      <div key={notification.id} style={{
                        padding: '10px 15px',
                        borderBottom: '1px solid #f8f9fa',
                        backgroundColor: notification.isRead ? 'white' : '#f8f9fa'
                      }}>
                        <p style={{ margin: 0, fontSize: '14px' }}>{notification.message}</p>
                        <small style={{ color: '#6c757d' }}>
                          {new Date(notification.created_at).toLocaleDateString()}
                        </small>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '15px', textAlign: 'center', color: '#6c757d' }}>
                      No notifications
                    </div>
                  )}
                  <div style={{ padding: '10px 15px', textAlign: 'center' }}>
                    <button
                      onClick={() => window.location.href = '/messages'}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      View All
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => window.location.href = '/messages'}
              style={{
                padding: '10px',
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              💬 Messages
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={handlePostJobClick}
              style={{
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Post a Job
            </button>
            <button
              onClick={handleNavigateToBuyCredits}
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Buy Credits
            </button>

            {user?.user_type === 'student' && (
              <button
                onClick={() => setShowBecomeTeacher(true)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#fd7e14',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Become a Teacher
              </button>
            )}
            {user?.user_type === 'teacher' && !isVerified && !verificationRequested && (
              <button
                onClick={() => setShowRequestVerification(true)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6f42c1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Request Verification
              </button>
            )}
            {verificationRequested && !isVerified && (
              <span style={{ color: '#6f42c1', marginLeft: '12px' }}>
                <b>Verification requested.</b>
              </span>
            )}
            {isVerified && (
              <span style={{ color: '#28a745', marginLeft: '12px' }}>
                <b>Verified Teacher ✔️</b>
              </span>
            )}
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <StatCard
            title="Available Credits"
            value={`${dashboardData.credits.available} Credits`}
            icon="💳"
            color="#28a745"
          />
          <StatCard
            title="Active Jobs"
            value={dashboardData.stats.activeJobs}
            icon="📋"
            color="#007bff"
          />
          <StatCard
            title="Completed Jobs"
            value={dashboardData.stats.completedJobs}
            icon="✅"
            color="#fd7e14"
          />
          <StatCard
            title="Reviews Given"
            value={dashboardData.stats.totalReviews}
            icon="⭐"
            color="#6f42c1"
          />
        </div>

        <div style={{
          borderBottom: '1px solid #dee2e6',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', gap: '20px' }}>
            {['overview', 'findTutors', 'jobs', 'wallet', 'reviews', 'settings'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderBottom: activeTab === tab ? '2px solid #007bff' : 'none',
                  backgroundColor: 'transparent',
                  color: activeTab === tab ? '#007bff' : '#6c757d',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: activeTab === tab ? '500' : 'normal'
                }}
              >
                {tab === 'findTutors' ? 'Find Tutors' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          {activeTab === 'overview' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              <div>
                <h3>My Recent Jobs</h3>
                {dashboardData.postedJobs.slice(0, 3).map(job => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
              <div>
                <h3>Favorite Teachers</h3>
                {dashboardData.favoriteTeachers.slice(0, 3).map(teacher => (
                  <TutorCard key={teacher.id} tutor={teacher} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'findTutors' && (
            <div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                marginBottom: '30px'
              }}>
                <button
                  onClick={() => window.location.href = '/tutors'}
                  style={{
                    padding: '20px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  All Teachers
                </button>
                <button
                  onClick={() => window.location.href = '/tutors?type=online'}
                  style={{
                    padding: '20px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  Online Teachers
                </button>
                <button
                  onClick={() => window.location.href = '/tutors?type=home'}
                  style={{
                    padding: '20px',
                    backgroundColor: '#fd7e14',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  Home Tutors
                </button>
                <button
                  onClick={() => window.location.href = '/tutors?service=assignment'}
                  style={{
                    padding: '20px',
                    backgroundColor: '#6f42c1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  Assignment Help
                </button>
              </div>
            </div>
          )}

          {activeTab === 'jobs' && (
            <div style={{ display: 'grid', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>My Posted Jobs</h3>
                <button
                  onClick={handlePostJobClick}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Post New Job
                </button>
              </div>
              {dashboardData.postedJobs.map(job => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}

          {activeTab === 'wallet' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <h3>Credit Wallet</h3>
                <p>Available Credits: {dashboardData.credits.available}</p>
                <p>Spent: {dashboardData.credits.spent}</p>
                <p>Pending: {dashboardData.credits.pending}</p>
                <button
                  onClick={handleNavigateToBuyCredits}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginTop: '10px'
                  }}
                >
                  Buy Credits
                </button>
              </div>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <h3>Payments</h3>
                <p>Account getting paid</p>
                <p>Payment history</p>
                <button
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginTop: '10px'
                  }}
                >
                  View Payment History
                </button>
              </div>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <h3>Refer & Earn</h3>
                <p>Invite friends to get free credits</p>
                <button
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginTop: '10px'
                  }}
                >
                  Invite Friends
                </button>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '20px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3>Reviews Given to Teachers</h3>
              <p>Ability to review after payment</p>
              <div style={{ marginTop: '20px' }}>
                {dashboardData.reviews.length > 0 ? (
                  dashboardData.reviews.map(review => (
                    <div key={review.id} style={{
                      borderBottom: '1px solid #dee2e6',
                      padding: '15px 0'
                    }}>
                      <h4>{review.teacher_name}</h4>
                      <p>Rating: {review.rating}/5</p>
                      <p>{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <p>No reviews given yet. Complete a job to leave a review!</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <h3>Account Settings</h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  <li style={{ marginBottom: '10px' }}>
                    <label>
                      <input type="checkbox" defaultChecked /> Change email/phone
                    </label>
                  </li>
                  <li style={{ marginBottom: '10px' }}>
                    <label>
                      <input type="checkbox" defaultChecked /> Password change
                    </label>
                  </li>
                  <li style={{ marginBottom: '10px' }}>
                    <label>
                      <input type="checkbox" defaultChecked /> Payment receiving settings
                    </label>
                  </li>
                  <li style={{ marginBottom: '10px' }}>
                    <label>
                      <input type="checkbox" defaultChecked /> Search engine visibility toggle
                    </label>
                  </li>
                  <li style={{ marginBottom: '10px' }}>
                    <label>
                      <input type="checkbox" defaultChecked /> Profile deactivation & deletion
                    </label>
                  </li>
                </ul>
                <button
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Manage Settings
                </button>
              </div>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <h3>Notification Settings</h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  <li style={{ marginBottom: '10px' }}>
                    <label>
                      <input type="checkbox" defaultChecked /> Job notification settings
                    </label>
                  </li>
                  <li style={{ marginBottom: '10px' }}>
                    <label>
                      <input type="checkbox" defaultChecked /> Email notifications
                    </label>
                  </li>
                  <li style={{ marginBottom: '10px' }}>
                    <label>
                      <input type="checkbox" defaultChecked /> SMS notifications
                    </label>
                  </li>
                  <li style={{ marginBottom: '10px' }}>
                    <label>
                      <input type="checkbox" defaultChecked /> Push notifications
                    </label>
                  </li>
                </ul>
                <button
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Save Preferences
                </button>
              </div>
            </div>
          )}
        </div>

        {isJobFormOpen && (
          <JobPostForm
            onClose={() => {
              setIsJobFormOpen(false);
            }}
            onJobCreated={handleJobCreated}
          />
        )}

        {showInsufficientCreditsModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '8px',
              boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
              textAlign: 'center',
              maxWidth: '400px',
              width: '90%'
            }}>
              <h3 style={{ color: '#dc3545', marginBottom: '15px' }}>Insufficient Credits</h3>
              <p style={{ marginBottom: '25px', fontSize: '1.1em' }}>
                You do not have enough credits to create a job post. Please buy more credits to proceed.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                <button
                  onClick={() => {
                    setShowInsufficientCreditsModal(false);
                    handleNavigateToBuyCredits();
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '1em',
                    fontWeight: '500',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    transition: 'background-color 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#218838'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#28a745'}
                >
                  💳 Buy Credits
                </button>
                <button
                  onClick={() => setShowInsufficientCreditsModal(false)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '1em',
                    fontWeight: '500',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    transition: 'background-color 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5a6268'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
