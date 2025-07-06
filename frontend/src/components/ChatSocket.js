export default class ChatSocket {
  constructor(userId, onMessage) {
    this.userId = userId;
    this.onMessage = onMessage;
    this.host = "ws://127.0.0.1:8001";
    this.reconnectDelay = 1000;
    this.maxReconnectDelay = 16000;
    this.messageQueue = [];
    this.socket = null;
    this.connected = false;
    this.connecting = false;
    this.shouldReconnect = true;

    this.connect();
  }

  connect() {
    if (this.connected || this.connecting) {
      console.log("[ChatSocket] Already connected or connecting, skipping connect call");
      return;
    }

    this.connecting = true;
    console.log("[ChatSocket] Connecting...");

    this.socket = new WebSocket(`${this.host}/ws/chat/${this.userId}/`);

    this.socket.onopen = () => {
      console.log("[ChatSocket] WebSocket connected");
      this.connected = true;
      this.connecting = false;
      this.reconnectDelay = 1000;

      // Send any queued messages
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

    this.socket.onclose = (event) => {
      console.log("[ChatSocket] WebSocket closed:", event);

      this.connected = false;
      this.connecting = false;

      if (this.shouldReconnect && event.code !== 1000) { // 1000 = normal closure
        console.warn(`[ChatSocket] WebSocket closed: code=${event.code}, reason=${event.reason}. Reconnecting in ${this.reconnectDelay}ms`);
        setTimeout(() => this.connect(), this.reconnectDelay);
        this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
      } else {
        console.log("[ChatSocket] WebSocket closed intentionally, no reconnect.");
      }
    };

    this.socket.onerror = (error) => {
      console.error("[ChatSocket] WebSocket error:", error);
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
      this.socket.close(1000, "Normal Closure"); // Close normally
    }
  }
}
