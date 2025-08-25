import React, { useState, useEffect, useRef } from 'react';
import { FaMapMarkerAlt, FaUser, FaStar, FaUserShield, FaPhoneAlt, FaInfoCircle, FaBriefcase, FaUserGraduate, FaEdit, FaSave } from 'react-icons/fa';
import { MdVerifiedUser } from 'react-icons/md';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { userApi, whatsappAPI } from '../utils/apiService';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [userType, setUserType] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateStatus, setUpdateStatus] = useState('');
  const [avgRating, setAvgRating] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    bio: '',
    education: '',
    experience: '',
    location: '',
    phone_number: ''
  });

  // OTP states
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const timerRef = useRef(null);

  const fetchAverageRating = async (tutorId) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/reviews/${tutorId}/`);
      if (!res.ok) throw new Error('Failed to fetch average rating');
      const data = await res.json();
      setAvgRating(data.average_rating);
    } catch {
      setAvgRating(null);
    }
  };

  const handleProfileUpdate = async () => {
    setUpdateStatus('Updating...');
    try {
      const res = await userApi.editProfile(editData);
      const updated = res.data;
      setUserData(updated);
      setIsEditing(false);
      setUpdateStatus('Profile updated successfully!');
      setTimeout(() => setUpdateStatus(''), 3000);

      if (updated.user_type === 'tutor') fetchAverageRating(updated.id);
    } catch (err) {
      setUpdateStatus(`Error: ${err.response?.data?.detail || err.message}`);
    }
  };

  const toggleEdit = () => {
    if (isEditing) handleProfileUpdate();
    else setIsEditing(true);
  };

  const handleEditChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  // OTP functions
  const handleSendOTP = async () => {
    // Show OTP input immediately
    setOtpSent(true);
    setOtpTimer(300); // 5 minutes
    setUpdateStatus('OTP sending...');

    // Start timer immediately
    timerRef.current = setInterval(() => {
      setOtpTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    try {
      const res = await whatsappAPI.sendOTP(editData.phone_number);
      if (res.data.status === 'success') {
        setUpdateStatus('OTP sent! Please enter the code.');
      } else {
        setUpdateStatus(`Failed: ${res.data.message}`);
        setOtpSent(false); // hide input if failed
        clearInterval(timerRef.current);
        setOtpTimer(0);
      }
    } catch (err) {
      setUpdateStatus(`Error: ${err.response?.data?.message || err.message}`);
      setOtpSent(false); // hide input if error
      clearInterval(timerRef.current);
      setOtpTimer(0);
    }

    setTimeout(() => setUpdateStatus(''), 5000);
  };

  const handleVerifyOTP = async () => {
    try {
      const res = await whatsappAPI.verifyOTP(otp);
      if (res.data.status === 'success') {
        setUpdateStatus('Phone number verified!');
        setUserData(prev => ({ ...prev, phone_verified: true }));
        setOtpSent(false);
        setOtp('');
        clearInterval(timerRef.current);
        setOtpTimer(0);
      } else {
        setUpdateStatus(`Verification failed: ${res.data.message}`);
      }
    } catch (err) {
      setUpdateStatus(`Error: ${err.response?.data?.message || err.message}`);
    }
    setTimeout(() => setUpdateStatus(''), 5000);
  };

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await userApi.getUser();
        const data = res.data;
        setUserData(data);
        setUserType(data.user_type || '');
        setEditData({
          bio: data.bio || '',
          education: data.education || '',
          experience: data.experience || '',
          location: data.location || '',
          phone_number: data.phone_number || ''
        });

        if (data.user_type === 'tutor') fetchAverageRating(data.id);
      } catch (err) {
        console.error(err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
    return () => clearInterval(timerRef.current);
  }, []);

  if (loading) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow flex justify-center items-center">
        <LoadingSpinner />
      </div>
      <Footer />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow flex justify-center items-center px-4">
        <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-4xl mx-auto w-full p-6 mt-20 mb-10">
        {/* Profile Header Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Your Profile</h1>
                <p className="text-blue-100 mt-1">Manage your account information and preferences</p>
              </div>

              {(userType === 'tutor' || userType === 'student') && (
                <button
                  onClick={toggleEdit}
                  className={`mt-4 sm:mt-0 flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition ${
                    isEditing 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'bg-white text-indigo-700 hover:bg-gray-100'
                  }`}
                >
                  {isEditing ? (
                    <>
                      <FaSave className="text-sm" /> Save Changes
                    </>
                  ) : (
                    <>
                      <FaEdit className="text-sm" /> Edit Profile
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basic Information Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-100 flex items-center">
                <FaUser className="text-indigo-500 mr-2" />
                Basic Information
              </h2>

              <div className="space-y-4">
                {[
                  { 
                    label: 'Username', 
                    value: userData.username, 
                    icon: <FaUser className="text-gray-500" />,
                    bgColor: 'bg-blue-50'
                  },
                  {
                    label: 'User Type',
                    value: userType.charAt(0).toUpperCase() + userType.slice(1),
                    icon: <MdVerifiedUser className="text-gray-500" />,
                    bgColor: 'bg-indigo-50'
                  },
                  { 
                    label: 'Trust Score', 
                    value: (userData.trust_score ?? 0).toFixed(1), 
                    icon: <FaUserShield className="text-gray-500" />,
                    bgColor: 'bg-purple-50'
                  },
                  ...(userType === 'tutor' ? [{
                    label: 'Overall Rating',
                    value: avgRating ? `${avgRating.toFixed(1)}/5.0` : 'No reviews yet',
                    icon: <FaStar className="text-gray-500" />,
                    bgColor: 'bg-amber-50'
                  }] : [])
                ].map(({ label, value, icon, bgColor }) => (
                  <div key={label} className="flex justify-between items-center p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3 text-gray-700 font-medium">
                      <span className={`p-2 rounded-full ${bgColor}`}>{icon}</span>
                      {label}
                    </div>
                    <div className="text-gray-900 font-semibold">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Tutor Information */}
            {userType === 'tutor' && (
              <div className="bg-white rounded-xl shadow-md p-6 mt-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-100 flex items-center">
                  <FaUserGraduate className="text-indigo-500 mr-2" />
                  Tutor Details
                </h2>

                <div className="space-y-5">
                  {[
                    { 
                      label: 'Education', 
                      value: isEditing ? (
                        <input
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                          value={editData.education}
                          onChange={(e) => handleEditChange('education', e.target.value)}
                          placeholder="Enter your education"
                        />
                      ) : userData.education || 'Not provided', 
                      icon: <FaUserGraduate className="text-gray-500" />
                    },
                    { 
                      label: 'Experience', 
                      value: isEditing ? (
                        <input
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                          value={editData.experience}
                          onChange={(e) => handleEditChange('experience', e.target.value)}
                          placeholder="Enter your experience"
                        />
                      ) : userData.experience || 'Not provided', 
                      icon: <FaBriefcase className="text-gray-500" />
                    },
                    {
                      label: 'Phone Number',
                      value: isEditing ? (
                        // Editing mode: simple input to change phone number
                        <input
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                          placeholder="Enter your phone number"
                          value={editData.phone_number}
                          onChange={e => handleEditChange('phone_number', e.target.value)}
                        />
                      ) : (
                        // Non-editing mode: show phone number + OTP send/verify
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <span>{userData.phone_number || 'Not provided'}</span>
                            {userData.phone_verified && (
                              <span className="text-green-600 flex items-center gap-1">
                                Verified <MdVerifiedUser />
                              </span>
                            )}
                          </div>

                          {!userData.phone_verified && !otpSent && userData.phone_number && (
                            <button
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                              onClick={handleSendOTP}
                            >
                              Verify
                            </button>
                          )}

                          {otpSent && (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                className="border rounded-lg px-2 py-1 w-24"
                                placeholder="Enter OTP"
                                value={otp}
                                onChange={e => setOtp(e.target.value)}
                              />
                              <button
                                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                onClick={handleVerifyOTP}
                                disabled={otpTimer === 0}
                              >
                                Verify
                              </button>
                              {otpTimer > 0 && <span className="text-sm text-gray-500">{formatTimer(otpTimer)}</span>}
                            </div>
                          )}
                        </div>
                      ),
                      icon: <FaPhoneAlt className="text-gray-500" />
                    },
                    { 
                      label: 'Location', 
                      value: isEditing ? (
                        <input
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                          value={editData.location}
                          onChange={(e) => handleEditChange('location', e.target.value)}
                          placeholder="Enter your location"
                        />
                      ) : userData.location || 'Not provided', 
                      icon: <FaMapMarkerAlt className="text-gray-500" />
                    },
                  ].map(({ label, value, icon }) => (
                    <div key={label}>
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                        {icon} {label}
                      </div>
                      <div className="text-gray-900">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bio/Status Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 h-full">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-100 flex items-center">
                <FaInfoCircle className="text-indigo-500 mr-2" />
                {userType === 'tutor' ? 'Professional Bio' : 'About Me'}
              </h2>

              <div>
                {isEditing ? (
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition h-40"
                    value={editData.bio}
                    onChange={(e) => handleEditChange('bio', e.target.value)}
                    placeholder={`Tell us about yourself${userType === 'tutor' ? ' and your teaching approach' : ''}...`}
                  />
                ) : (
                  <p className="text-gray-700 leading-relaxed">
                    {userData.bio || `No ${userType === 'tutor' ? 'professional bio' : 'about me'} provided yet.`}
                  </p>
                )}
              </div>

              {userType === 'tutor' && avgRating !== null && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-center">
                    <div className="text-3xl font-bold text-amber-600">{avgRating.toFixed(1)}</div>
                    <div className="ml-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <FaStar 
                            key={i} 
                            className={i < Math.round(avgRating) ? "text-amber-400" : "text-gray-300"} 
                            size={16} 
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Average rating</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Update Status Notification */}
        {updateStatus && (
          <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg font-medium transition ${
            updateStatus.includes('Error') 
              ? 'bg-red-100 text-red-700 border-l-4 border-red-500' 
              : 'bg-green-100 text-green-700 border-l-4 border-green-500'
          }`}>
            {updateStatus}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
