import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import websocketService from '../utils/websocketService';
import apiService from '../utils/apiService'; // Assumes you have an API service for REST calls
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);

  // Connect websocket when user and token are available
  useEffect(() => {
    if (user && token) {
      const wsUrl = `ws://localhost:8000/ws/chat/`;
      websocketService.connect(wsUrl, token).catch(console.error);

      // Subscribe to chat messages
      const unsubscribeChat = websocketService.subscribe('chat', (data) => {
        // Only append if message belongs to active conversation
        if (
          activeConversation &&
          (data.conversation_id === activeConversation.id)
        ) {
          setMessages((prev) => [...prev, data]);
        }
      });

      // Subscribe to notifications if needed
      const wsNotifUrl = `ws://localhost:8000/ws/notifications/`;
      websocketService.connect(wsNotifUrl, token).catch(console.error);
      const unsubscribeNotif = websocketService.subscribe('notification', (data) => {
        // Handle notifications (optional)
        console.log('Notification received:', data);
      });

      return () => {
        unsubscribeChat();
        unsubscribeNotif();
        websocketService.disconnect(wsUrl);
        websocketService.disconnect(wsNotifUrl);
      };
    }
  }, [user, token, activeConversation]);

  // Load previous messages when opening a chat
  const openChat = useCallback(async (conversation) => {
    setActiveConversation(conversation);
    setIsChatOpen(true);
    // Fetch previous messages from API
    try {
      const res = await apiService.get(`/chat/conversations/${conversation.id}/messages/`);
      setMessages(res || []);
    } catch (err) {
      setMessages([]);
    }
  }, []);

  const closeChat = useCallback(() => {
    setIsChatOpen(false);
    setActiveConversation(null);
    setMessages([]);
  }, []);

  const sendMessage = useCallback((message, receiverId) => {
    if (websocketService.isConnected()) {
      websocketService.send({
        type: 'chat_message',
        message,
        receiver_id: receiverId,
        conversation_id: activeConversation ? activeConversation.id : null,
      });
      // Optionally add the sent message to messages state
      setMessages((prev) => [
        ...prev,
        { message, sender_id: user.id, conversation_id: activeConversation ? activeConversation.id : null }
      ]);
    } else {
      console.error('WebSocket is not connected');
    }
  }, [user, activeConversation]);

  return (
    <ChatContext.Provider
      value={{
        isChatOpen,
        activeConversation,
        messages,
        openChat,
        closeChat,
        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);