import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaUser,
  FaWhatsapp, FaBookOpen, FaBriefcase, FaGraduationCap
} from "react-icons/fa";
import { studentAPI } from "../utils/apiService";

export default function StudentProfilePage({ initialData }) {
  const { studentId } = useParams();
  const [profile, setProfile] = useState(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setProfile(initialData);
      setLoading(false);
      return;
    }
    if (!studentId) return;

    async function fetchStudent() {
      try {
        setLoading(true);
        const res = await studentAPI.getStudentProfile(studentId);
        setProfile(res.data);
      } catch (err) {
        setError(err.message || "Failed to load student data.");
      } finally {
        setLoading(false);
      }
    }
    fetchStudent();
  }, [studentId, initialData]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <LoadingSpinner />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-red-500 text-xl mb-2">⚠️</div>
        <p className="text-gray-900 font-medium">{error}</p>
      </div>
    </div>
  );

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Navbar />

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          {/* Cover/Banner Placeholder */}
          <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

          <div className="px-8 pb-8">
            <div className="relative flex items-end -mt-12 mb-6">
               <div className="w-24 h-24 rounded-full border-4 border-white bg-white shadow-md flex items-center justify-center overflow-hidden">
                 {profile.profile_picture ? (
                   <img src={profile.profile_picture} alt={profile.username} className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center text-3xl font-bold text-indigo-600">
                     {profile.username?.charAt(0).toUpperCase() || "S"}
                   </div>
                 )}
               </div>
               <div className="ml-4 mb-1">
                 <h1 className="text-2xl font-bold text-gray-900">{profile.username}</h1>
                 <p className="text-sm text-gray-500 flex items-center gap-1">
                   <FaMapMarkerAlt className="text-gray-400" />
                   {profile.location || "Location not specified"}
                 </p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {/* Contact Info */}
               <div className="space-y-3 md:col-span-1">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Contact Info</h3>

                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                       <FaWhatsapp />
                    </div>
                    <div>
                       <p className="text-xs text-gray-500">WhatsApp</p>
                       <p className="font-medium">{profile.phone_number || "Not provided"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                       <FaEnvelope />
                    </div>
                    <div>
                       <p className="text-xs text-gray-500">Email</p>
                       <p className="font-medium">{profile.email || "Hidden"}</p>
                    </div>
                  </div>
               </div>

               {/* Bio & Details */}
               <div className="md:col-span-2 space-y-6 border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-8">
                  <div>
                     <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <FaUser className="text-indigo-500 text-sm" /> About Me
                     </h3>
                     <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                        {profile.bio || "This student hasn't written a bio yet."}
                     </p>
                  </div>

                  {/* Future: Enrolled Courses / Activity Stats could go here */}
               </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
