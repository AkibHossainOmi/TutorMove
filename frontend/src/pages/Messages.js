// src/pages/Messages.js
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ChatSocket from '../components/ChatSocket';
import UnlockContactModal from '../components/UnlockContactModal';
import BuyCreditsModal from '../components/BuyCreditsModal';
import UnlockJobModal from '../components/UnlockJobModal';
import { Search, Send, Smile, Paperclip, MoreVertical, ArrowLeft, Lock } from 'lucide-react';

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
      <div className="fixed top-16 left-0 right-0 bottom-0 flex overflow-hidden bg-slate-50">
        {/* Left Sidebar - Conversations List - Responsive */}
        <div className={`${
          showMobileSidebar ? 'flex' : 'hidden'
        } md:flex flex-col w-full md:w-96 bg-white border-r border-slate-200 shadow-sm z-20`}>

          {/* Sidebar Header */}
          <div className="p-4 border-b border-slate-200 bg-white">
            <h1 className="text-xl font-bold text-slate-800 mb-4">Messages</h1>
            
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-9 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-500"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {searchResults.length > 0 && (
              <div className="border-b border-slate-100">
                <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide bg-slate-50">
                  Search Results
                </div>
                {searchResults.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => startConversation(u)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-100 last:border-0"
                  >
                    <img
                      src={u.avatar}
                      alt={u.username}
                      className="w-10 h-10 rounded-full ring-2 ring-white shadow-sm"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900">{u.username}</div>
                      <div className="text-xs text-indigo-600 font-medium">Start conversation →</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div>
              {isLoading && conversations.length === 0 ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-600 border-t-transparent"></div>
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Search className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 mb-1">No conversations yet</h3>
                  <p className="text-sm text-slate-500">Search for users above to start chatting</p>
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
                      className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-all border-b border-slate-50 ${
                        isActive 
                          ? 'bg-indigo-50 border-l-4 border-l-indigo-600 pl-3'
                          : 'hover:bg-slate-50 border-l-4 border-l-transparent pl-3'
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={other?.avatar}
                          alt={other?.username}
                          className="w-11 h-11 rounded-full ring-2 ring-white shadow-sm object-cover"
                        />
                        {hasUnread && (
                          <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-indigo-600 rounded-full ring-2 ring-white"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className={`font-semibold text-sm truncate ${hasUnread ? 'text-slate-900' : 'text-slate-700'}`}>
                            {other?.username || 'Deleted User'}
                          </div>
                          <div className="text-xs text-slate-400 whitespace-nowrap ml-2">
                            {formatTime(conv.last_message?.timestamp)}
                          </div>
                        </div>
                        <div className={`text-xs truncate ${
                          hasUnread ? 'text-slate-800 font-medium' : 'text-slate-500'
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
        } md:flex flex-1 flex-col bg-white w-full h-full relative z-10`}>
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between flex-shrink-0 shadow-sm z-20">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Back button for mobile */}
                  <button
                    onClick={handleBackToConversations}
                    className="md:hidden p-2 hover:bg-slate-100 rounded-full transition-colors -ml-2"
                  >
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                  </button>
                  
                  <div className="relative flex-shrink-0">
                    <img
                      src={getOtherUser(activeConversation)?.avatar}
                      alt={getOtherUser(activeConversation)?.username}
                      className="w-10 h-10 rounded-full ring-2 ring-slate-100 object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 text-sm md:text-base truncate">
                      {user ? (
                        <Link
                          to={`/profile/${getOtherUser(activeConversation)?.username}`}
                          className="hover:text-indigo-600 transition-colors"
                        >
                          {getOtherUser(activeConversation)?.username}
                        </Link>
                      ) : (
                        'Unknown'
                      )}
                    </div>
                    <div className="text-xs text-slate-500 h-4">
                      {partnerTyping ? (
                        <span className="text-indigo-600 font-medium flex items-center gap-1 animate-pulse">
                          Typing...
                        </span>
                      ) : (
                        <span className="truncate">Active now</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div 
                ref={messageContainerRef}
                className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 scroll-smooth"
                style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '20px 20px' }}
              >
                <div className="max-w-3xl mx-auto space-y-4">
                  {messages.map((msg, index) => {
                    const isSelf = msg.sender.id === user?.user_id;
                    const showDate = index === 0 || 
                      formatDate(msg.timestamp) !== formatDate(messages[index - 1]?.timestamp);

                    return (
                      <React.Fragment key={msg.id}>
                        {showDate && (
                          <div className="flex justify-center my-6">
                            <div className="bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-medium text-slate-500 shadow-sm border border-slate-100">
                              {formatDate(msg.timestamp)}
                            </div>
                          </div>
                        )}
                        <div className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                          <div className={`flex items-end gap-2 max-w-[85%] md:max-w-[70%] ${isSelf ? 'flex-row-reverse' : 'flex-row'}`}>
                            {!isSelf && (
                              <img
                                src={msg.sender.avatar || getOtherUser(activeConversation)?.avatar}
                                alt=""
                                className="w-8 h-8 rounded-full flex-shrink-0 shadow-sm object-cover"
                              />
                            )}
                            <div className={`rounded-2xl px-4 py-2.5 shadow-sm ${
                              isSelf 
                                ? 'bg-indigo-600 text-white rounded-br-sm' 
                                : 'bg-white text-slate-800 rounded-bl-sm border border-slate-200'
                            }`}>
                              <div className="text-[15px] leading-relaxed break-words">{msg.content}</div>
                              <div className={`text-[10px] mt-1 flex items-center gap-1 ${
                                isSelf ? 'text-indigo-200 justify-end' : 'text-slate-400'
                              }`}>
                                <span>{formatTime(msg.timestamp)}</span>
                                {isSelf && (
                                  <span>
                                    {msg.status === 'seen' ? '✓✓' : msg.status === 'delivered' ? '✓✓' : '✓'}
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
                      <div className="flex items-end gap-2">
                        <img
                          src={getOtherUser(activeConversation)?.avatar}
                          alt=""
                          className="w-8 h-8 rounded-full shadow-sm"
                        />
                        <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                          <div className="flex gap-1.5">
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Message Input */}
              <div className="px-4 py-4 bg-white border-t border-slate-200 flex-shrink-0">
                <div className="max-w-3xl mx-auto flex items-end gap-3">
                  <div className="flex-1 bg-slate-100 rounded-2xl flex items-center px-4 py-2 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:bg-white transition-all border border-transparent focus-within:border-indigo-200">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTyping();
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 bg-transparent focus:outline-none text-slate-800 placeholder-slate-500 text-sm md:text-base py-1"
                    />
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className={`p-3 rounded-xl transition-all flex-shrink-0 flex items-center justify-center ${
                      newMessage.trim() 
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 hover:-translate-y-0.5'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Empty Chat State */
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 p-6">
              <div className="text-center max-w-sm">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 mx-auto shadow-sm border border-slate-200">
                  <Send className="w-8 h-8 text-indigo-500 ml-1" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">Your Messages</h2>
                <p className="text-slate-500 text-base leading-relaxed mb-8">
                  Select a conversation from the sidebar or start a new one to connect with tutors and students.
                </p>
                {/* Show back button on mobile when no conversation is selected */}
                <button
                  onClick={handleBackToConversations}
                  className="md:hidden w-full px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
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
