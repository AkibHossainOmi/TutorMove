import React from 'react';
import { FaInfoCircle } from 'react-icons/fa';

const BioCard = ({ profile }) => {
  const { userData, userType, isEditing, editData, handleEditChange } = profile;

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
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
  );
};

export default BioCard;