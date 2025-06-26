import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

export default function WhatsAppLikeMessaging() {
  const [userId, setUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesContainerRef = useRef(null); 
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user?.user_id) setUserId(user.user_id);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    axios.post('http://localhost:8000/api/conversations/', { user_id: userId })
      .then(res => setConversations(res.data))
      .catch(console.error);
    setActiveConversation(null);
    setMessages([]);
  }, [userId]);

  useEffect(() => {
    if (!activeConversation?.id) return;
  
    // Fetch messages immediately once
    const fetchMessages = () => {
      axios.post('http://localhost:8000/api/conversations/messages/', { conversation_id: activeConversation.id })
        .then(res => setMessages(res.data))
        .catch(console.error);
    };
  
    fetchMessages();
  
    // Poll every 20 seconds
    const intervalId = setInterval(fetchMessages, 1000);
  
    return () => clearInterval(intervalId);  // cleanup on unmount or activeConversation change
  }, [activeConversation]);  

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    axios.post('http://localhost:8000/api/users/search/', { keyword: searchTerm.trim() })
      .then(res => setSearchResults(res.data))
      .catch(console.error);
  };

  const startConversation = (otherUser) => {
    if (!userId) return alert('User not found. Please login.');
  
    const existingConv = conversations.find(c =>
      (c.user1.id === otherUser.id && c.user2.id === userId) ||
      (c.user2.id === otherUser.id && c.user1.id === userId)
    );
  
    setActiveConversation(existingConv || { id: null, user1: { id: userId }, user2: otherUser, messages: [] });
  
    // Clear messages if new conversation (no id)
    if (!existingConv) {
      setMessages([]);
    }
  
    setSearchResults([]);
    setSearchTerm('');
  };  

  const sendMessage = () => {
    if (!newMessage.trim() || !userId || !activeConversation) return;

    const receiverId = activeConversation.user1.id === userId
      ? activeConversation.user2.id
      : activeConversation.user1.id;

    axios.post('http://localhost:8000/api/messages/send/', {
      sender_id: userId,
      receiver_id: receiverId,
      content: newMessage.trim(),
    }).then(res => {
      if (!activeConversation.id) {
        axios.post('http://localhost:8000/api/conversations/', { user_id: userId })
          .then(res2 => {
            setConversations(res2.data);
            const conv = res2.data.find(c =>
              (c.user1.id === receiverId && c.user2.id === userId) ||
              (c.user2.id === receiverId && c.user1.id === userId)
            );
            setActiveConversation(conv);
          });
      } else {
        setMessages(prev => [...prev, res.data]);
      }
      setNewMessage('');
    }).catch(console.error);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!userId) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-600">
        <p>Please log in or set user info in localStorage under key <code>user</code> with a valid <code>user_id</code>.</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-160px)] flex items-center justify-center bg-gray-100 p-4 mt-20">
        <div className="w-full max-w-6xl h-[80vh] bg-white rounded-2xl shadow-lg flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-80 border-r border-gray-300 flex flex-col">
            <div className="p-3 border-b border-gray-300">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search or start new chat"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  className="w-full border border-gray-300 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z" />
                </svg>
              </div>
              {searchResults.length > 0 && (
                <div className="bg-white border border-green-500 rounded mt-2 max-h-60 overflow-y-auto shadow-lg">
                  {searchResults.map(user => (
                    <div key={user.id} className="flex items-center gap-3 px-4 py-2 hover:bg-green-100 cursor-pointer" onClick={() => startConversation(user)}>
                      <div className="bg-green-400 rounded-full w-8 h-8 flex items-center justify-center text-white font-bold">{user.username.charAt(0).toUpperCase()}</div>
                      <span className="text-gray-700 text-sm">{user.username}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex-grow overflow-y-auto">
              {conversations.length === 0 ? (
                <p className="text-center text-gray-500 mt-10 text-sm">No conversations yet</p>
              ) : (
                conversations.map(conv => {
                  const otherUser = conv.user1.id === userId ? conv.user2 : conv.user1;
                  const isActive = activeConversation?.id === conv.id;
                  return (
                    <div key={conv.id} onClick={() => setActiveConversation(conv)} className={`flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-green-100 border-l-4 ${isActive ? 'border-green-500 bg-green-50' : 'border-transparent'}`}>
                      <div className="bg-green-400 rounded-full w-12 h-12 flex items-center justify-center text-white font-bold text-xl">
                        {otherUser.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col flex-grow overflow-hidden">
                        <div className="font-semibold text-gray-800 truncate">{otherUser.username}</div>
                        <div className="text-gray-500 text-xs truncate mt-0.5">{conv.last_message ? conv.last_message.content : 'No messages yet'}</div>
                      </div>
                      {conv.last_message && (
                        <div className="text-xs text-gray-400 whitespace-nowrap ml-2">{formatTime(conv.last_message.timestamp)}</div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat area */}
          <div className="flex-1 flex flex-col">
            {activeConversation ? (
              <>
                <div className="flex items-center gap-4 border-b border-gray-300 p-4">
                  <div className="bg-green-400 rounded-full w-12 h-12 flex items-center justify-center text-white font-bold text-xl">
                    {(activeConversation.user1.id === userId ? activeConversation.user2.username.charAt(0) : activeConversation.user1.username.charAt(0)).toUpperCase()}
                  </div>
                  <div className="font-semibold text-lg text-gray-900 truncate">
                    {activeConversation.user1.id === userId ? activeConversation.user2.username : activeConversation.user1.username}
                  </div>
                </div>
                <div ref={messagesContainerRef} className="flex-grow overflow-y-auto px-6 py-4 space-y-3 bg-gray-50">
                  {messages.length === 0 ? (
                    <p className="text-center text-gray-400 mt-10 italic text-sm">No messages yet</p>
                  ) : (
                    messages.map(msg => {
                      const isSender = msg.sender.id === userId;
                      return (
                        <div key={msg.id} className={`flex max-w-xs break-words ${isSender ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}>
                          <div className={`px-4 py-2 rounded-lg text-sm whitespace-pre-wrap ${isSender ? 'bg-green-500 text-white rounded-br-none' : 'bg-white border border-gray-300 rounded-bl-none'}`}>
                            <div>{msg.content}</div>
                            <div className={`text-[10px] mt-1 ${isSender ? 'text-green-100 text-right' : 'text-gray-400 text-left'}`}>{formatTime(msg.timestamp)}</div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="p-4 border-t border-gray-300 flex items-center gap-3 bg-white">
                  <input
                    type="text"
                    placeholder="Type a message"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    className="flex-grow border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  />
                  <button onClick={sendMessage} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full transition">Send</button>
                </div>
              </>
            ) : (
              <div className="flex-grow flex items-center justify-center text-gray-400 italic select-none">
                Select a conversation or search users to start chatting
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
