import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
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
          avatar: p.avatar || `https://ui-avatars.com/api/?name=${p.username ?? p.user__username}&background=25D366&color=fff`
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

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 pt-20">
        <div className="max-w-7xl mx-auto h-[calc(100vh-120px)] p-4">
          <div className="bg-white rounded-lg shadow-lg h-full flex overflow-hidden">
            {/* Left Sidebar - Conversations List */}
            <div className="w-1/3 border-r border-gray-300 flex flex-col bg-white">
              {/* Sidebar Header */}
              <div className="bg-gray-100 p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold">
                      {user?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="font-semibold text-gray-800">Tutormove</span>
                  </div>
                  <div className="flex gap-4 text-gray-600">
                    <button className="hover:text-green-600 transition-colors">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Search Bar */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search or start new chat"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto bg-white">
                {searchResults.length > 0 && (
                  <div className="border-b border-gray-200">
                    <div className="p-3 text-sm font-semibold text-gray-500 bg-gray-50">Search Results</div>
                    {searchResults.map((u) => (
                      <div
                        key={u.id}
                        onClick={() => startConversation(u)}
                        className="flex items-center gap-3 p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <img
                          src={u.avatar}
                          alt={u.username}
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800">{u.username}</div>
                          <div className="text-sm text-green-600">Start conversation</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  {isLoading && conversations.length === 0 ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <p>No conversations</p>
                      <p className="text-sm">Start a new conversation by searching above</p>
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
                          className={`flex items-center gap-3 p-3 border-b border-gray-100 cursor-pointer transition-colors ${
                            activeConversation?.id === conv.id ? 'bg-green-50' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="relative">
                            <img
                              src={other?.avatar}
                              alt={other?.username}
                              className="w-12 h-12 rounded-full"
                            />
                            {hasUnread && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="font-semibold text-gray-800 truncate">
                                {other?.username || 'Unknown'}
                              </div>
                              <div className="text-xs text-gray-500 whitespace-nowrap">
                                {formatTime(conv.last_message?.timestamp)}
                              </div>
                            </div>
                            <div className={`text-sm truncate ${hasUnread ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
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

            {/* Right Side - Chat Area */}
            <div className="flex-1 flex flex-col bg-gray-100">
              {activeConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="bg-gray-200 px-6 py-3 flex items-center justify-between border-b border-gray-300">
                    <div className="flex items-center gap-3">
                      <img
                        src={getOtherUser(activeConversation)?.avatar}
                        alt={getOtherUser(activeConversation)?.username}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <div className="font-semibold text-gray-800">
                          {getOtherUser(activeConversation)?.username || 'Unknown'}
                        </div>
                        <div className="text-xs text-gray-600">
                          {partnerTyping ? (
                            <span className="text-green-600">Typing...</span>
                          ) : (
                            <span>Online</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4 text-gray-600">
                      <button className="hover:text-green-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </button>
                      <button className="hover:text-green-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </button>
                      <button className="hover:text-green-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div 
                    ref={messageContainerRef}
                    className="flex-1 overflow-y-auto bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-cover bg-center p-4"
                  >
                    <div className="space-y-2">
                      {messages.map((msg, index) => {
                        const isSelf = msg.sender.id === user?.user_id;
                        const showDate = index === 0 || 
                          formatDate(msg.timestamp) !== formatDate(messages[index - 1]?.timestamp);

                        return (
                          <React.Fragment key={msg.id}>
                            {showDate && (
                              <div className="flex justify-center my-4">
                                <div className="bg-gray-200 px-3 py-1 rounded-full text-xs text-gray-600">
                                  {formatDate(msg.timestamp)}
                                </div>
                              </div>
                            )}
                            <div className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                isSelf 
                                  ? 'bg-green-100 rounded-br-none' 
                                  : 'bg-white rounded-bl-none'
                              } shadow-sm`}>
                                <div className="text-gray-800 text-sm">{msg.content}</div>
                                <div className={`text-xs mt-1 flex items-center gap-1 ${
                                  isSelf ? 'text-gray-500 justify-end' : 'text-gray-400'
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
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="bg-gray-200 px-6 py-3 flex items-center gap-4">
                    <div className="flex gap-2 text-gray-600">
                      <button className="p-2 hover:text-green-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                      <button className="p-2 hover:text-green-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex-1 bg-white rounded-full border border-gray-300">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => {
                          setNewMessage(e.target.value);
                          handleTyping();
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type a message"
                        className="w-full px-4 py-2 bg-transparent focus:outline-none text-gray-800 placeholder-gray-500"
                      />
                    </div>
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className={`p-2 rounded-full transition-colors ${
                        newMessage.trim() 
                          ? 'bg-green-500 text-white hover:bg-green-600' 
                          : 'text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                </>
              ) : (
                /* Empty Chat State */
                <div className="flex-1 flex flex-col items-center justify-center bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-cover bg-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-light text-gray-600 mb-2">Tutormove Messaging</h3>
                    <p className="text-gray-500 max-w-md">
                      Send and receive messages without keeping your phone online.
                    </p>
                  </div>
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