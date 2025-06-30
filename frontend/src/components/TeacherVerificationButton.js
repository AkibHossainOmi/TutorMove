import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const TeacherVerificationButton = () => {
  const { user, refreshUser } = useAuth();
  const { showNotification } = useNotification();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!user || user.user_type !== 'teacher') return null;
  if (user.is_verified) return <span style={{ color: '#28a745', fontWeight: 600 }}>✔️ Verified</span>;
  if (user.verification_requested) return <span style={{ color: '#fd7e14', fontWeight: 600 }}>Verification Requested</span>;

  const requestVerification = async () => {
    setLoading(true);
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/users/request_verification/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      showNotification('Verification request sent! You will be notified after review.', 'success');
      setShowModal(false);
      refreshUser && refreshUser();
    } catch (e) {
      showNotification('Failed to submit request. Try again.', 'error');
    }
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        style={{
          padding: '9px 18px',
          background: '#6f42c1',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer'
        }}
      >
        Request Verification
      </button>
      {showModal && (
        <div style={{
          position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.2)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: 'white', borderRadius: 8, padding: 32, minWidth: 330, textAlign: 'center'
          }}>
            <h3>Submit Verification Request</h3>
            <p>Submit your profile for admin review. You’ll be notified after approval.</p>
            <button
              onClick={requestVerification}
              disabled={loading}
              style={{ background: '#007bff', color: '#fff', padding: '8px 22px', borderRadius: 4, border: 'none', fontWeight: 500, marginRight: 8 }}
            >{loading ? 'Submitting...' : 'Submit'}</button>
            <button
              onClick={() => setShowModal(false)}
              style={{ background: '#6c757d', color: '#fff', padding: '8px 22px', borderRadius: 4, border: 'none', fontWeight: 500 }}
            >Cancel</button>
          </div>
        </div>
      )}
    </>
  );
};
export default TeacherVerificationButton;
