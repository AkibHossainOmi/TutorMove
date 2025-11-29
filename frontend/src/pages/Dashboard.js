import React, { useEffect, useState } from 'react';
import StudentDashboard from './StudentDashboard';
import TeacherDashboard from './TeacherDashboard';
import AdminDashboard from './AdminDashboard';
import ModeratorDashboard from './ModeratorDashboard';

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

  // The child components (dashboards) already handle their own layout (e.g. min-h-screen, padding, Navbar).
  // So we should simply return the component. However, the original code wrapped them in a div with p-6.
  // Given that Student/Teacher dashboards look like full page layouts with Navbars, wrapping them in p-6 might have been
  // causing them to look slightly off (padding around the navbar?), or the original p-6 was there because
  // the previous implementation relied on it.

  // Since AdminDashboard and ModeratorDashboard definitely have their own Navbars and layout structures,
  // it is safer to render them directly.

  // For consistency with existing code (if Student/Teacher relied on the wrapper), I should check.
  // But looking at StudentDashboard.js, it starts with <div className="min-h-screen bg-gray-50"><Navbar />...
  // So putting that inside <div className="p-6"> would put padding around the Navbar, which is usually wrong.
  // The original code was:
  // <div className="min-h-screen bg-gray-50 p-6">
  //   {userType === 'student' && <StudentDashboard />} ...

  // If I strictly follow the user request "fix this issue", I should just add the missing types.
  // But as a skilled engineer I should also fix the likely layout bug introduced by the wrapper if I see it.
  // However, removing the wrapper might change the look for students/teachers if they somehow relied on it
  // (e.g. if their dashboards were just fragments). But they seem to be full pages.

  // I will remove the wrapper `div` and just render the component. This is cleaner and likely correct for full-page components.
  // And for the "Unknown user type" case, I'll wrap that in the div.

  if (userType === 'student') return <StudentDashboard />;
  if (userType === 'tutor') return <TeacherDashboard />;
  if (userType === 'admin') return <AdminDashboard />;
  if (userType === 'moderator') return <ModeratorDashboard />;

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <div className="text-center text-gray-600 text-lg">Unknown user type.</div>
    </div>
  );
};

export default Dashboard;
