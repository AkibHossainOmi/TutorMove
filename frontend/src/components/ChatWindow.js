import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';

const ChatWindow = ({
  onClose,
  isOpen = true,
}) => {
  const { activeConversation, currentUser, messages, sendMessage } = useChat();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // If not open or no active conversation, do not render
  if (!isOpen || !activeConversation) return null;

  // Handler to send a message
  const handleSend = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage(newMessage); // should take content, context will handle WebSocket
      setNewMessage('');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '350px',
      height: '500px',
      backgroundColor: 'white',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000
    }}>
      {/* Header */}
      <div style={{
        padding: '15px',
        borderBottom: '1px solid #dee2e6',
        backgroundColor: '#007bff',
        color: 'white',
        borderRadius: '8px 8px 0 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h4 style={{ margin: 0, fontSize: '16px' }}>
          Chat with {activeConversation?.partnerName || 'User'}
        </h4>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '0',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        padding: '15px',
        overflowY: 'auto',
        backgroundColor: '#f8f9fa'
      }}>
        {(!messages || messages.length === 0) ? (
          <div style={{ textAlign: 'center', color: '#6c757d' }}>
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              style={{
                marginBottom: '10px',
                display: 'flex',
                justifyContent: message.sender === currentUser.id ? 'flex-end' : 'flex-start'
              }}
            >
              <div
                style={{
                  maxWidth: '70%',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  backgroundColor: message.sender === currentUser.id ? '#007bff' : 'white',
                  color: message.sender === currentUser.id ? 'white' : '#212529',
                  border: message.sender === currentUser.id ? 'none' : '1px solid #dee2e6',
                  fontSize: '14px',
                  lineHeight: '1.4'
                }}
              >
                <div>{message.content}</div>
                <div style={{
                  fontSize: '11px',
                  opacity: 0.7,
                  marginTop: '4px'
                }}>
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} style={{
        padding: '15px',
        borderTop: '1px solid #dee2e6',
        display: 'flex',
        gap: '10px'
      }}>
        <input
          type="text"
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: '8px 12px',
            border: '1px solid #dee2e6',
            borderRadius: '20px',
            fontSize: '14px',
            outline: 'none'
          }}
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
            fontSize: '14px',
            opacity: newMessage.trim() ? 1 : 0.6
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
