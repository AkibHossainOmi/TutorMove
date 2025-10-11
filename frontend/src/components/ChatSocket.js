import axios from 'axios';

export default class ChatSocket {
  constructor(userId, onMessage) {
    this.userId = userId;
    this.onMessage = onMessage;
    this.host = `${process.env.REACT_APP_WEBSOCKET_PROTOCOL}://${process.env.REACT_APP_WEBSOCKET_URL}`; // adjust if needed
    this.reconnectDelay = 1000;
    this.maxReconnectDelay = 16000;
    this.messageQueue = [];
    this.socket = null;
    this.connected = false;
    this.connecting = false;
    this.shouldReconnect = true;
    this.tokenRefreshAttempted = false; // to avoid multiple refresh tries

    this.connect();
  }

  async refreshToken() {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_WEBSOCKET_URL}/auth/token/refresh/`,
        {},
        { withCredentials: true }
      );
      const newAccessToken = response.data.access;
      localStorage.setItem('token', newAccessToken);
      this.tokenRefreshAttempted = true;
      console.log("[ChatSocket] Token refreshed");
      return true;
    } catch (err) {
      console.error("[ChatSocket] Token refresh failed:", err);
      return false;
    }
  }

  connect() {
    if (this.connected || this.connecting) {
      console.log("[ChatSocket] Already connected or connecting, skipping connect call");
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.error("[ChatSocket] No token found, cannot connect");
      return;
    }

    this.connecting = true;
    console.log("[ChatSocket] Connecting...");

    this.socket = new WebSocket(`${this.host}/ws/chat/${this.userId}/?token=${token}`);

    this.socket.onopen = () => {
      console.log("[ChatSocket] WebSocket connected");
      this.connected = true;
      this.connecting = false;
      this.reconnectDelay = 1000;
      this.tokenRefreshAttempted = false; // reset refresh flag on success

      while (this.messageQueue.length > 0) {
        const msg = this.messageQueue.shift();
        this.send(msg);
      }
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (this.onMessage) this.onMessage(data);
      } catch (err) {
        console.error("[ChatSocket] Invalid JSON from websocket:", event.data);
      }
    };

    this.socket.onclose = async (event) => {
      console.log("[ChatSocket] WebSocket closed:", event);

      this.connected = false;
      this.connecting = false;

      if (event.code === 403) {
        console.warn("[ChatSocket] Connection refused, likely token expired");

        if (!this.tokenRefreshAttempted) {
          const refreshed = await this.refreshToken();
          if (refreshed) {
            console.log("[ChatSocket] Reconnecting after token refresh");
            this.connect();
            return;
          } else {
            console.error("[ChatSocket] Token refresh failed, cannot reconnect");
            // Optionally notify user or redirect to login
          }
        }
      }

      if (this.shouldReconnect && event.code !== 1000) {
        console.warn(`[ChatSocket] WebSocket closed: code=${event.code}, reason=${event.reason}. Reconnecting in ${this.reconnectDelay}ms`);
        setTimeout(() => this.connect(), this.reconnectDelay);
        this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
      } else {
        console.log("[ChatSocket] WebSocket closed intentionally, no reconnect.");
      }
    };

    this.socket.onerror = (error) => {
      console.error("[ChatSocket] WebSocket error:", error);
      // window.location.href = '/login';
    };
  }

  send(data) {
    const message = JSON.stringify(data);
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message);
    } else {
      console.warn("[ChatSocket] WebSocket not open, queuing message");
      this.messageQueue.push(data);
    }
  }

  close() {
    this.shouldReconnect = false;
    if (this.socket) {
      this.socket.close(1000, "Normal Closure");
    }
  }
}
