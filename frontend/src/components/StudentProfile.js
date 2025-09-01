import React from 'react';
import { FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa';

const StudentProfile = ({
  userData,
  editData,
  isEditing,
  handleEditChange,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 mt-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-100 flex items-center">
        Student Details
      </h2>
      <div className="space-y-5">
        {[
          {
            label: 'Phone Number',
            value: isEditing ? (
              <input
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                value={editData.phone_number}
                onChange={(e) => handleEditChange('phone_number', e.target.value)}
              />
            ) : (
              userData.phone_number || 'Not provided'
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
  );
};

export default StudentProfile;
