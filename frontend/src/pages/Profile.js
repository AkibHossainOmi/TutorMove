import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaMapMarkerAlt,
  FaUser,
  FaStar,
  FaUserShield,
  FaPhoneAlt,
  FaInfoCircle,
  FaBriefcase,
  FaUserGraduate,
  FaEdit,
  FaSave,
  FaCamera,
  FaKey,
  FaTasks,
} from 'react-icons/fa';
import { MdVerifiedUser } from 'react-icons/md';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { userApi, whatsappAPI } from '../utils/apiService';
import LoadingSpinner from '../components/LoadingSpinner';
import ProfileImageWithBg from '../components/ProfileImageWithBg';

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
    phone_number: '',
  });
  const [profileFile, setProfileFile] = useState(null);

  // Password states
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState('');

  // OTP states
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const timerRef = useRef(null);

  const navigate = useNavigate();

  const fetchAverageRating = async (tutorId) => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/reviews/${tutorId}/`
      );
      if (!res.ok) throw new Error('Failed to fetch average rating');
      const data = await res.json();
      setAvgRating(data.average_rating);
    } catch {
      setAvgRating(null);
    }
  };

  // ✅ FIX: merge updated fields instead of replacing userData
  const handleProfileUpdate = async () => {
    setUpdateStatus('Updating...');
    try {
      let updatedData = { ...editData };
      const res = await userApi.editProfile(updatedData);
      let updatedUser = res.data;

      if (profileFile) {
        const dpRes = await userApi.uploadDp(profileFile);
        updatedUser.profile_picture = dpRes.data.profile_picture_url;
      }

      setUserData((prev) => ({
        ...prev,
        ...updatedUser,
      }));

      setIsEditing(false);
      setProfileFile(null);
      setUpdateStatus('Profile updated successfully!');
      setTimeout(() => setUpdateStatus(''), 3000);

      if ((updatedUser.user_type || userData?.user_type) === 'tutor') {
        fetchAverageRating(updatedUser.id || userData?.id);
      }
    } catch (err) {
      setUpdateStatus(`Error: ${err.response?.data?.detail || err.message}`);
    }
  };

  const toggleEdit = () => {
    if (isEditing) {
      handleProfileUpdate();
    } else {
      setIsEditing(true);
    }
  };

  const handleEditChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProfileFileChange = (e) => {
    setProfileFile(e.target.files[0]);
  };

  // Password change
  const handlePasswordChange = async () => {
    if (newPassword !== confirmNewPassword) {
      setPasswordStatus('Error: New passwords do not match!');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordStatus('Error: New password must be at least 8 characters long!');
      return;
    }

    setPasswordStatus('Changing password...');
    try {
      await userApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setPasswordStatus('Password updated successfully!');
      setShowPasswordFields(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setPasswordStatus(`Error: ${err.response?.data?.detail || err.message}`);
    }
    setTimeout(() => setPasswordStatus(''), 5000);
  };

  // OTP sending
  const handleSendOTP = async () => {
    setOtpSent(true);
    setOtpTimer(300);
    setUpdateStatus('OTP sending...');

    timerRef.current = setInterval(() => {
      setOtpTimer((prev) => {
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
        setOtpSent(false);
        clearInterval(timerRef.current);
        setOtpTimer(0);
      }
    } catch (err) {
      setUpdateStatus(`Error: ${err.response?.data?.message || err.message}`);
      setOtpSent(false);
      clearInterval(timerRef.current);
      setOtpTimer(0);
    }

    setTimeout(() => setUpdateStatus(''), 5000);
  };

  // OTP verify
  const handleVerifyOTP = async () => {
    setUpdateStatus('Verifying OTP...');
    try {
      const res = await whatsappAPI.verifyOTP(otp);
      if (res.data.status === 'success') {
        setUpdateStatus('Phone number verified!');
        const updatedUser = await userApi.editProfile({
          phone_number: editData.phone_number,
          phone_verified: true,
        });

        setUserData((prev) => ({
          ...prev,
          ...updatedUser.data,
        }));

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
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Initial fetch
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
          phone_number: data.phone_number || '',
        });

        if (data.user_type === 'tutor') fetchAverageRating(data.id);
      } catch (err) {
        console.error(err);
        setError('Failed to load profile. Please log in again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
    return () => clearInterval(timerRef.current);
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex justify-center items-center">
          <LoadingSpinner />
        </div>
        <Footer />
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex justify-center items-center px-4">
          <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Profile Error
            </h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
        <Footer />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-inter">
      <Navbar />

      <main className="flex-grow max-w-4xl mx-auto w-full p-6 mt-20 mb-10">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6 w-full md:w-auto">
            <div className="relative">
              <ProfileImageWithBg imageUrl={userData.profile_picture} size={96} />
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1 rounded-full cursor-pointer hover:bg-indigo-700">
                  <FaCamera />
                  <input type="file" className="hidden" onChange={handleProfileFileChange} />
                </label>
              )}
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-2xl md:text-3xl font-bold">{userData.username}</h1>
              <p className="text-gray-600">{userType.charAt(0).toUpperCase() + userType.slice(1)}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={toggleEdit}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition w-full sm:w-auto ${
                isEditing
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-white text-indigo-700 border border-indigo-700 hover:bg-indigo-50'
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
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-100 flex items-center">
                <FaUser className="text-indigo-500 mr-2" /> Basic Information
              </h2>
              <div className="space-y-4">
                {[
                  {
                    label: 'Username',
                    value: userData.username,
                    icon: <FaUser className="text-gray-500" />,
                    bgColor: 'bg-blue-50',
                  },
                  {
                    label: 'User Type',
                    value: userType.charAt(0).toUpperCase() + userType.slice(1),
                    icon: <MdVerifiedUser className="text-gray-500" />,
                    bgColor: 'bg-indigo-50',
                  },
                  {
                    label: 'Trust Score',
                    value: (userData.trust_score ?? 0).toFixed(1),
                    icon: <FaUserShield className="text-gray-500" />,
                    bgColor: 'bg-purple-50',
                  },
                  ...(userType === 'tutor'
                    ? [
                        
                      ]
                    : []),
                ].map(({ label, value, icon, bgColor }) => (
                  <div
                    key={label}
                    className="flex justify-between items-center p-4 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-3 text-gray-700 font-medium">
                      <span className={`p-2 rounded-full ${bgColor}`}>{icon}</span>
                      {label}
                    </div>
                    <div className="text-gray-900 font-semibold">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tutor Details */}
            {userType === 'tutor' && (
              <div className="bg-white rounded-xl shadow-md p-6 mt-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-100 flex items-center">
                  <FaUserGraduate className="text-indigo-500 mr-2" /> Tutor Details
                </h2>
                <div className="space-y-5">
                  {[
                    {
                      label: 'Education',
                      value: isEditing ? (
                        <input
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          value={editData.education}
                          onChange={(e) => handleEditChange('education', e.target.value)}
                        />
                      ) : (
                        userData.education || 'Not provided'
                      ),
                      icon: <FaUserGraduate className="text-gray-500" />,
                    },
                    {
                      label: 'Experience',
                      value: isEditing ? (
                        <input
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          value={editData.experience}
                          onChange={(e) => handleEditChange('experience', e.target.value)}
                        />
                      ) : (
                        userData.experience || 'Not provided'
                      ),
                      icon: <FaBriefcase className="text-gray-500" />,
                    },
                    {
                      label: 'Phone Number',
                      value: isEditing ? (
                        <input
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          value={editData.phone_number}
                          onChange={(e) => handleEditChange('phone_number', e.target.value)}
                        />
                      ) : (
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
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
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
                                onChange={(e) => setOtp(e.target.value)}
                              />
                              <button
                                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                onClick={handleVerifyOTP}
                                disabled={otpTimer === 0}
                              >
                                Verify
                              </button>
                              {otpTimer > 0 && (
                                <span className="text-sm text-gray-500">{formatTimer(otpTimer)}</span>
                              )}
                            </div>
                          )}
                        </div>
                      ),
                      icon: <FaPhoneAlt className="text-gray-500" />,
                    },
                    {
                      label: 'Location',
                      value: isEditing ? (
                        <input
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          value={editData.location}
                          onChange={(e) => handleEditChange('location', e.target.value)}
                        />
                      ) : (
                        userData.location || 'Not provided'
                      ),
                      icon: <FaMapMarkerAlt className="text-gray-500" />,
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

          {/* Right side */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-100 flex items-center">
                <FaInfoCircle className="text-indigo-500 mr-2" />{' '}
                {userType === 'tutor' ? 'Professional Bio' : 'About Me'}
              </h2>
              <div>
                {isEditing ? (
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 h-40"
                    value={editData.bio}
                    onChange={(e) => handleEditChange('bio', e.target.value)}
                  />
                ) : (
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {userData.bio || `No ${userType === 'tutor' ? 'professional bio' : 'about me'} provided yet.`}
                  </p>
                )}
              </div>
              
            </div>

            {/* Account Actions */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-100 flex items-center">
                <FaKey className="text-indigo-500 mr-2" /> Account Actions
              </h2>
              <div className="space-y-4">
                <button
                  onClick={() => setShowPasswordFields((prev) => !prev)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-between"
                >
                  Change Password <FaKey />
                </button>
                {showPasswordFields && (
                  <div className="space-y-3 mt-3">
                    <input
                      type="password"
                      placeholder="Current Password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      type="password"
                      placeholder="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      type="password"
                      placeholder="Confirm New Password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={handlePasswordChange}
                      className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Update Password
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {updateStatus && (
          <div
            className={`mt-6 p-4 rounded-lg shadow-md text-center ${
              updateStatus.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}
          >
            {updateStatus}
          </div>
        )}
        {passwordStatus && (
          <div
            className={`mt-4 p-4 rounded-lg shadow-md text-center ${
              passwordStatus.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}
          >
            {passwordStatus}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
