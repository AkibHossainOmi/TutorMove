import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaUser, FaStar, FaUserShield, FaPhoneAlt, FaInfoCircle, FaBriefcase, FaUserGraduate, FaEdit, FaSave } from 'react-icons/fa';
import { MdVerifiedUser } from 'react-icons/md';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { userApi } from '../utils/apiService';
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
      setUpdateStatus('Profile updated!');
      setTimeout(() => setUpdateStatus(''), 3000);

      if (updated.user_type === 'tutor') {
        fetchAverageRating(updated.id);
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
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setError(null);

      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        setError('User data not found. Please log in.');
        setLoading(false);
        return;
      }

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

        if (data.user_type === 'tutor') {
          fetchAverageRating(data.id);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-blue-600 text-lg">
        <LoadingSpinner/>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center text-red-600 text-lg">{error}</div>
    );
  }

  return (
    <>
      <Navbar />
      <div style={{ height: '100px' }}></div>
      <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
        <div className="bg-white shadow-md rounded-lg border max-w-3xl w-full p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-semibold text-gray-800">Your Profile</h1>
            {(userType === 'tutor' || userType === 'student') && (
              <button
                onClick={toggleEdit}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
              >
                {isEditing ? (
                  <>
                    <FaSave /> Save
                  </>
                ) : (
                  <>
                    <FaEdit /> Edit
                  </>
                )}
              </button>
            )}
          </div>

          {/* Display User Info */}
          <div className="space-y-6 mb-10">
            {[
              { label: 'Username', value: userData.username, icon: <FaUser className="text-gray-600" /> },
              {
                label: 'User Type',
                value: userType.charAt(0).toUpperCase() + userType.slice(1),
                icon: <MdVerifiedUser className="text-gray-600" />,
              },
              { 
                label: 'Location', 
                value: isEditing ? (
                  <input
                    className="w-full p-2 border rounded"
                    value={editData.location}
                    onChange={(e) => handleEditChange('location', e.target.value)}
                  />
                ) : userData.location || 'Not Provided', 
                icon: <FaMapMarkerAlt className="text-gray-600" /> 
              },
              { label: 'Trust Score', value: (userData.trust_score ?? 0).toFixed(1), icon: <FaUserShield className="text-gray-600" /> },
              ...(userType === 'tutor' ? [{
                label: 'Overall Rating',
                value: avgRating ?? 'No reviews yet',
                icon: <FaStar className="text-gray-600" />,
              }] : [])
            ].map(({ label, value, icon, bgClass = 'bg-gray-100', textClass = 'text-gray-900' }) => (
              <div
                key={label}
                className={`flex justify-between items-center ${bgClass} p-4 rounded-md border`}
              >
                <div className={`flex items-center gap-2 text-sm font-medium ${textClass}`}>
                  {icon} {label}
                </div>
                <div className="text-lg font-semibold text-gray-900">{value}</div>
              </div>
            ))}

            {/* Additional fields for tutors */}
            {userType === 'tutor' && (
              <>
                {[
                  { 
                    label: 'Bio', 
                    value: isEditing ? (
                      <textarea
                        className="w-full p-2 border rounded"
                        rows="3"
                        value={editData.bio}
                        onChange={(e) => handleEditChange('bio', e.target.value)}
                      />
                    ) : userData.bio || 'Not provided', 
                    icon: <FaInfoCircle className="text-gray-600" /> 
                  },
                  { 
                    label: 'Education', 
                    value: isEditing ? (
                      <input
                        className="w-full p-2 border rounded"
                        value={editData.education}
                        onChange={(e) => handleEditChange('education', e.target.value)}
                      />
                    ) : userData.education || 'Not provided', 
                    icon: <FaUserGraduate className="text-gray-600" /> 
                  },
                  { 
                    label: 'Experience', 
                    value: isEditing ? (
                      <input
                        className="w-full p-2 border rounded"
                        value={editData.experience}
                        onChange={(e) => handleEditChange('experience', e.target.value)}
                      />
                    ) : userData.experience || 'Not provided', 
                    icon: <FaBriefcase className="text-gray-600" /> 
                  },
                  { 
                    label: 'Phone', 
                    value: isEditing ? (
                      <input
                        className="w-full p-2 border rounded"
                        value={editData.phone_number}
                        onChange={(e) => handleEditChange('phone_number', e.target.value)}
                      />
                    ) : userData.phone_number || 'Not Provided', 
                    icon: <FaPhoneAlt className="text-gray-600" /> 
                  },
                  {
                    label: 'Average Rating',
                    value: avgRating !== null ? avgRating.toFixed(1) : 'No reviews',
                    icon: <FaStar className="text-gray-600" />,
                  },
                ].map(({ label, value, icon }) => (
                  <div key={label} className="bg-gray-100 p-4 rounded-md border">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      {icon} {label}
                    </div>
                    <div className="text-base text-gray-900">
                      {value}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {updateStatus && (
            <p
              className={`text-sm text-center font-medium mt-2 ${
                updateStatus.includes('Error') ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {updateStatus}
            </p>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Profile;
