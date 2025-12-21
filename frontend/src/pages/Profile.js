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
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from '../components/ui/Button';

const Profile = () => {
  const profile = useProfile();

  if (profile.loading)
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col transition-colors duration-300">
        <Navbar />
        <div className="flex-grow flex justify-center items-center">
          <LoadingSpinner size="lg" />
        </div>
        <Footer />
      </div>
    );

  if (profile.error)
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col transition-colors duration-300">
        <Navbar />
        <div className="flex-grow flex justify-center items-center px-4">
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl dark:shadow-none border border-slate-200 dark:border-white/5 p-10 max-w-md w-full text-center">
            <div className="mx-auto w-16 h-16 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center mb-6">
               <AlertCircle className="w-8 h-8 text-rose-600 dark:text-rose-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Profile Unavailable</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8">{profile.error}</p>
            <Button
              variant="primary"
              onClick={() => window.location.reload()}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Retry
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col font-sans text-slate-600 dark:text-slate-300 transition-colors duration-300">
      <Navbar />
      <main className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 mt-16 space-y-8">

        {/* Profile Header */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           <ProfileHeader profile={profile} />
        </section>

        {/* Profile Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
             <BasicInfoCard profile={profile} />
             {profile.userType === 'tutor' && <TutorDetailsCard profile={profile} />}
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
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
