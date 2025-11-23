import React from 'react';
import PropTypes from 'prop-types';
import NotificationDropdown from './NotificationDropdown';

const DashboardHeader = ({ 
  user, 
  unreadNotificationCount, 
  notifications,
  showNotifications,
  onPostJobClick, 
  onBuyCreditsClick,
  onToggleNotifications,
  onMarkNotificationsRead,
  unreadMessagesCount
}) => {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Welcome back, {user?.first_name}
        </h1>
        <p className="mt-2 text-gray-500 text-lg">Manage your learning journey and connect with tutors.</p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {/* Notifications Dropdown */}
        <NotificationDropdown
          notifications={notifications}
          unreadCount={unreadNotificationCount}
          isOpen={showNotifications}
          onToggle={onToggleNotifications}
          onMarkAsRead={onMarkNotificationsRead}
        />

        {/* Messages Button */}
        <button
          onClick={() => window.location.href = '/messages'}
          className="relative p-2 text-gray-400 hover:text-gray-500 transition-colors"
          aria-label="Messages"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          {unreadMessagesCount > 0 && (
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500" />
          )}
        </button>

        <div className="h-6 w-px bg-gray-200 mx-2 hidden sm:block"></div>

        {/* Post Job Button */}
        <button
          onClick={onPostJobClick}
          className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Post Job
        </button>

        {/* Buy Points Button */}
        <button
          onClick={onBuyCreditsClick}
          className="inline-flex items-center px-5 py-2.5 border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
        >
          <svg className="-ml-1 mr-2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Buy Points
        </button>
      </div>
    </div>
  );
};

DashboardHeader.propTypes = {
  user: PropTypes.object,
  unreadNotificationCount: PropTypes.number,
  notifications: PropTypes.array,
  showNotifications: PropTypes.bool,
  onPostJobClick: PropTypes.func.isRequired,
  onBuyCreditsClick: PropTypes.func.isRequired,
  onToggleNotifications: PropTypes.func.isRequired,
  onMarkNotificationsRead: PropTypes.func.isRequired,
  unreadMessagesCount: PropTypes.number,
};

export default DashboardHeader;