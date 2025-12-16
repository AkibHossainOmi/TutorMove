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
import { AlertCircle } from 'lucide-react';

const Profile = () => {
  const profile = useProfile();

  if (profile.loading)
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-grow flex justify-center items-center">
          <LoadingSpinner />
        </div>
        <Footer />
      </div>
    );

  if (profile.error)
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-grow flex justify-center items-center px-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-md w-full text-center">
            <div className="mx-auto w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mb-4">
               <AlertCircle className="w-6 h-6 text-rose-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Profile Unavailable</h2>
            <p className="text-slate-500 mb-6">{profile.error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
            >
              Retry
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-600">
      <Navbar />
      <main className="flex-grow max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 mt-16 space-y-8">

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
