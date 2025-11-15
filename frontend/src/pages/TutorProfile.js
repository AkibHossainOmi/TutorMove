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
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
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

  if (loading) return <div className="p-6 text-center"><LoadingSpinner /></div>;
  if (error) return <div className="p-6 text-center text-red-600 font-semibold">{error}</div>;
  if (!profile) return null;

  const isStudent = JSON.parse(localStorage.getItem("user"))?.user_type === "student";

  return (
    <>
      <Navbar />
      <main className="min-h-screen mt-20 bg-gradient-to-b from-indigo-50 via-white to-gray-50 p-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Side - Tutor Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white shadow-lg rounded-2xl p-6 flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-indigo-600 text-white text-4xl font-bold flex items-center justify-center">
                {profile.username?.charAt(0).toUpperCase() || "T"}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{profile.username}</h1>
                <p className="text-gray-600">{profile.location || "Location not specified"}</p>
                {profile.is_verified && (
                  <span className="inline-block mt-2 bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full">
                    ✅ Verified
                  </span>
                )}
              </div>
            </div>

            <Card title="Bio">
              <p className="text-gray-700 whitespace-pre-wrap">{profile.bio || "No bio available."}</p>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="Education">
                <p className="text-gray-700">{profile.education || "Not specified"}</p>
              </Card>
              <Card title="Experience">
                <p className="text-gray-700">{profile.experience || "Not specified"}</p>
              </Card>
            </div>

            <Card title="Subjects">
              {profile.subjects?.length > 0 ? (
                <ul className="flex flex-wrap gap-2">
                  {profile.subjects.map((subj, i) => (
                    <li key={i} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                      {subj}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No subjects listed.</p>
              )}
            </Card>

            <Card title="Gigs">
              {profile.gigs?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.gigs.map((gig) => (
                    <div
                      key={gig.id}
                      className="p-4 border rounded-xl bg-white shadow hover:shadow-lg transition transform hover:-translate-y-1 cursor-pointer"
                    >
                      <h4 className="font-semibold text-indigo-700">{gig.title}</h4>
                      <p className="text-gray-700">{gig.description}</p>
                      <p className="text-sm text-gray-500 mt-2">Subject: {gig.subject}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No gigs listed.</p>
              )}
            </Card>
          </div>

          {/* Right Side - Contact + Message */}
          <aside className="space-y-6">
            <Card title="Contact Info">
              {profile.email || profile.phone_number ? (
                <ul className="space-y-2 text-gray-700">
                  <li><span className="font-medium">Email:</span> {profile.email || "Hidden"}</li>
                  <li><span className="font-medium">WhatsApp:</span> {profile.phone_number || "Hidden"}</li>
                </ul>
              ) : (
                <p className="text-gray-500 italic">Contact not available</p>
              )}
            </Card>

            {isStudent && profile.unlocked && (
              <button
                onClick={() => navigate(`/messages/?username=${encodeURIComponent(profile.username)}`)}
                className="w-full inline-flex justify-center items-center px-5 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md transition-all"
              >
                Message Tutor
              </button>
            )}
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white shadow-md rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">{title}</h3>
      {children}
    </div>
  );
}
