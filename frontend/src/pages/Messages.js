import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ChatSocket from '../components/ChatSocket';
import UnlockContactModal from '../components/UnlockContactModal';
import BuyCreditsModal from '../components/BuyCreditsModal';
import UnlockJobModal from '../components/UnlockJobModal';

export default function WhatsAppLikeMessaging() {
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
  const [showMobileSidebar, setShowMobileSidebar] = useState(true);

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
      setShowMobileSidebar(false);
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
          setShowMobileSidebar(false);
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
      setShowMobileSidebar(false);
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
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const handleBackToConversations = () => {
    setShowMobileSidebar(true);
    setActiveConversation(null);
  };

  return (
    <>
      <Navbar />
      
      {/* Main Chat Container - Responsive */}
      <div className="fixed top-16 left-0 right-0 bottom-0 flex overflow-hidden bg-gray-50">
        {/* Left Sidebar - Conversations List - Responsive */}
        <div className={`${
          showMobileSidebar ? 'block' : 'hidden'
        } md:block w-full md:w-96 bg-white border-r border-gray-200 flex flex-col absolute md:relative inset-0 md:inset-auto z-20 md:z-auto`}>
          {/* Sidebar Header */}
          <div className="p-3 md:p-4 border-b border-gray-200 bg-white flex-shrink-0">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Messages</h1>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
            
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-9 md:pl-10 pr-4 py-2 md:py-2.5 text-sm md:text-base bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {searchResults.length > 0 && (
              <div className="border-b border-gray-200">
                <div className="px-3 md:px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50">
                  Search Results
                </div>
                {searchResults.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => startConversation(u)}
                    className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100"
                  >
                    <img
                      src={u.avatar}
                      alt={u.username}
                      className="w-10 h-10 md:w-12 md:h-12 rounded-full ring-2 ring-white"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm md:text-base text-gray-900">{u.username}</div>
                      <div className="text-xs md:text-sm text-indigo-600 font-medium">Start conversation →</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div>
              {isLoading && conversations.length === 0 ? (
                <div className="flex justify-center items-center py-8 md:py-12">
                  <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-8 md:py-12 px-4">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3 md:mb-4 mx-auto">
                    <svg className="w-6 h-6 md:w-8 md:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1">No conversations yet</h3>
                  <p className="text-xs md:text-sm text-gray-500">Search for users above to start chatting</p>
                </div>
              ) : (
                conversations.map((conv) => {
                  const other = getOtherUser(conv);
                  const lastMsg = conv.last_message?.content || 'No messages yet';
                  const hasUnread = conv.has_unread && activeConversation?.id !== conv.id;
                  const isActive = activeConversation?.id === conv.id;

                  return (
                    <div
                      key={conv.id}
                      onClick={() => selectConversation(conv)}
                      className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 cursor-pointer transition-all border-b border-gray-100 ${
                        isActive 
                          ? 'bg-indigo-50 border-l-4 border-l-indigo-600' 
                          : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={other?.avatar}
                          alt={other?.username}
                          className="w-10 h-10 md:w-12 md:h-12 rounded-full ring-2 ring-white"
                        />
                        {hasUnread && (
                          <div className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 w-4 h-4 md:w-5 md:h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-bold">•</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <div className={`font-semibold text-sm md:text-base truncate ${hasUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                            {other?.username || 'Deleted User'}
                          </div>
                          <div className="text-xs text-gray-500 whitespace-nowrap ml-2">
                            {formatTime(conv.last_message?.timestamp)}
                          </div>
                        </div>
                        <div className={`text-xs md:text-sm truncate ${
                          hasUnread ? 'text-gray-900 font-medium' : 'text-gray-500'
                        }`}>
                          {lastMsg.length > 35 ? `${lastMsg.slice(0, 32)}...` : lastMsg}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Chat Area - Responsive */}
        <div className={`${
          !showMobileSidebar || activeConversation ? 'flex' : 'hidden'
        } md:flex flex-1 flex-col bg-white absolute md:relative inset-0 md:inset-auto z-10 md:z-auto`}>
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="px-3 md:px-6 py-3 md:py-4 bg-white border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                  {/* Back button for mobile */}
                  <button
                    onClick={handleBackToConversations}
                    className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <div className="relative flex-shrink-0">
                    <img
                      src={getOtherUser(activeConversation)?.avatar}
                      alt={getOtherUser(activeConversation)?.username}
                      className="w-9 h-9 md:w-11 md:h-11 rounded-full ring-2 ring-white shadow-sm"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-sm md:text-lg truncate">
                      {user ? (
                        <Link
                          to={user.user_type === 'student' ? `/tutors/${getOtherUser(activeConversation)?.id}` : `/students/${getOtherUser(activeConversation)?.id}`}
                          className="hover:text-indigo-600 transition-colors"
                        >
                          {getOtherUser(activeConversation)?.username}
                        </Link>
                      ) : (
                        'Unknown'
                      )}
                    </div>
                    <div className="text-xs md:text-sm text-gray-500">
                      {partnerTyping ? (
                        <span className="text-indigo-600 font-medium flex items-center gap-1">
                          <span className="flex gap-1">
                            <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                          </span>
                          <span className="ml-1">Typing</span>
                        </span>
                      ) : (
                        <span className="text-gray-500">Click name to view profile</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 md:gap-2">
                  <button className="p-1.5 md:p-2.5 hover:bg-gray-100 rounded-full transition-colors">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </button>
                  <button className="hidden md:block p-2.5 hover:bg-gray-100 rounded-full transition-colors">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button className="p-1.5 md:p-2.5 hover:bg-gray-100 rounded-full transition-colors">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div 
                ref={messageContainerRef}
                className="flex-1 overflow-y-auto p-3 md:p-6 bg-gradient-to-b from-gray-50 to-white"
              >
                <div className="max-w-4xl mx-auto space-y-3 md:space-y-4">
                  {messages.map((msg, index) => {
                    const isSelf = msg.sender.id === user?.user_id;
                    const showDate = index === 0 || 
                      formatDate(msg.timestamp) !== formatDate(messages[index - 1]?.timestamp);

                    return (
                      <React.Fragment key={msg.id}>
                        {showDate && (
                          <div className="flex justify-center my-4 md:my-6">
                            <div className="bg-white px-3 md:px-4 py-1 md:py-1.5 rounded-full text-xs font-medium text-gray-600 shadow-sm border border-gray-200">
                              {formatDate(msg.timestamp)}
                            </div>
                          </div>
                        )}
                        <div className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                          <div className={`flex items-end gap-1.5 md:gap-2 max-w-[85%] md:max-w-[70%] ${isSelf ? 'flex-row-reverse' : 'flex-row'}`}>
                            {!isSelf && (
                              <img
                                src={msg.sender.avatar || getOtherUser(activeConversation)?.avatar}
                                alt=""
                                className="w-6 h-6 md:w-8 md:h-8 rounded-full flex-shrink-0"
                              />
                            )}
                            <div className={`rounded-2xl px-3 md:px-4 py-2 md:py-2.5 shadow-sm ${
                              isSelf 
                                ? 'bg-indigo-600 text-white rounded-br-sm' 
                                : 'bg-white text-gray-900 rounded-bl-sm border border-gray-200'
                            }`}>
                              <div className="text-sm md:text-[15px] leading-relaxed break-words">{msg.content}</div>
                              <div className={`text-xs mt-1 flex items-center gap-1 md:gap-1.5 ${
                                isSelf ? 'text-indigo-200 justify-end' : 'text-gray-500'
                              }`}>
                                <span>{formatTime(msg.timestamp)}</span>
                                {isSelf && (
                                  <span className="text-xs md:text-sm">
                                    {msg.status === 'seen' ? (
                                      <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                                        <path d="M12.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-1-1a1 1 0 011.414-1.414l.293.293 7.293-7.293a1 1 0 011.414 0z"/>
                                      </svg>
                                    ) : msg.status === 'delivered' ? (
                                      <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                                        <path d="M12.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-1-1a1 1 0 011.414-1.414l.293.293 7.293-7.293a1 1 0 011.414 0z"/>
                                      </svg>
                                    ) : (
                                      <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                                      </svg>
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                  
                  {partnerTyping && (
                    <div className="flex justify-start">
                      <div className="flex items-end gap-1.5 md:gap-2">
                        <img
                          src={getOtherUser(activeConversation)?.avatar}
                          alt=""
                          className="w-6 h-6 md:w-8 md:h-8 rounded-full"
                        />
                        <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-3 md:px-4 py-2 md:py-3 shadow-sm">
                          <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Message Input */}
              <div className="px-3 md:px-6 py-3 md:py-4 bg-white border-t border-gray-200 flex-shrink-0">
                <div className="max-w-4xl mx-auto flex items-end gap-2 md:gap-3">
                  <button className="hidden md:block p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <div className="flex-1 bg-gray-100 rounded-3xl flex items-center px-3 md:px-4 py-1.5 md:py-2 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTyping();
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 bg-transparent focus:outline-none text-gray-900 placeholder-gray-500 text-sm md:text-[15px]"
                    />
                    <button className="p-1 md:p-1.5 text-gray-500 hover:text-indigo-600 rounded-full transition-colors">
                      <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className={`p-2 md:p-3 rounded-full transition-all flex-shrink-0 ${
                      newMessage.trim() 
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/50' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Empty Chat State */
            <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-white p-4">
              <div className="text-center max-w-md px-4 md:px-6">
                <div className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-4 md:mb-6 mx-auto shadow-xl">
                  <svg className="w-8 h-8 md:w-12 md:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-3">Welcome to Tutormove Messages</h2>
                <p className="text-gray-600 text-sm md:text-lg leading-relaxed">
                  Select a conversation from the left sidebar or search for users to start chatting.
                </p>
                {/* Show back button on mobile when no conversation is selected */}
                <button
                  onClick={handleBackToConversations}
                  className="md:hidden mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  View Conversations
                </button>
              </div>
            </div>
          )}
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
    </>
  );
}