// src/pages/Profile.jsx
import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import { useProfile } from '../components/Profile/UseProfile';
import ProfileHeader from '../components/Profile/ProfileHeader';
import BasicInfoCard from '../components/Profile/BasicInfoCard';
import TutorDetailsCard from '../components/Profile/TutorDetailsCard';
import BioCard from '../components/Profile/BioCard';
import AccountActionsCard from '../components/Profile/AccountActionsCard';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Profile = () => {
  const profile = useProfile();

  // Show error toast if profile fails to load
  useEffect(() => {
    if (profile.error) {
      toast.error(
        profile.error || 'Something went wrong loading your profile.',
        {
          position: 'bottom-center',
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    }
  }, [profile.error]);

  if (profile.loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex justify-center items-center">
          <LoadingSpinner />
        </div>
        <Footer />
        {/* Toast container always mounted */}
        <ToastContainer position="bottom-center" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-inter">
      <Navbar />
      <main className="flex-grow max-w-4xl mx-auto w-full p-6 mt-20 mb-10 space-y-6">
        <ProfileHeader profile={profile} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <BasicInfoCard profile={profile} />
            {profile.userType === 'tutor' && (
              <TutorDetailsCard profile={profile} />
            )}
          </div>
          <div className="lg:col-span-1 space-y-6">
            <BioCard profile={profile} />
            {/* AccountActionsCard should call toast.success/error internally */}
            <AccountActionsCard profile={profile} />
          </div>
        </div>
      </main>
      <Footer />

      {/* Global toast container - fixed mid bottom */}
      <ToastContainer
        position="bottom-center"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default Profile;
