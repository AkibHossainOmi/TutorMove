import React from 'react';
import NotificationItem from './NotificationItem';

const NotificationDropdown = ({ 
  notifications, 
  unreadNotificationCount, 
  showNotifications, 
  toggleNotifications, 
  markNotificationsRead 
}) => {
  return (
    <div className="relative">
      <button
        onClick={toggleNotifications}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-xs hover:bg-gray-50 transition-colors relative"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
        </svg>
        {unreadNotificationCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
            {unreadNotificationCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No new notifications</div>
            ) : (
              notifications.map((notif) => (
                <NotificationItem key={notif.id} notification={notif} />
              ))
            )}
          </div>
          <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 text-right">
            <button
              onClick={() => window.location.href = '/notifications'}
              className="text-xs font-medium text-blue-600 hover:text-blue-800"
            >
              View all
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;