import React from 'react';

const NotificationItem = ({ notification }) => {
  const handleNotificationClick = () => {
    if (notification.message.includes("job")) {
      window.location.href = "/jobs";
    }
  };

  return (
    <div
      className={`px-4 py-3 border-b border-gray-100 cursor-pointer transition-colors ${
        !notification.is_read ? 'bg-blue-50 hover:bg-blue-100' : 'bg-white hover:bg-gray-50'
      }`}
      key={notification.id}
      onClick={handleNotificationClick}
    >
      <div className="flex items-start">
        <div className={`flex-shrink-0 mt-1 mr-3 w-2 h-2 rounded-full ${
          !notification.is_read ? 'bg-blue-500' : 'bg-transparent'
        }`}></div>
        <div>
          <p className="text-sm text-gray-800">{notification.message}</p>
          <small className="text-xs text-gray-500">
            {new Date(notification.created_at).toLocaleString()}
          </small>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;