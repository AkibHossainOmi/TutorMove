import React, { memo } from 'react';
import PropTypes from 'prop-types';

const NotificationItem = memo(({ notification, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`px-4 py-3 border-b border-gray-100 cursor-pointer transition-colors duration-200 ${
        !notification.is_read ? 'bg-blue-50 hover:bg-blue-100' : 'bg-white hover:bg-gray-50'
      }`}
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
});

NotificationItem.propTypes = {
  notification: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    message: PropTypes.string.isRequired,
    is_read: PropTypes.bool.isRequired,
    created_at: PropTypes.string.isRequired,
  }).isRequired,
  onClick: PropTypes.func,
};

NotificationItem.defaultProps = {
  onClick: () => {},
};

export default NotificationItem;