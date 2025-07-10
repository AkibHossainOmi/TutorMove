import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { tutorAPI } from "../utils/apiService";
import LoadingSpinner from "../components/LoadingSpinner";

export default function TutorProfilePage() {
  const { tutorId } = useParams();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getStudentId = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return null;
      const user = JSON.parse(userStr);
      return user?.user_id || null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    async function fetchData() {
      const studentId = getStudentId();
      if (!studentId) {
        setError("Student not logged in.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const profileData = await tutorAPI.getTutorProfile(tutorId);
        setProfile(profileData.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [tutorId]);

  if (loading) return <div className="p-6 text-center text-lg"><LoadingSpinner/></div>;
  if (error) return <div className="p-6 text-center text-red-600 font-semibold">{error}</div>;
  if (!profile) return null;

  return (
    <>
      <Navbar />
      <main className="min-h-screen mt-20 bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8 relative">
          {JSON.parse(localStorage.getItem("user"))?.user_type === "student" && (
            <UnlockedMessageButton
              studentId={getStudentId()}
              tutorId={tutorId}
              tutorUsername={profile.username}
            />
          )}

          <div className="flex items-center gap-6 mb-6">
            <div className="w-[100px] h-[100px] rounded-full bg-blue-600 text-white text-4xl font-bold flex items-center justify-center select-none">
              {profile.username ? profile.username.charAt(0).toUpperCase() : 'T'}
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">{profile.username}</h1>
              <p className="text-gray-600">{profile.location || "Location not specified"}</p>
              <p className={`mt-1 text-sm font-medium ${profile.is_verified ? "text-green-600" : "text-gray-500"}`}>
                {profile.is_verified ? "Verified Tutor" : ""}
              </p>
            </div>
          </div>

          <section className="mb-6">
            <h2 className="text-xl font-semibold border-b border-gray-300 pb-1 mb-3">Bio</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{profile.bio || "No bio available."}</p>
          </section>

          <section className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Education</h3>
              <p className="text-gray-700">{profile.education || "Not specified"}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Experience</h3>
              <p className="text-gray-700">{profile.experience || "Not specified"}</p>
            </div>
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Subjects</h3>
            {profile.subjects?.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {profile.subjects.map((subj, i) => (
                  <li key={i} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                    {subj}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No subjects listed.</p>
            )}
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Contact Info</h3>
            {profile.email || profile.phone_number ? (
              <ul className="text-gray-700 space-y-1">
                <li>Email: <span className="font-medium">{profile.email || "Hidden"}</span></li>
                <li>Phone: <span className="font-medium">{profile.phone_number || "Hidden"}</span></li>
              </ul>
            ) : (
              <p className="text-gray-500 italic">Contact not available</p>
            )}
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Gigs</h3>
            {profile.gigs?.length > 0 ? (
              <ul className="space-y-3">
                {profile.gigs.map((gig) => (
                  <li key={gig.id} className="border p-3 rounded-md hover:shadow-lg transition-shadow cursor-pointer">
                    <h4 className="font-semibold text-indigo-700">{gig.title}</h4>
                    <p className="text-gray-700">{gig.description}</p>
                    <p className="text-sm text-gray-500 mt-1">Subject: {gig.subject}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600 italic">No gigs listed.</p>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

function UnlockedMessageButton({ studentId, tutorId, tutorUsername }) {
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(true);
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkUnlock() {
      try {
        const token = localStorage.getItem("token");
        if (!token || !studentId || !tutorId) return;

        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/check-unlock-status/?student_id=${studentId}&tutor_id=${tutorId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        setUnlocked(data.unlocked === true);
      } catch (err) {
        console.error("Unlock check failed:", err);
      } finally {
        setChecking(false);
      }
    }

    checkUnlock();
  }, [studentId, tutorId]);

  if (checking || !unlocked) return null;

  return (
    <div className="absolute top-4 right-4">
      <button
        onClick={() => navigate(`/messages/?username=${encodeURIComponent(tutorUsername)}`)}
        className={`inline-flex items-center px-4 py-2 rounded-full shadow-md transition-all ${
          hovered ? 'bg-slate-200' : 'bg-white border border-slate-200'
        } text-indigo-600`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <span className="font-medium">Message</span>
      </button>
    </div>
  );
}
