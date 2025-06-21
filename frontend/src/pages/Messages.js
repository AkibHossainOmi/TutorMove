import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/messages/conversations/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setConversations(response.data);
      } catch (err) {
        setError('Failed to load conversations.');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  const fetchMessages = async (conversationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/messages/conversations/${conversationId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data);
      setSelectedConversation(conversationId);
    } catch (err) {
      setError('Failed to load messages.');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/messages/', {
        conversation: selectedConversation,
        content: newMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNewMessage('');
      // Refresh messages
      fetchMessages(selectedConversation);
    } catch (err) {
      setError('Failed to send message.');
    }
  };

  if (loading) return <p>Loading messages...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ display: 'flex', height: '500px' }}>
      {/* Conversations List */}
      <div style={{ width: '30%', borderRight: '1px solid #ccc', padding: '10px' }}>
        <h3>Conversations</h3>
        {conversations.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {conversations.map((conv) => (
              <li 
                key={conv.id} 
                onClick={() => fetchMessages(conv.id)}
                style={{ 
                  padding: '10px', 
                  cursor: 'pointer',
                  backgroundColor: selectedConversation === conv.id ? '#f0f0f0' : 'white'
                }}
              >
                {conv.other_user}
              </li>
            ))}
          </ul>
        ) : (
          <p>No conversations yet.</p>
        )}
      </div>

      {/* Messages Area */}
      <div style={{ width: '70%', padding: '10px' }}>
        {selectedConversation ? (
          <>
            <div style={{ height: '400px', overflowY: 'scroll', border: '1px solid #ccc', padding: '10px' }}>
              {messages.map((msg) => (
                <div key={msg.id} style={{ marginBottom: '10px' }}>
                  <strong>{msg.sender}:</strong> {msg.content}
                  <br />
                  <small>{new Date(msg.timestamp).toLocaleString()}</small>
                </div>
              ))}
            </div>
            
            <div style={{ marginTop: '10px', display: 'flex' }}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                style={{ flex: 1, padding: '5px' }}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button onClick={sendMessage} style={{ marginLeft: '5px' }}>
                Send
              </button>
            </div>
          </>
        ) : (
          <p>Select a conversation to view messages.</p>
        )}
      </div>
    </div>
  );
};

export default Messages;
