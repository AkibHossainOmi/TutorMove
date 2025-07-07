import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ChatSocket from '../components/ChatSocket';

export default function WhatsAppLikeMessagingWS() {
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [partnerTyping, setPartnerTyping] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const handleWSMessageRef = useRef(null); // Ref to latest WS message handler

  const location = useLocation();
  const usernameFromQuery = new URLSearchParams(location.search).get('username');

  // Helper: get the other participant of a conversation
  const getOtherUser = useCallback(
    (conv) => {
      return conv.participants
        ?.map((p) => ({
          id: p.id ?? p.user__id,
          username: p.username ?? p.user__username,
        }))
        .find((u) => u.id !== user?.user_id);
    },
    [user]
  );

  // Stable sendMessageWS
  const sendMessageWS = useCallback((msg) => {
    if (socketRef.current?.connected) {
      socketRef.current.send(msg);
    }
  }, []);

  // Main WS message handler
  const handleWSMessage = useCallback(
    (data) => {
      switch (data.type) {
        case 'chat.message':
          if (data.message.conversation_id === activeConversation?.id) {
            setMessages((prev) => [...prev, data.message]);
          }
          break;

        case 'chat.typing':
          setPartnerTyping(data.is_typing);
          if (data.is_typing) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => setPartnerTyping(false), 2000);
          }
          break;

        case 'chat.conversations':
          setConversations(data.conversations);
          break;

        case 'chat.messages':
          setMessages(data.messages);
          break;

        case 'chat.search_results':
          setSearchResults(data.results);
          break;

        case 'chat.conversation_started': {
          const conv = data.conversation;
          setActiveConversation(conv);
          setMessages([]);
          sendMessageWS({ type: 'chat.get_messages', conversation_id: conv.id });
          setConversations((prev) => (prev.some((c) => c.id === conv.id) ? prev : [conv, ...prev]));
          setSearchResults([]);
          setSearchTerm('');
          break;
        }

        default:
          break;
      }
    },
    [activeConversation, sendMessageWS]
  );

  // Keep ref updated with latest WS message handler
  useEffect(() => {
    handleWSMessageRef.current = handleWSMessage;
  }, [handleWSMessage]);

  // Load user once on mount
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  // Setup WebSocket once user is ready, only once
  useEffect(() => {
    if (!user || socketRef.current) return;

    const ws = new ChatSocket(user.user_id, (data) => {
      // Always call latest handler from ref
      handleWSMessageRef.current && handleWSMessageRef.current(data);
    });
    socketRef.current = ws;

    ws.socket.addEventListener('open', () => {
      sendMessageWS({ type: 'chat.get_conversations' });
    });

    return () => {
      ws.close();
      socketRef.current = null;
      clearTimeout(typingTimeoutRef.current);
    };
  }, [user, sendMessageWS]);

  // Scroll messages to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Perform initial search if URL param and user exist
  useEffect(() => {
    if (!user || !usernameFromQuery) return;
    sendMessageWS({ type: 'chat.search_user', keyword: usernameFromQuery });
  }, [user, usernameFromQuery, sendMessageWS]);

  // Send message to active conversation
  const sendMessage = useCallback(() => {
    if (!newMessage.trim() || !activeConversation) return;

    sendMessageWS({
      type: 'chat.message',
      conversation_id: activeConversation.id,
      content: newMessage.trim(),
    });
    setNewMessage('');
  }, [newMessage, activeConversation, sendMessageWS]);

  // Notify typing event to partner
  const handleTyping = useCallback(() => {
    if (!activeConversation) return;

    const partner = getOtherUser(activeConversation);
    if (!partner) return;

    sendMessageWS({ type: 'chat.typing', receiver_id: partner.id, is_typing: true });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      sendMessageWS({ type: 'chat.typing', receiver_id: partner.id, is_typing: false });
    }, 2000);
  }, [activeConversation, getOtherUser, sendMessageWS]);

  // Trigger user search on button or enter
  const handleSearch = useCallback(() => {
    if (!searchTerm.trim()) return;
    sendMessageWS({ type: 'chat.search_user', keyword: searchTerm.trim() });
  }, [searchTerm, sendMessageWS]);

  // Start a new conversation
  const startConversation = useCallback(
    (user) => {
      sendMessageWS({ type: 'chat.start_conversation', receiver_id: user.id });
    },
    [sendMessageWS]
  );

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-160px)] flex items-center justify-center bg-gray-100 p-4 mt-20">
        <div className="w-full max-w-6xl h-[80vh] bg-white rounded-2xl shadow-lg flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-80 border-r border-gray-300 flex flex-col">
            <div className="p-3 border-b">
              <input
                type="text"
                placeholder="Search users..."
                className="w-full border px-3 py-2 rounded"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              {searchResults.length > 0 && (
                <div className="mt-2 bg-white shadow rounded border max-h-64 overflow-y-auto">
                  {searchResults.map((u) => (
                    <div
                      key={u.id}
                      className="p-2 cursor-pointer hover:bg-green-100"
                      onClick={() => startConversation(u)}
                    >
                      {u.username}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex-grow overflow-y-auto">
              {conversations.map((conv) => {
                const other = getOtherUser(conv);
                console.log("Other user:", other);

                return (
                  <div
                    key={conv.id}
                    className={`p-3 cursor-pointer hover:bg-green-100 ${
                      activeConversation?.id === conv.id ? 'bg-green-50' : ''
                    }`}
                    onClick={() => {
                      setActiveConversation(conv);
                      sendMessageWS({ type: 'chat.get_messages', conversation_id: conv.id });
                    }}
                  >
                    {other?.username || 'Unknown'}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chat area */}
          <div className="flex-1 flex flex-col">
            {activeConversation ? (
              <>
                <div className="p-4 border-b font-semibold text-lg">
                  {getOtherUser(activeConversation)?.username}
                </div>
                <div className="flex-grow overflow-y-auto px-6 py-4 space-y-3 bg-gray-50">
                  {messages.map((msg) => {
                    const isSelf = msg.sender.id === user?.user_id;
                    return (
                      <div key={msg.id} className={`max-w-xs ${isSelf ? 'ml-auto' : ''}`}>
                        <div
                          className={`px-4 py-2 rounded-lg text-sm ${
                            isSelf
                              ? 'bg-green-500 text-white rounded-br-none'
                              : 'bg-white border border-gray-300 rounded-bl-none'
                          }`}
                        >
                          <div>{msg.content}</div>
                          <div className="text-[10px] mt-1 text-right text-gray-300">
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {partnerTyping && <div className="text-xs text-gray-400 italic">Typing...</div>}
                  <div ref={messagesEndRef} />
                </div>
                <div className="p-4 flex gap-3 border-t">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message"
                    className="flex-grow border border-gray-300 rounded-full px-4 py-2"
                  />
                  <button
                    onClick={sendMessage}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full"
                  >
                    Send
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-grow flex items-center justify-center text-gray-400 italic">
                Select a chat or search users to start messaging
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
