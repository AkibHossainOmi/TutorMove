import React from 'react';
import { FaCamera, FaEdit, FaSave, FaCopy } from 'react-icons/fa';
import ProfileImageWithBg from '../ProfileImageWithBg';
import { toast } from 'react-hot-toast';

const ProfileHeader = ({ profile }) => {
  const {
    userData,
    userType,
    isEditing,
    toggleEdit,
    handleProfileFileChange,
    previewImage,
  } = profile;

  const copyReferralLink = () => {
    const link = `${window.location.origin}/refer/${userData.username}`;
    navigator.clipboard.writeText(link);
    toast.success('Referral link copied!');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden p-6 flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-6 w-full md:w-auto">
        <div className="relative">
          <ProfileImageWithBg
            imageUrl={previewImage || userData.profile_picture}
            size={96}
          />
          {isEditing && (
            <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1 rounded-full cursor-pointer hover:bg-indigo-700">
              <FaCamera />
              <input
                type="file"
                className="hidden"
                onChange={e => handleProfileFileChange(e.target.files[0])}
              />
            </label>
          )}
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="text-2xl md:text-3xl font-bold">{userData.first_name} {userData.last_name}</h1>
          <p className="text-gray-600">{userType.charAt(0).toUpperCase() + userType.slice(1)}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        <button
          onClick={copyReferralLink}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition w-full sm:w-auto bg-purple-600 text-white hover:bg-purple-700"
        >
          <FaCopy className="text-sm" /> Copy Referral Link
        </button>
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
  );
};

export default ProfileHeader;
