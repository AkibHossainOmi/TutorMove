import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { tutorAPI } from "../utils/apiService";
import LoadingSpinner from "../components/LoadingSpinner";
import ProfileImageWithBg from "../components/ProfileImageWithBg";
import GiftCoinModal from "../components/GiftCoinModal";
import { useAuth } from "../contexts/AuthContext";
import { pointsAPI } from "../utils/apiService";

export default function TutorProfilePage() {
  const { tutorId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [userCreditBalance, setUserCreditBalance] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();

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

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <LoadingSpinner />
      <p className="mt-4 text-gray-500">Loading profile...</p>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-[50vh] text-red-600 font-medium">
      {error}
    </div>
  );

  if (!profile) return null;

  const isStudent = user?.user_type === "student";

  const fetchUserBalance = async () => {
      try {
          const res = await pointsAPI.getBalance();
          setUserCreditBalance(res.data.balance);
      } catch (err) {
          console.error("Failed to fetch balance", err);
      }
  };

  const openGiftModal = () => {
      fetchUserBalance();
      setIsGiftModalOpen(true);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-12 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Side - Tutor Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {profile.profile_picture ? (
                 <ProfileImageWithBg imageUrl={profile.profile_picture} size={112} />
              ) : (
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-4xl font-bold flex items-center justify-center shadow-inner">
                   {profile.username?.charAt(0).toUpperCase() || "T"}
                </div>
              )}

              <div className="text-center sm:text-left flex-1">
                <div className="flex items-center justify-center sm:justify-start gap-3 mb-1">
                  <h1 className="text-3xl font-bold text-gray-900">{profile.username}</h1>
                  {profile.is_verified && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Verified
                    </span>
                  )}
                  {isStudent && (
                    <button
                      onClick={openGiftModal}
                      className="ml-3 inline-flex items-center px-3 py-1 text-sm font-medium rounded-full text-amber-600 bg-amber-50 hover:bg-amber-100 transition-colors border border-amber-200 shadow-sm"
                      title="Gift Coins"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7.858 5.485a1 1 0 00-1.715 1.03L7.633 9H7a1 1 0 100 2h1.838l.179 1.074c.128.766.726 1.347 1.488 1.446l.495.064c.783.102 1.446-.543 1.345-1.326l-.064-.495a1.2 1.2 0 00-1.22-1.042l-1.954-.253-.178-1.074H13a1 1 0 100-2h-2.383l1.49-2.485a1 1 0 00-1.715-1.03L8.91 8.243 7.858 5.485z" clipRule="evenodd" />
                      </svg>
                      Gift
                    </button>
                  )}
                </div>

                <p className="text-gray-500 flex items-center justify-center sm:justify-start gap-1 mb-4">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {profile.location || "Location not specified"}
                </p>

                {profile.hourly_rate && (
                  <div className="inline-block px-4 py-1.5 bg-gray-50 rounded-full text-sm font-semibold text-gray-900 border border-gray-100">
                    ${profile.hourly_rate} / hour
                  </div>
                )}
              </div>
            </div>

            <Card title="About Me">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {profile.bio || "No bio available."}
              </p>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="Education">
                <div className="flex items-start gap-3">
                   <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path d="M12 14l9-5-9-5-9 5 9 5z" />
                         <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                      </svg>
                   </div>
                   <p className="text-gray-700 mt-1">{profile.education || "Not specified"}</p>
                </div>
              </Card>
              <Card title="Experience">
                <div className="flex items-start gap-3">
                   <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                   </div>
                   <p className="text-gray-700 mt-1">{profile.experience || "Not specified"}</p>
                </div>
              </Card>
            </div>

            <Card title="Subjects">
              {profile.subjects?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.subjects.map((subj, i) => (
                    <span key={i} className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {subj}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No subjects listed.</p>
              )}
            </Card>

            <Card title="Active Gigs">
              {profile.gigs?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.gigs.map((gig) => (
                    <div
                      key={gig.id}
                      className="p-5 border border-gray-200 rounded-xl bg-gray-50 hover:bg-white hover:shadow-md transition-all cursor-pointer group"
                    >
                      <h4 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors mb-2 line-clamp-1">{gig.title}</h4>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">{gig.description}</p>
                      <div className="flex items-center text-xs text-gray-500 bg-white px-2 py-1 rounded-md border border-gray-100 w-fit">
                         Subject: {gig.subject}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No active gigs.</p>
              )}
            </Card>
          </div>

          {/* Right Side - Contact + Message */}
          <aside className="space-y-6">
            <Card title="Contact Information">
              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                       </svg>
                    </div>
                    <div>
                       <p className="text-xs text-gray-500 uppercase font-semibold">Email</p>
                       <p className="text-sm font-medium text-gray-900 truncate">{profile.email || "Hidden"}</p>
                    </div>
                 </div>

                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                       </svg>
                    </div>
                    <div>
                       <p className="text-xs text-gray-500 uppercase font-semibold">WhatsApp</p>
                       <p className="text-sm font-medium text-gray-900 truncate">{profile.phone_number || "Hidden"}</p>
                    </div>
                 </div>
              </div>
            </Card>

            {isStudent && (
              <div className="space-y-3">
                <button
                  onClick={() => navigate(`/messages/?username=${encodeURIComponent(profile.username)}`)}
                  className="w-full inline-flex justify-center items-center px-5 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm hover:shadow transition-all"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Message Tutor
                </button>
                <button
                  onClick={openGiftModal}
                  className="w-full inline-flex justify-center items-center px-5 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-sm hover:shadow transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7.858 5.485a1 1 0 00-1.715 1.03L7.633 9H7a1 1 0 100 2h1.838l.179 1.074c.128.766.726 1.347 1.488 1.446l.495.064c.783.102 1.446-.543 1.345-1.326l-.064-.495a1.2 1.2 0 00-1.22-1.042l-1.954-.253-.178-1.074H13a1 1 0 100-2h-2.383l1.49-2.485a1 1 0 00-1.715-1.03L8.91 8.243 7.858 5.485z" clipRule="evenodd" />
                  </svg>
                  Gift Coins
                </button>
              </div>
            )}
          </aside>
        </div>
      </main>

      <GiftCoinModal
        isOpen={isGiftModalOpen}
        onClose={() => setIsGiftModalOpen(false)}
        tutorId={tutorId}
        tutorName={profile.username}
        currentBalance={userCreditBalance}
      />
      <Footer />
    </>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );
}
