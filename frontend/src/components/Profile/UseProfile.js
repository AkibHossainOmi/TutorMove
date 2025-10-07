import { useState, useEffect, useRef } from 'react';
import { userApi, whatsappAPI } from '../../utils/apiService';

export const useProfile = () => {
  const [userData, setUserData] = useState(null);
  const [userType, setUserType] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateStatus, setUpdateStatus] = useState({ message: '', type: '' });
  const [passwordStatus, setPasswordStatus] = useState({ message: '', type: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [profileFile, setProfileFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null); // live preview
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [avgRating, setAvgRating] = useState(null);
  const timerRef = useRef(null);

  // Fetch user profile
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
          phone_number: data.phone_number || null,
        });
        setPreviewImage(data.profile_picture); // initial preview

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

  // Average rating
  const fetchAverageRating = async (tutorId) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/reviews/${tutorId}/`);
      if (!res.ok) throw new Error('Failed to fetch rating');
      const data = await res.json();
      setAvgRating(data.average_rating);
    } catch {
      setAvgRating(null);
    }
  };

  // Edit field change
  const handleEditChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  // Profile picture live preview
  const handleProfileFileChange = (file) => {
    setProfileFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  // Profile update
  const handleProfileUpdate = async () => {
    setUpdateStatus({ message: 'Updating...', type: 'info' });
    try {
      const updatedData = { ...editData };
      const res = await userApi.editProfile(updatedData);
      let updatedUser = res.data;
      updatedUser.user_id = updatedUser.id;
      localStorage.setItem("user", JSON.stringify(updatedUser));
      if (profileFile) {
        const dpRes = await userApi.uploadDp(profileFile);
        updatedUser.profile_picture = dpRes.data.profile_picture_url;
      }

      setUserData(prev => ({ ...prev, ...updatedUser }));
      setIsEditing(false);
      setProfileFile(null);
      setPreviewImage(updatedUser.profile_picture);
      setUpdateStatus({ message: 'Profile updated successfully!', type: 'success' });

      if ((updatedUser.user_type || userData?.user_type) === 'tutor') {
        fetchAverageRating(updatedUser.id || userData?.id);
      }
    } catch (err) {
      setUpdateStatus({
        message: err.response?.data?.phone_number || err.message,
        type: 'error',
      });
    }
    setTimeout(() => setUpdateStatus({ message: '', type: '' }), 3000);
  };

  const toggleEdit = () => {
    if (isEditing) handleProfileUpdate();
    else setIsEditing(true);
  };

  // Password change
  const handlePasswordChange = async () => {
    if (newPassword !== confirmNewPassword) {
      setPasswordStatus({ message: 'New passwords do not match', type: 'error' });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordStatus({ message: 'Password must be at least 8 chars', type: 'error' });
      return;
    }

    setPasswordStatus({ message: 'Changing password...', type: 'info' });
    try {
      const res = await userApi.changePassword({
        old_password: currentPassword,
        new_password: newPassword,
      });
      setPasswordStatus({ message: res.data.detail || 'Password updated!', type: 'success' });
      setShowPasswordFields(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setPasswordStatus({
        message: err.response?.data?.detail || err.response?.data?.error || err.message,
        type: 'error',
      });
    }
    setTimeout(() => setPasswordStatus({ message: '', type: '' }), 5000);
  };

  // OTP send
  const handleSendOTP = async () => {
    setOtpSent(true);
    setOtpTimer(300);
    setUpdateStatus({ message: 'OTP sending...', type: 'info' });

    timerRef.current = setInterval(() => {
      setOtpTimer(prev => (prev <= 1 ? (clearInterval(timerRef.current), 0) : prev - 1));
    }, 1000);

    try {
      const res = await whatsappAPI.sendOTP(editData.phone_number);
      if (res.data.status === 'success') {
        setUpdateStatus({ message: 'OTP sent!', type: 'success' });
      } else {
        setUpdateStatus({ message: res.data.message, type: 'error' });
        setOtpSent(false);
        clearInterval(timerRef.current);
        setOtpTimer(0);
      }
    } catch (err) {
      setUpdateStatus({ message: err.response?.data?.message || err.message, type: 'error' });
      setOtpSent(false);
      clearInterval(timerRef.current);
      setOtpTimer(0);
    }
    setTimeout(() => setUpdateStatus({ message: '', type: '' }), 5000);
  };

  // OTP verify
  const handleVerifyOTP = async () => {
    setUpdateStatus({ message: 'Verifying OTP...', type: 'info' });
    try {
      const res = await whatsappAPI.verifyOTP(otp);
      if (res.data.status === 'success') {
        setUpdateStatus({ message: 'Phone verified!', type: 'success' });
        const updatedUser = await userApi.editProfile({
          phone_number: editData.phone_number,
          phone_verified: true,
        });
        setUserData(prev => ({ ...prev, ...updatedUser.data }));
        setOtpSent(false);
        setOtp('');
        clearInterval(timerRef.current);
        setOtpTimer(0);
      } else {
        setUpdateStatus({ message: `Verification failed: ${res.data.message}`, type: 'error' });
      }
    } catch (err) {
      setUpdateStatus({ message: err.response?.data?.message || err.message, type: 'error' });
    }
    setTimeout(() => setUpdateStatus({ message: '', type: '' }), 5000);
  };

  const formatTimer = sec => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
  };

  return {
    userData,
    userType,
    loading,
    error,
    isEditing,
    editData,
    updateStatus,
    passwordStatus,
    avgRating,
    showPasswordFields,
    currentPassword,
    newPassword,
    confirmNewPassword,
    otpSent,
    otp,
    otpTimer,
    toggleEdit,
    handleEditChange,
    handleProfileFileChange,
    handleProfileUpdate,
    handlePasswordChange,
    handleSendOTP,
    handleVerifyOTP,
    formatTimer,
    previewImage,
    setShowPasswordFields,
    setCurrentPassword,
    setNewPassword,
    setConfirmNewPassword,
    setOtp,
  };
};
