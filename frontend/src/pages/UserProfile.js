import React, { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LoadingSpinner from "../components/LoadingSpinner";
import { userApi } from "../utils/apiService";
import TutorProfilePage from "./TutorProfile";
import StudentProfilePage from "./StudentProfile";

export default function UserProfile() {
  const { username } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        const response = await userApi.getPublicProfile(username);
        setProfileData(response.data);
      } catch (err) {
        setError(err.response?.status === 404 ? "User not found" : "Error fetching profile");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <LoadingSpinner />
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex items-center justify-center text-red-600 font-medium">
          {error}
        </div>
        <Footer />
      </div>
    );
  }

  if (!profileData) return null;

  // Render appropriate profile page based on user type
  // Passing profileData as a prop to avoid re-fetching if the component supports it.
  // We need to modify TutorProfilePage and StudentProfilePage to accept 'initialData' or similar.
  // For now, let's see if we can adapt those pages.

  if (profileData.user_type === 'tutor') {
      return <TutorProfilePage initialData={profileData} />;
  } else if (profileData.user_type === 'student') {
      return <StudentProfilePage initialData={profileData} />;
  } else {
      return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex-grow flex items-center justify-center">
                <p>Profile type not supported.</p>
            </div>
            <Footer />
        </div>
      );
  }
}
