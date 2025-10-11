import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ChatSocket from '../components/ChatSocket';
import UnlockContactModal from '../components/UnlockContactModal';
import BuyCreditsModal from '../components/BuyCreditsModal';
import UnlockJobModal from '../components/UnlockJobModal';

export default function ModernChatInterface() {
  const [showUnlockJobModal, setShowUnlockJobModal] = useState(false);
  const [unlockJobUserId, setUnlockJobUserId] = useState(null);
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockTutorId, setUnlockTutorId] = useState(null);
  const [showBuyCreditsModal, setShowBuyCreditsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const socketRef = useRef(null);
  const messageContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const handleWSMessageRef = useRef(null);

  const location = useLocation();
  const usernameFromQuery = new URLSearchParams(location.search).get('username');

  const sendMessageWS = useCallback((msg) => {
    if (socketRef.current?.connected) {
      socketRef.current.send(msg);
    }
  }, []);

  const getOtherUser = useCallback(
    (conv) =>
      conv.participants
        ?.map((p) => ({
          id: p.id ?? p.user__id,
          username: p.username ?? p.user__username,
          avatar: p.avatar || `https://ui-avatars.com/api/?name=${p.username ?? p.user__username}&background=6366f1&color=fff`
        }))
        .find((u) => u.id !== user?.user_id),
    [user]
  );

  const startConversation = useCallback(
    (targetUser) => {
      sendMessageWS({ type: 'chat.start_conversation', receiver_id: targetUser.id });
    },
    [sendMessageWS]
  );

  const handleWSMessage = useCallback(
    (data) => {
      switch (data.type) {
        case 'chat.message': {
          const incomingConvId = data.message.conversation_id;
          const isFromOther = data.message.sender.id !== user?.user_id;
          const convExists = conversations.some((c) => c.id === incomingConvId);
          
          if (!convExists) {
            const newConv = {
              id: incomingConvId,
              participants: [data.message.sender, user],
              last_message: data.message,
              has_unread: isFromOther,
            };
            setConversations((prev) => [newConv, ...prev]);
          } else {
            setConversations((prev) =>
              prev.map((conv) =>
                conv.id === incomingConvId ? { ...conv, last_message: data.message } : conv
              )
            );
          }

          const isActive = incomingConvId === activeConversation?.id;
          if (isActive) {
            setMessages((prev) => [
              ...prev,
              {
                ...data.message,
                status: isFromOther ? 'delivered' : 'sent',
              },
            ]);
            if (isFromOther) {
              sendMessageWS({ type: 'chat.delivered', message_id: data.message.id });
              sendMessageWS({ type: 'chat.read', conversation_id: incomingConvId });
              setConversations((prev) =>
                prev.map((conv) =>
                  conv.id === incomingConvId ? { ...conv, has_unread: false } : conv
                )
              );
            }
          } else if (isFromOther) {
            setConversations((prev) =>
              prev.map((conv) =>
                conv.id === incomingConvId ? { ...conv, has_unread: true } : conv
              )
            );
          }
          break;
        }
        case 'chat.unlock':
          if (user?.user_type === 'tutor') {
            setUnlockJobUserId(data.student_id);
            setShowUnlockJobModal(true);
          } else {
            setUnlockTutorId(data.tutor_id);
            setShowUnlockModal(true);
          }
          break;
        case 'chat.conversations':
          setConversations(data.conversations);
          setIsLoading(false);
          break;
        case 'chat.messages':
          setMessages(data.messages);
          break;
        case 'chat.typing':
          setPartnerTyping(data.is_typing);
          if (data.is_typing) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => setPartnerTyping(false), 2000);
          }
          break;
        case 'chat.conversation_started': {
          const conv = data.conversation;
          setActiveConversation(conv);
          setMessages([]);
          sendMessageWS({ type: 'chat.get_messages', conversation_id: conv.id });
          setConversations((prev) => (prev.some((c) => c.id === conv.id) ? prev : [conv, ...prev]));
          sendMessageWS({ type: 'chat.read', conversation_id: conv.id });
          setConversations((prev) =>
            prev.map((c) => (c.id === conv.id ? { ...c, has_unread: false } : c))
          );
          setSearchTerm('');
          setSearchResults([]);
          break;
        }
        case 'chat.read':
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === data.conversation_id ? { ...conv, has_unread: false } : conv
            )
          );
          break;
        case 'chat.message_status':
          setMessages((prev) =>
            prev.map((msg) =>
              Number(msg.id) === Number(data.message_id)
                ? {
                    ...msg,
                    status: data.status,
                    is_read: data.status === 'seen',
                  }
                : msg
            )
          );
          break;
        case 'chat.search_results':
          setSearchResults(data.results);
          setIsLoading(false);

          if (usernameFromQuery) {
            const targetUser = data.results.find(u => u.username === usernameFromQuery);
            if (targetUser) {
              startConversation(targetUser);
            }
          }
          break;
        default:
          break;
      }
    },
    [activeConversation, conversations, sendMessageWS, user, usernameFromQuery, startConversation]
  );

  useEffect(() => {
    handleWSMessageRef.current = handleWSMessage;
  }, [handleWSMessage]);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) setUser(JSON.parse(userStr));
  }, []);

  useEffect(() => {
    if (!user || socketRef.current) return;
    const ws = new ChatSocket(user.user_id, (data) => handleWSMessageRef.current?.(data));
    socketRef.current = ws;
    const onOpen = () => {
      setIsLoading(true);
      sendMessageWS({ type: 'chat.get_conversations' });
      if (usernameFromQuery) {
        setIsLoading(true);
        sendMessageWS({ type: 'chat.search_user', keyword: usernameFromQuery });
      }
    };
    ws.socket.addEventListener('open', onOpen);
    return () => {
      ws.socket.removeEventListener('open', onOpen);
      ws.close();
      socketRef.current = null;
      clearTimeout(typingTimeoutRef.current);
    };
  }, [user, sendMessageWS, usernameFromQuery]);

  useEffect(() => {
    const container = messageContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, partnerTyping]);

  const sendMessage = useCallback(() => {
    if (!newMessage.trim() || !activeConversation) return;
    sendMessageWS({
      type: 'chat.message',
      conversation_id: activeConversation.id,
      content: newMessage.trim(),
    });
    setNewMessage('');
  }, [newMessage, activeConversation, sendMessageWS]);

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

  const handleSearch = useCallback(() => {
    if (searchTerm.trim()) {
      setIsLoading(true);
      sendMessageWS({ type: 'chat.search_user', keyword: searchTerm.trim() });
    }
  }, [searchTerm, sendMessageWS]);

  const selectConversation = useCallback(
    (conv) => {
      setActiveConversation(conv);
      sendMessageWS({ type: 'chat.get_messages', conversation_id: conv.id });
      sendMessageWS({ type: 'chat.read', conversation_id: conv.id });
      setConversations((prev) =>
        prev.map((c) => (c.id === conv.id ? { ...c, has_unread: false } : c))
      );
    },
    [sendMessageWS]
  );

  const handleUnlockSuccess = useCallback(() => {
    if (!unlockTutorId) return;
    sendMessageWS({ type: 'chat.start_conversation', receiver_id: unlockTutorId });
    setShowUnlockModal(false);
  }, [sendMessageWS, unlockTutorId]);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-20">
        <div className="max-w-7xl mx-auto h-[calc(100vh-120px)] p-4">
          <div className="bg-white rounded-2xl shadow-xl h-full flex overflow-hidden">
            {/* Sidebar */}
            <div className="w-96 border-r border-slate-200 flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                </div>
                
                {/* Search */}
                <div className="relative mt-4">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-10 pr-4 py-3 bg-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto">
                {searchResults.length > 0 && (
                  <div className="p-4 border-b border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-600 mb-2">Search Results</h3>
                    {searchResults.map((u) => (
                      <div
                        key={u.id}
                        onClick={() => startConversation(u)}
                        className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                      >
                        <img
                          src={u.avatar || `https://ui-avatars.com/api/?name=${u.username}&background=6366f1&color=fff`}
                          alt={u.username}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-slate-900">{u.username}</div>
                          <div className="text-sm text-slate-500">Start conversation</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="p-2">
                  {isLoading && conversations.length === 0 ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <p>No conversations yet</p>
                    </div>
                  ) : (
                    conversations.map((conv) => {
                      const other = getOtherUser(conv);
                      const lastMsg = conv.last_message?.content || 'No messages yet';
                      const hasUnread = conv.has_unread && activeConversation?.id !== conv.id;

                      return (
                        <div
                          key={conv.id}
                          onClick={() => selectConversation(conv)}
                          className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all ${
                            activeConversation?.id === conv.id 
                              ? 'bg-blue-50 border border-blue-100' 
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="relative">
                            <img
                              src={other?.avatar}
                              alt={other?.username}
                              className="w-12 h-12 rounded-full"
                            />
                            {hasUnread && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className={`font-semibold truncate ${hasUnread ? 'text-slate-900' : 'text-slate-700'}`}>
                                {other?.username || 'Unknown'}
                              </div>
                              <div className="text-xs text-slate-500">
                                {formatTime(conv.last_message?.timestamp)}
                              </div>
                            </div>
                            <div className={`text-sm truncate ${hasUnread ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
                              {lastMsg.length > 50 ? `${lastMsg.slice(0, 47)}...` : lastMsg}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {activeConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="border-b border-slate-200 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img
                          src={getOtherUser(activeConversation)?.avatar}
                          alt={getOtherUser(activeConversation)?.username}
                          className="w-12 h-12 rounded-full"
                        />
                        <div>
                          <h2 className="text-lg font-semibold text-slate-900">
                            {getOtherUser(activeConversation)?.username || 'Unknown'}
                          </h2>
                          <div className="text-sm text-slate-500 flex items-center gap-1">
                            {partnerTyping ? (
                              <>
                                <div className="flex gap-1">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                </div>
                                <span>Typing...</span>
                              </>
                            ) : (
                              <span>Online</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div 
                    ref={messageContainerRef}
                    className="flex-1 overflow-y-auto bg-slate-50 p-6 space-y-4"
                  >
                    {messages.map((msg) => {
                      const isSelf = msg.sender.id === user?.user_id;
                      return (
                        <div key={msg.id} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] ${isSelf ? 'ml-auto' : 'mr-auto'}`}>
                            <div className={`rounded-2xl px-4 py-3 ${
                              isSelf 
                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-md' 
                                : 'bg-white border border-slate-200 rounded-bl-md'
                            }`}>
                              <div className="text-sm leading-relaxed">{msg.content}</div>
                              <div className={`flex items-center gap-2 mt-1 text-xs ${
                                isSelf ? 'text-blue-100' : 'text-slate-400'
                              }`}>
                                <span>{formatTime(msg.timestamp)}</span>
                                {isSelf && (
                                  <span className="flex items-center">
                                    {msg.status === 'seen' ? 'Seen' : msg.status === 'delivered' ? 'Delivered' : 'Sent'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Message Input */}
                  <div className="border-t border-slate-200 p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 bg-white border border-slate-200 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => {
                            setNewMessage(e.target.value);
                            handleTyping();
                          }}
                          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                          placeholder="Type a message..."
                          className="w-full focus:outline-none text-slate-700 placeholder-slate-400"
                        />
                      </div>
                      <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className={`p-3 rounded-xl transition-all ${
                          newMessage.trim() 
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105' 
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* Empty State */
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
                  <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-600 mb-2">No conversation selected</h3>
                  <p className="text-slate-500 text-center max-w-md">
                    Choose a conversation from the sidebar or search for users to start messaging
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <UnlockContactModal
        show={showUnlockModal}
        tutorId={unlockTutorId}
        onClose={() => setShowUnlockModal(false)}
        onUnlockSuccess={handleUnlockSuccess}
        onNeedBuyCredits={() => {
          setShowUnlockModal(false);
          setShowBuyCreditsModal(true);
        }}
      />

      <UnlockJobModal
        show={showUnlockJobModal}
        studentId={unlockJobUserId}
        onClose={() => setShowUnlockJobModal(false)}
        onJobUnlocked={() => {
          sendMessageWS({ type: 'chat.start_conversation', receiver_id: unlockJobUserId });
          setShowUnlockJobModal(false);
        }}
      />

      <BuyCreditsModal
        show={showBuyCreditsModal}
        onClose={() => setShowBuyCreditsModal(false)}
        onBuyCredits={() => {
          setShowBuyCreditsModal(false);
          window.location.href = '/buy-points';
        }}
        message="You don't have enough points to unlock this contact."
      />

      <Footer />
    </>
  );
}