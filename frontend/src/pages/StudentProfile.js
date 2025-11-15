import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LoadingSpinner from "../components/LoadingSpinner";
import { FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa";
import { studentAPI } from "../utils/apiService";

export default function StudentProfilePage() {
  const { studentId } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStudent() {
      try {
        setLoading(true);
        const res = await studentAPI.getStudentProfile(studentId);
        setStudent(res.data);
      } catch (err) {
        setError(err.message || "Failed to load student data.");
      } finally {
        setLoading(false);
      }
    }
    fetchStudent();
  }, [studentId]);

  if (loading) return <div className="p-6 text-center"><LoadingSpinner /></div>;
  if (error) return <div className="p-6 text-center text-red-600 font-semibold">{error}</div>;
  if (!student) return null;

  return (
    <>
      <Navbar />
      <main className="min-h-screen mt-20 bg-gradient-to-b from-indigo-50 via-white to-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-indigo-600 text-white text-3xl font-bold flex items-center justify-center">
                {student.username?.charAt(0).toUpperCase() || "S"}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{student.username}</h1>
                <p className="text-gray-600">{student.location || "Location not specified"}</p>
              </div>
            </div>

            <div className="space-y-5">
              {[
                {
                  label: "WhatsApp Number",
                  value: student.phone_number || "Not provided",
                  icon: <FaPhoneAlt className="text-gray-500" />,
                },
                {
                  label: "Location",
                  value: student.location || "Not provided",
                  icon: <FaMapMarkerAlt className="text-gray-500" />,
                },
                {
                  label: "Bio",
                  value: student.bio || "No bio available.",
                  icon: null,
                },
              ].map(({ label, value, icon }) => (
                <div key={label}>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                    {icon} {label}
                  </div>
                  <div className="text-gray-900 whitespace-pre-wrap">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
