import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import NotificationToast from '../components/NotificationToast';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      connectWebSocket(token);
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const connectWebSocket = (token) => {
    const wsUrl = `ws://localhost:8000/ws/notifications/?token=${token}`;
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('Notification WebSocket connected');
      setIsConnected(true);
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'notification') {
        addNotification(data.message, data.notificationType || 'info');
      }
    };

    wsRef.current.onclose = () => {
      console.log('Notification WebSocket disconnected');
      setIsConnected(false);
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        if (localStorage.getItem('token')) {
          connectWebSocket(localStorage.getItem('token'));
        }
      }, 5000);
    };

    wsRef.current.onerror = (error) => {
      console.error('Notification WebSocket error:', error);
      setIsConnected(false);
    };
  };

  const addNotification = (message, type = 'info', duration = 5000) => {
    const id = Date.now();
    const notification = {
      id,
      message,
      type,
      duration
    };

    setNotifications(prev => [...prev, notification]);

    // Remove notification after duration
    setTimeout(() => {
      removeNotification(id);
    }, duration);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const value = {
    notifications,
    addNotification,
    removeNotification,
    isConnected
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {notifications.map(notification => (
          <NotificationToast
            key={notification.id}
            message={notification.message}
            type={notification.type}
            duration={notification.duration}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Utility function to format notification messages
export const formatNotification = {
  newMessage: (sender) => `New message from ${sender}`,
  jobApplication: (job) => `New application for "${job}"`,
  creditPurchase: (amount) => `Successfully purchased ${amount} credits`,
  jobPosted: (title) => `Your job "${title}" has been posted successfully`,
  applicationAccepted: (job) => `Your application for "${job}" has been accepted`,
  applicationRejected: (job) => `Your application for "${job}" has been rejected`,
  profileUpdate: () => 'Profile updated successfully',
  error: (message) => `Error: ${message}`,
};
