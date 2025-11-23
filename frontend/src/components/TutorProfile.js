import React from 'react';
import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaBriefcase,
  FaUserGraduate,
} from 'react-icons/fa';
import { MdVerifiedUser } from 'react-icons/md';

const TutorProfile = ({
  userData,
  editData,
  isEditing,
  handleEditChange,
  otpSent,
  otp,
  otpTimer,
  handleSendOTP,
  handleVerifyOTP,
  formatTimer,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100 flex items-center gap-2">
        <FaUserGraduate className="text-indigo-600" />
        Tutor Details
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          {
            label: 'Education',
            value: isEditing ? (
              <input
                className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white transition-colors"
                value={editData.education}
                onChange={(e) => handleEditChange('education', e.target.value)}
                placeholder="Enter your education..."
              />
            ) : (
              userData.education || 'Not provided'
            ),
            icon: <FaUserGraduate className="text-indigo-500" />,
          },
          {
            label: 'Experience',
            value: isEditing ? (
              <input
                className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white transition-colors"
                value={editData.experience}
                onChange={(e) => handleEditChange('experience', e.target.value)}
                placeholder="Enter your experience..."
              />
            ) : (
              userData.experience || 'Not provided'
            ),
            icon: <FaBriefcase className="text-indigo-500" />,
          },
          {
            label: 'WhatsApp Number',
            value: isEditing ? (
              <input
                className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white transition-colors"
                value={editData.phone_number}
                onChange={(e) => handleEditChange('phone_number', e.target.value)}
                placeholder="Enter phone number..."
              />
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{userData.phone_number || 'Not provided'}</span>
                  {userData.phone_verified && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Verified <MdVerifiedUser className="ml-1" />
                    </span>
                  )}
                </div>
                {!userData.phone_verified && !otpSent && userData.phone_number && (
                  <button
                    className="self-start px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700 transition-colors shadow-sm"
                    onClick={handleSendOTP}
                  >
                    Verify Now
                  </button>
                )}
                {otpSent && (
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="text"
                      className="border border-gray-300 rounded-md px-3 py-1.5 w-32 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => handleEditChange('otp', e.target.value)}
                    />
                    <button
                      className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700 transition-colors shadow-sm"
                      onClick={handleVerifyOTP}
                      disabled={otpTimer === 0}
                    >
                      Verify
                    </button>
                    {otpTimer > 0 && (
                      <span className="text-xs text-gray-500 tabular-nums">{formatTimer(otpTimer)}</span>
                    )}
                  </div>
                )}
              </div>
            ),
            icon: <FaPhoneAlt className="text-indigo-500" />,
          },
          {
            label: 'Location',
            value: isEditing ? (
              <input
                className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white transition-colors"
                value={editData.location}
                onChange={(e) => handleEditChange('location', e.target.value)}
                placeholder="Enter location..."
              />
            ) : (
              userData.location || 'Not provided'
            ),
            icon: <FaMapMarkerAlt className="text-indigo-500" />,
          },
        ].map(({ label, value, icon }) => (
          <div key={label} className="flex gap-4 p-4 rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
            <div className="flex-shrink-0 mt-1 p-2 bg-indigo-50 rounded-lg h-fit">
               {React.cloneElement(icon, { size: 16 })}
            </div>
            <div className="flex-grow min-w-0">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                {label}
              </div>
              <div className="text-gray-900 text-sm font-medium break-words">
                {value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TutorProfile;