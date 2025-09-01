import React from 'react';
import { FaUserGraduate, FaBriefcase, FaPhoneAlt, FaMapMarkerAlt } from 'react-icons/fa';

const TutorDetailsCard = ({ profile }) => {
  const { userData, isEditing, editData, handleEditChange, handleSendOTP, handleVerifyOTP, otpSent, otp, setOtp, otpTimer, formatTimer } = profile;

  const fields = [
    {
      label: 'Education',
      icon: <FaUserGraduate className="text-gray-500" />,
      value: isEditing ? (
        <input
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          value={editData.education}
          onChange={(e) => handleEditChange('education', e.target.value)}
        />
      ) : (
        userData.education || 'Not provided'
      ),
    },
    {
      label: 'Experience',
      icon: <FaBriefcase className="text-gray-500" />,
      value: isEditing ? (
        <input
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          value={editData.experience}
          onChange={(e) => handleEditChange('experience', e.target.value)}
        />
      ) : (
        userData.experience || 'Not provided'
      ),
    },
    {
      label: 'Phone Number',
      icon: <FaPhoneAlt className="text-gray-500" />,
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
              <span className="text-green-600 flex items-center gap-1">Verified</span>
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
    },
    {
      label: 'Location',
      icon: <FaMapMarkerAlt className="text-gray-500" />,
      value: isEditing ? (
        <input
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          value={editData.location}
          onChange={(e) => handleEditChange('location', e.target.value)}
        />
      ) : (
        userData.location || 'Not provided'
      ),
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-100 flex items-center">
        <FaUserGraduate className="text-indigo-500 mr-2" /> Tutor Details
      </h2>
      <div className="space-y-5">
        {fields.map(({ label, value, icon }) => (
          <div key={label}>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
              {icon} {label}
            </div>
            <div className="text-gray-900">{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TutorDetailsCard;