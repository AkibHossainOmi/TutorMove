import React from 'react';
import { FaUser } from 'react-icons/fa';
import { MdVerifiedUser } from 'react-icons/md';

const BasicInfoCard = ({ profile }) => {
  const { userData, userType } = profile;

  const basicInfo = [
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
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-100 flex items-center">
        <FaUser className="text-indigo-500 mr-2" /> Basic Information
      </h2>
      <div className="space-y-4">
        {basicInfo.map(({ label, value, icon, bgColor }) => (
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
  );
};

export default BasicInfoCard;