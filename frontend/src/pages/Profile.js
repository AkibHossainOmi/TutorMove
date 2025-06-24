import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaUser, FaEnvelope } from 'react-icons/fa';
import { MdVerifiedUser } from 'react-icons/md';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [userType, setUserType] = useState('');
  const [savedLocation, setSavedLocation] = useState('');    // Displayed location from profile
  const [locationInput, setLocationInput] = useState('');    // Input box state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateStatus, setUpdateStatus] = useState('');

  // Fetch user profile by POST request
  const fetchUserProfile = async () => {
    setLoading(true);
    setError(null);

    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      setError('User data not found in local storage. Please log in.');
      setLoading(false);
      return;
    }

    let user;
    try {
      user = JSON.parse(storedUser);
      if (!user?.user_id) throw new Error('User ID not found in localStorage.');
    } catch (e) {
      setError('Invalid user data in local storage. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      const authToken = localStorage.getItem('token');
      const response = await fetch('/api/profile/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { Authorization: `Token ${authToken}` }),
        },
        body: JSON.stringify({ id: user.user_id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to fetch profile: ${response.status}`);
      }

      const data = await response.json();
      setUserData(data);
      setUserType(data.user_type || '');
      setSavedLocation(data.location || '');
      setLocationInput(data.location || '');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle location update via POST request
  const handleUpdateLocation = async () => {
    if (!locationInput.trim()) {
      setUpdateStatus('Location cannot be empty.');
      return;
    }

    setUpdateStatus('Updating...');

    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      setUpdateStatus('User data not found in local storage.');
      return;
    }

    let user;
    try {
      user = JSON.parse(storedUser);
      if (!user?.user_id) throw new Error('User ID not found.');
    } catch {
      setUpdateStatus('Invalid user data in local storage.');
      return;
    }

    try {
      const authToken = localStorage.getItem('token');
      const response = await fetch('/api/profile/edit/', {
        method: 'POST', // Assuming backend expects POST here
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { Authorization: `Token ${authToken}` }),
        },
        body: JSON.stringify({ id: user.user_id, location: locationInput.trim() }),
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error('Unauthorized. Please log in again.');
        const errData = await response.json();
        throw new Error(errData.detail || `Failed to update location: ${response.status}`);
      }

      const updatedData = await response.json();
      setUserData(updatedData);
      setSavedLocation(updatedData.location || '');
      setLocationInput(updatedData.location || '');
      setUpdateStatus('Location updated successfully!');
      setTimeout(() => setUpdateStatus(''), 3000);
    } catch (err) {
      setUpdateStatus(`Error: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-blue-600 text-lg">
        Loading your profile...
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-lg">
        {error}
      </div>
    );

  if (!userData)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 text-lg">
        No user data found.
      </div>
    );

  return (
    <>
      <Navbar />
      <div style={{ height: '100px' }}></div>
      <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center font-sans">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 max-w-xl w-full p-8">
          <h1 className="text-3xl font-semibold text-gray-800 mb-8 text-center">Your Profile</h1>

          {/* User Info Display */}
          <div className="space-y-6">
            {[
              { label: 'Username', value: userData.username, icon: <FaUser /> },
              // { label: 'Email', value: userData.email || 'Not Provided', icon: <FaEnvelope /> },
              {
                label: 'User Type',
                value: userType ? userType.charAt(0).toUpperCase() + userType.slice(1) : 'Not Provided',
                icon: <MdVerifiedUser />,
              },
              { label: 'Location', value: savedLocation || 'Not Provided', icon: <FaMapMarkerAlt /> },
              { label: 'Credit Balance', value: `$${userData.credit_balance ?? '0.00'}`, icon: '💰' },
              { label: 'Trust Score', value: (userData.trust_score ?? 0).toFixed(1), icon: '⭐' },
            ].map(({ label, value, icon }) => (
              <div
                key={label}
                className="flex justify-between items-center bg-gray-100 p-4 rounded-md border border-gray-300"
              >
                <div className="text-sm font-medium flex items-center gap-2 text-gray-700">
                  {icon} {label}
                </div>
                <div className="text-gray-900 font-semibold text-lg">{value}</div>
              </div>
            ))}
          </div>

          {/* Location Update Section */}
          <div className="mt-8 bg-gray-50 p-6 rounded-md border border-gray-300">
            <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2 mb-4">
              <FaMapMarkerAlt /> Update Location
            </h2>
            <input
              type="text"
              className="w-full p-3 border-2 border-gray-300 rounded-md mb-4 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 transition"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              placeholder="e.g., Dhaka, Bangladesh"
            />
            <button
              onClick={handleUpdateLocation}
              className="bg-blue-600 text-white font-medium px-6 py-3 rounded-md hover:bg-blue-700 transition shadow-md w-full"
              disabled={updateStatus === 'Updating...'}
            >
              {updateStatus === 'Updating...' ? 'Updating...' : 'Save Location'}
            </button>
            {updateStatus && (
              <p
                className={`mt-4 text-center text-sm font-medium ${
                  updateStatus.toLowerCase().includes('error') ? 'text-red-600' : 'text-green-600'
                }`}
              >
                {updateStatus}
              </p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Profile;
