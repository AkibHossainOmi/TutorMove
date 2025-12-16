// src/components/TutorProfile.js
import React from 'react';
import { Briefcase, MapPin, Phone, CheckCircle, GraduationCap } from 'lucide-react';

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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mt-6">
      <h2 className="text-xl font-bold text-slate-800 mb-8 pb-4 border-b border-slate-100 flex items-center gap-2">
        <GraduationCap className="w-6 h-6 text-indigo-600" />
        Professional Details
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Education */}
        <div className="flex gap-4 items-start">
           <div className="flex-shrink-0 p-3 bg-indigo-50 rounded-xl">
              <GraduationCap className="w-6 h-6 text-indigo-600" />
           </div>
           <div className="flex-grow w-full">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Education</label>
              {isEditing ? (
                 <input
                    type="text"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow"
                    value={editData.education}
                    onChange={(e) => handleEditChange('education', e.target.value)}
                    placeholder="E.g., MSc in Physics, University of Dhaka"
                  />
              ) : (
                 <div className="text-slate-800 font-medium text-lg leading-snug">
                    {userData.education || <span className="text-slate-400 italic">Not provided</span>}
                 </div>
              )}
           </div>
        </div>

        {/* Experience */}
        <div className="flex gap-4 items-start">
           <div className="flex-shrink-0 p-3 bg-emerald-50 rounded-xl">
              <Briefcase className="w-6 h-6 text-emerald-600" />
           </div>
           <div className="flex-grow w-full">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Experience</label>
              {isEditing ? (
                 <input
                    type="text"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow"
                    value={editData.experience}
                    onChange={(e) => handleEditChange('experience', e.target.value)}
                    placeholder="E.g., 5 years teaching High School Math"
                  />
              ) : (
                 <div className="text-slate-800 font-medium text-lg leading-snug">
                    {userData.experience || <span className="text-slate-400 italic">Not provided</span>}
                 </div>
              )}
           </div>
        </div>

        {/* Location */}
        <div className="flex gap-4 items-start">
           <div className="flex-shrink-0 p-3 bg-rose-50 rounded-xl">
              <MapPin className="w-6 h-6 text-rose-600" />
           </div>
           <div className="flex-grow w-full">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Location</label>
              {isEditing ? (
                 <input
                    type="text"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow"
                    value={editData.location}
                    onChange={(e) => handleEditChange('location', e.target.value)}
                    placeholder="E.g., Dhaka, Bangladesh"
                  />
              ) : (
                 <div className="text-slate-800 font-medium text-lg leading-snug">
                    {userData.location || <span className="text-slate-400 italic">Not provided</span>}
                 </div>
              )}
           </div>
        </div>

        {/* Phone / WhatsApp */}
        <div className="flex gap-4 items-start">
           <div className="flex-shrink-0 p-3 bg-blue-50 rounded-xl">
              <Phone className="w-6 h-6 text-blue-600" />
           </div>
           <div className="flex-grow w-full">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">WhatsApp Number</label>
              {isEditing ? (
                 <input
                    type="text"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow"
                    value={editData.phone_number}
                    onChange={(e) => handleEditChange('phone_number', e.target.value)}
                    placeholder="E.g., +8801700000000"
                  />
              ) : (
                 <div className="flex flex-col gap-2">
                   <div className="flex items-center gap-2">
                     <span className="text-slate-800 font-medium text-lg">{userData.phone_number || <span className="text-slate-400 italic text-base">Not provided</span>}</span>
                     {userData.phone_verified && (
                       <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                         <CheckCircle className="w-3 h-3 mr-1" /> Verified
                       </span>
                     )}
                   </div>

                   {!userData.phone_verified && !otpSent && userData.phone_number && (
                     <button
                       onClick={handleSendOTP}
                       className="self-start text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                     >
                       Verify Number
                     </button>
                   )}

                   {otpSent && (
                     <div className="flex items-center gap-2 mt-2 animate-in fade-in slide-in-from-top-1">
                       <input
                         type="text"
                         className="w-24 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                         placeholder="OTP"
                         value={otp}
                         onChange={(e) => handleEditChange('otp', e.target.value)}
                       />
                       <button
                         onClick={handleVerifyOTP}
                         disabled={otpTimer === 0}
                         className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                       >
                         Verify
                       </button>
                       {otpTimer > 0 && (
                         <span className="text-xs text-slate-500 font-mono tabular-nums min-w-[3ch]">{formatTimer(otpTimer)}</span>
                       )}
                     </div>
                   )}
                 </div>
              )}
           </div>
        </div>

      </div>
    </div>
  );
};

export default TutorProfile;
