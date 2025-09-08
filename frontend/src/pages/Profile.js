// src/pages/Profile.jsx
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import { useProfile } from '../components/Profile/UseProfile';
import ProfileHeader from '../components/Profile/ProfileHeader';
import BasicInfoCard from '../components/Profile/BasicInfoCard';
import TutorDetailsCard from '../components/Profile/TutorDetailsCard';
import BioCard from '../components/Profile/BioCard';
import AccountActionsCard from '../components/Profile/AccountActionsCard';
import StatusMessage from '../components/Profile/StatusMessage';

const Profile = () => {
  const profile = useProfile();

  if (profile.loading)
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex justify-center items-center">
          <LoadingSpinner />
        </div>
        <Footer />
      </div>
    );

  if (profile.error)
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex justify-center items-center px-4">
          <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Error</h2>
            <p className="text-gray-600">{profile.error}</p>
          </div>
        </div>
        <Footer />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-inter">
      <Navbar />
      <main className="flex-grow max-w-4xl mx-auto w-full p-6 mt-20 mb-10 space-y-6">
        <ProfileHeader profile={profile} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <BasicInfoCard profile={profile} />
            {profile.userType === 'tutor' && <TutorDetailsCard profile={profile} />}
          </div>
          <div className="lg:col-span-1 space-y-6">
            <BioCard profile={profile} />
            <AccountActionsCard profile={profile} />
          </div>
        </div>
        <StatusMessage profile={profile} />
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
