
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ReferralHandler = () => {
  const { username } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (username) {
      // Navigate to signup page with the referrer username in state
      navigate('/signup', { state: { referrer_username: username } });
    } else {
      navigate('/');
    }
  }, [username, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">Redirecting to signup...</p>
    </div>
  );
};

export default ReferralHandler;
