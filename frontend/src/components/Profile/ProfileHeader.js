// src/components/Profile/ProfileHeader.js
import React from 'react';
import { Camera, Edit2, Save, Copy, Check } from 'lucide-react';
import ProfileImageWithBg from '../ProfileImageWithBg';
import { toast } from 'react-hot-toast';
import Button from '../ui/Button';
import Card from '../ui/Card';

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
    <Card className="p-8 mb-8 overflow-hidden relative border-none shadow-elevation-2 dark:shadow-none">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-900 dark:to-secondary-900 opacity-90 z-0"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-end md:items-center justify-between gap-6 mt-12">
        <div className="flex items-end gap-6 w-full md:w-auto">
          <div className="relative group">
            <div className="p-1 bg-white dark:bg-dark-card rounded-2xl shadow-sm">
                <ProfileImageWithBg
                    imageUrl={previewImage || userData.profile_picture}
                    size={120}
                    className="rounded-xl border-2 border-white dark:border-dark-bg"
                />
            </div>
            {isEditing && (
              <label className="absolute bottom-2 right-2 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700 shadow-lg hover:scale-110 transition-transform">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  className="hidden"
                  onChange={e => handleProfileFileChange(e.target.files[0])}
                />
              </label>
            )}
          </div>

          <div className="flex flex-col mb-2">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight">
              {userData.first_name || userData.username} {userData.last_name}
            </h1>
            <p className="text-slate-500 dark:text-slate-300 font-medium text-lg">
              {userType.charAt(0).toUpperCase() + userType.slice(1)}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mb-2">
          <Button
            variant="secondary"
            onClick={copyReferralLink}
            leftIcon={<Copy className="w-4 h-4" />}
          >
             Referral Link
          </Button>

          <Button
            variant={isEditing ? 'success' : 'primary'}
            onClick={toggleEdit}
            leftIcon={isEditing ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
          >
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProfileHeader;
