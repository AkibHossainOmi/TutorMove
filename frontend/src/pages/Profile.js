import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaUser } from 'react-icons/fa';
import { MdVerifiedUser } from 'react-icons/md';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [userType, setUserType] = useState('');
  const [savedLocation, setSavedLocation] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [bio, setBio] = useState('');
  const [education, setEducation] = useState('');
  const [experience, setExperience] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateStatus, setUpdateStatus] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Average rating state (for tutors)
  const [avgRating, setAvgRating] = useState(null);

  // Review submission form states (for students)
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitStatus, setSubmitStatus] = useState('');

  const fetchUserProfile = async () => {
    setLoading(true);
    setError(null);

    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      setError('User data not found. Please log in.');
      setLoading(false);
      return;
    }

    let user;
    try {
      user = JSON.parse(storedUser);
      if (!user?.user_id) throw new Error('User ID not found.');
    } catch (e) {
      setError('Invalid user data. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/profile/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Token ${token}` }),
        },
        body: JSON.stringify({ id: user.user_id }),
      });

      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const data = await res.json();
      setUserData(data);
      setUserType(data.user_type || '');
      setSavedLocation(data.location || '');
      setLocationInput(data.location || '');
      setBio(data.bio || '');
      setEducation(data.education || '');
      setExperience(data.experience || '');
      setPhoneNumber(data.phone_number || '');

      // If user is tutor, fetch average rating
      if (data.user_type === 'tutor') {
        fetchAverageRating(data.id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAverageRating = async (tutorId) => {
    try {
      const res = await fetch(`/api/reviews/${tutorId}/`);
      if (!res.ok) throw new Error('Failed to fetch average rating');
      const data = await res.json();
      setAvgRating(data.average_rating);
    } catch {
      setAvgRating(null);
    }
  };

  const handleProfileUpdate = async () => {
    setUpdateStatus('Updating...');
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      const res = await fetch('/api/profile/edit/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Token ${token}` }),
        },
        body: JSON.stringify({
          id: user.user_id,
          bio,
          education,
          experience,
          location: locationInput,
          phone_number: phoneNumber,
        }),
      });

      if (!res.ok) throw new Error('Failed to update profile.');
      const updated = await res.json();
      setSavedLocation(updated.location || '');
      setUserData(updated);
      setUpdateStatus('Profile updated!');
      setTimeout(() => setUpdateStatus(''), 3000);

      // If tutor, refresh average rating after update
      if (updated.user_type === 'tutor') {
        fetchAverageRating(updated.id);
      }
    } catch (err) {
      setUpdateStatus(`Error: ${err.message}`);
    }
  };

  const handleSubmitReview = async () => {
    setSubmitStatus('Submitting...');
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      setSubmitStatus('Please log in to submit review.');
      return;
    }
    const student = JSON.parse(storedUser);

    try {
      const res = await fetch('/api/reviews/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student: student.user_id,
          teacher: userData.id,
          rating,
          comment,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to submit review');
      }

      setSubmitStatus('Review submitted!');
      setComment('');
      setRating(5);

      // Refresh average rating
      fetchAverageRating(userData.id);
    } catch (err) {
      setSubmitStatus(err.message);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-blue-600 text-lg">
        Loading your profile...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center text-red-600 text-lg">{error}</div>
    );
  }

  return (
    <>
      <Navbar />
      <div style={{ height: '100px' }}></div>
      <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
        <div className="bg-white shadow-md rounded-lg border max-w-3xl w-full p-8">
          <h1 className="text-3xl font-semibold text-center text-gray-800 mb-8">Your Profile</h1>

          {/* Display User Info */}
          <div className="space-y-6 mb-10">
            {[
              { label: 'Username', value: userData.username, icon: <FaUser /> },
              {
                label: 'User Type',
                value: userType.charAt(0).toUpperCase() + userType.slice(1),
                icon: <MdVerifiedUser />,
              },
              { label: 'Location', value: savedLocation || 'Not Provided', icon: <FaMapMarkerAlt /> },
              // { label: 'Credit Balance', value: `$${userData.credit_balance ?? '0.00'}`, icon: '💰' },
              { label: 'Trust Score', value: (userData.trust_score ?? 0).toFixed(1), icon: '⭐' },
              ...(userType === 'tutor' ? [{
                label: 'Rating',
                value: avgRating ?? 'No reviews yet',
                icon: '⭐',
                bgClass: 'bg-yellow-100',
                textClass: 'text-yellow-900',
              }] : [])
            ].map(({ label, value, icon }) => (
              <div
                key={label}
                className="flex justify-between items-center bg-gray-100 p-4 rounded-md border"
              >
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  {icon} {label}
                </div>
                <div className="text-lg font-semibold text-gray-900">{value}</div>
              </div>
            ))}

            

            {/* Additional fields for tutors */}
            {userType === 'tutor' && (
              <>
                {[
                  { label: 'Bio', value: bio },
                  { label: 'Education', value: education },
                  { label: 'Experience', value: experience },
                  { label: 'Phone', value: userData.phone_number || 'Not Provided', icon: '📞' },
                  {
                    label: 'Average Rating',
                    value: avgRating !== null ? avgRating.toFixed(1) : 'No reviews',
                    icon: '⭐',
                  },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-100 p-4 rounded-md border">
                    <div className="text-sm font-medium text-gray-700 mb-1">{label}</div>
                    <div className="text-base text-gray-900">{value || 'Not provided'}</div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Editable Fields for Tutor */}
          {userType === 'tutor' && (
            <div className="bg-gray-50 p-6 rounded-md border space-y-5">
              <h2 className="text-xl font-semibold text-gray-700">Edit Profile Info</h2>

              <textarea
                className="w-full p-3 border rounded-md"
                rows="3"
                onChange={(e) => setBio(e.target.value)}
                placeholder="Bio"
              />
              <input
                className="w-full p-3 border rounded-md"
                type="text"
                onChange={(e) => setEducation(e.target.value)}
                placeholder="Education"
              />
              <input
                className="w-full p-3 border rounded-md"
                type="text"
                onChange={(e) => setExperience(e.target.value)}
                placeholder="Experience"
              />
              <input
                className="w-full p-3 border rounded-md"
                type="text"
                onChange={(e) => setLocationInput(e.target.value)}
                placeholder="Location"
              />

              <input
                className="w-full p-3 border rounded-md"
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Phone Number"
              />

              <button
                onClick={handleProfileUpdate}
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 w-full rounded-md font-medium"
                disabled={updateStatus === 'Updating...'}
              >
                {updateStatus === 'Updating...' ? 'Updating...' : 'Save Profile'}
              </button>

              {updateStatus && (
                <p
                  className={`text-sm text-center font-medium mt-2 ${
                    updateStatus.includes('Error') ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {updateStatus}
                </p>
              )}
            </div>
          )}

          {/* Editable Location Only for Student */}
          {userType === 'student' && (
            <div className="bg-gray-50 p-6 rounded-md border space-y-5 mt-6">
              <h2 className="text-xl font-semibold text-gray-700">Update Location</h2>

              <input
                className="w-full p-3 border rounded-md"
                type="text"
                onChange={(e) => setLocationInput(e.target.value)}
                placeholder="Enter your location"
              />

              <button
                onClick={handleProfileUpdate}
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 w-full rounded-md font-medium"
                disabled={updateStatus === 'Updating...'}
              >
                {updateStatus === 'Updating...' ? 'Updating...' : 'Save Location'}
              </button>

              {updateStatus && (
                <p
                  className={`text-sm text-center font-medium mt-2 ${
                    updateStatus.includes('Error') ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {updateStatus}
                </p>
              )}
            </div>
          )}

          {/* Review Form for Students viewing a Tutor */}
          {userType === 'student' && userData.user_type === 'tutor' && (
            <div className="bg-white p-6 rounded-md border mt-8 max-w-md w-full">
              <h2 className="text-xl font-semibold mb-4">Submit a Review</h2>

              <label className="block mb-2 font-medium">Rating</label>
              <select
                className="w-full p-2 border rounded mb-4"
                onChange={(e) => setRating(parseInt(e.target.value))}
              >
                {[5, 4, 3, 2, 1].map((star) => (
                  <option key={star} value={star}>
                    {star} Star{star > 1 ? 's' : ''}
                  </option>
                ))}
              </select>

              <label className="block mb-2 font-medium">Comment</label>
              <textarea
                className="w-full p-3 border rounded mb-4"
                rows="4"
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your review here..."
              />

              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded w-full"
                onClick={handleSubmitReview}
              >
                Submit Review
              </button>

              {submitStatus && (
                <p
                  className={`mt-2 text-center font-medium ${
                    submitStatus.includes('Failed') ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {submitStatus}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Profile;
