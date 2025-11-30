import React, { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { userApi } from "../utils/apiService";
import TutorProfilePage from "./TutorProfile";
import StudentProfilePage from "./StudentProfile";
import LoadingSpinner from "../components/LoadingSpinner";

export default function UserProfile() {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!username) return;

    async function fetchUser() {
      try {
        setLoading(true);
        const res = await userApi.getPublicProfile(username);
        setUser(res.data);
      } catch (err) {
        setError(err.response?.data?.detail || "User not found");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [username]);

  if (loading) return <div className="flex justify-center items-center min-h-screen"><LoadingSpinner /></div>;
  if (error) return <div className="flex justify-center items-center min-h-screen text-red-600 font-semibold">{error}</div>;

  if (user.user_type === "tutor" || user.user_type === "teacher") {
    return <TutorProfilePage initialData={user} />;
  } else if (user.user_type === "student") {
    return <StudentProfilePage initialData={user} />;
  } else {
      return <div className="p-10 text-center">User profile not available for this role ({user.user_type}).</div>
  }
}
