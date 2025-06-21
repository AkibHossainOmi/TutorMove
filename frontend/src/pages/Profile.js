// src/pages/Profile.js

import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import RequestVerificationButton from '../components/RequestVerificationButton';

const Profile = () => {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Optionally, fetch fresh user info from API for up-to-date status
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/users/me/', {
          headers: token ? { Authorization: `Token ${token}` } : {},
        });
        setProfile(res.data);
      } catch (err) {
        setProfile(user); // fallback to context user if fetch fails
      }
      setLoading(false);
    };
    fetchProfile();
  }, [token, user]);

  if (loading) return <p>Loading...</p>;
  if (!profile) return <p>Profile not found.</p>;

  return (
    <div style={{ maxWidth: 500, margin: '30px auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
      <h2 style={{ marginBottom: 16 }}>Profile</h2>
      <div style={{ marginBottom: 10 }}>
        <strong>Username:</strong> {profile.username}
      </div>
      <div style={{ marginBottom: 10 }}>
        <strong>Email:</strong> {profile.email}
      </div>
      <div style={{ marginBottom: 10 }}>
        <strong>User Type:</strong> {profile.user_type}
      </div>
      <div style={{ marginBottom: 10 }}>
        <strong>Verified:</strong>{' '}
        {profile.is_verified ? (
          <span style={{ color: 'green', fontWeight: 500 }}>✅ Verified</span>
        ) : (
          <span style={{ color: '#888' }}>Not verified</span>
        )}
      </div>
      <div style={{ marginBottom: 10 }}>
        <strong>Trust Score:</strong> {profile.trust_score ?? 1.0}
      </div>
      {/* Verification Request Button */}
      <div style={{ marginTop: 24 }}>
        <RequestVerificationButton
          isVerified={profile.is_verified}
          verificationRequested={profile.verification_requested}
          onRequested={() => {
            // Re-fetch profile after requesting verification
            setProfile(prev => ({ ...prev, verification_requested: true }));
          }}
        />
      </div>
    </div>
  );
};

export default Profile;
