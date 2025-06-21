class WebSocketService {
  constructor() {
    this.ws = null;
    this.subscribers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectTimeout = null;
    this.heartbeatInterval = null;
  }

  connect(url, token) {
    return new Promise((resolve, reject) => {
      try {
        // Include token in WebSocket URL for authentication
        const wsUrl = `${url}?token=${token}`;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          resolve();
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.cleanup();
          this.attemptReconnect(url, token);
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
      } catch (error) {
        console.error('Error creating WebSocket connection:', error);
        reject(error);
      }
    });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.cleanup();
    }
  }

  cleanup() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  attemptReconnect(url, token) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      this.reconnectTimeout = setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        this.connect(url, token).catch(() => {
          // If reconnection fails, the onclose handler will trigger another attempt
        });
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
      this.notifySubscribers('connection', { type: 'error', message: 'Connection lost' });
    }
  }

  startHeartbeat() {
    // Send ping every 30 seconds to keep connection alive
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' });
      }
    }, 30000);
  }

  subscribe(type, callback) {
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, new Set());
    }
    this.subscribers.get(type).add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(type);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.subscribers.delete(type);
        }
      }
    };
  }

  notifySubscribers(type, data) {
    const callbacks = this.subscribers.get(type);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in subscriber callback:', error);
        }
      });
    }
  }

  handleMessage(data) {
    switch (data.type) {
      case 'pong':
        // Handle heartbeat response
        break;
      case 'chat_message':
        this.notifySubscribers('chat', data);
        break;
      case 'notification':
        this.notifySubscribers('notification', data);
        break;
      case 'status_update':
        this.notifySubscribers('status', data);
        break;
      default:
        // Handle unknown message types
        console.warn('Unknown message type:', data.type);
    }
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(data));
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
        throw error;
      }
    } else {
      throw new Error('WebSocket is not connected');
    }
  }

  // Utility method to check connection status
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;

// Usage example:
/*
import websocketService from './websocketService';

// Connect to WebSocket server
await websocketService.connect('ws://localhost:8000/ws', 'your-auth-token');

// Subscribe to message types
const unsubscribeChat = websocketService.subscribe('chat', (data) => {
  console.log('Received chat message:', data);
});

const unsubscribeNotification = websocketService.subscribe('notification', (data) => {
  console.log('Received notification:', data);
});

// Send message
websocketService.send({
  type: 'chat_message',
  data: {
    message: 'Hello!',
    recipient: 'user123'
  }
});

// Cleanup when component unmounts
unsubscribeChat();
unsubscribeNotification();
websocketService.disconnect();
*/
