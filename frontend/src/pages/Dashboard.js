import React, { useEffect, useState } from 'react';
import StudentDashboard from './StudentDashboard';
import TeacherDashboard from './TeacherDashboard';

const Dashboard = () => {
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      setError('User not found. Please log in.');
      setLoading(false);
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      if (!user.user_type) {
        throw new Error('User type is missing.');
      }
      setUserType(user.user_type);
    } catch (e) {
      setError('Invalid user data in local storage.');
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-blue-600 text-lg">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-lg">
        {error}
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-6">
        {userType === 'student' && <StudentDashboard />}
        {userType === 'tutor' && <TeacherDashboard />}
        {userType !== 'student' && userType !== 'tutor' && (
          <div className="text-center text-gray-600 text-lg">Unknown user type.</div>
        )}
      </div>
    </>
  );
};

export default Dashboard;
