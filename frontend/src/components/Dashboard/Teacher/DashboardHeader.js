import React from 'react';
import TeacherVerificationBadge from './TeacherVerificationBadge';
import NotificationDropdown from './NotificationDropdown';

const DashboardHeader = ({ 
  user, 
  notifications, 
  unreadNotificationCount, 
  showNotifications, 
  toggleNotifications, 
  markNotificationsRead,
  handleCreateGigClick,
  handleNavigateToBuyCredits,
  unreadMessagesCount
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
      <div>
        <div className="flex items-center gap-4 mb-2">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Welcome back, {user?.username || 'Teacher'}!
          </h1>
          <TeacherVerificationBadge verified={false} />
        </div>
        <p className="text-gray-600">Manage your teaching gigs, applications, and jobs</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <NotificationDropdown 
          notifications={notifications}
          unreadNotificationCount={unreadNotificationCount}
          showNotifications={showNotifications}
          toggleNotifications={toggleNotifications}
          markNotificationsRead={markNotificationsRead}
        />

        <button
          onClick={() => window.location.href = '/messages'}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-xs hover:bg-gray-50 transition-colors relative"
        >
          <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
          </svg>
          {unreadMessagesCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
              {unreadMessagesCount}
            </span>
          )}
        </button>

        <button
          onClick={handleCreateGigClick}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          New Gig
        </button>
        
        <button
          onClick={handleNavigateToBuyCredits}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
          </svg>
          Buy Points
        </button>
      </div>
    </div>
  );
};

export default DashboardHeader;