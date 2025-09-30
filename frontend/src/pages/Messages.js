import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ChatSocket from '../components/ChatSocket';
import UnlockContactModal from '../components/UnlockContactModal';
import BuyCreditsModal from '../components/BuyCreditsModal';
import UnlockJobModal from '../components/UnlockJobModal';

export default function WhatsAppLikeMessagingWS() {
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
        }))
        .find((u) => u.id !== user?.user_id),
    [user]
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
          break;
        default:
          break;
      }
    },
    [activeConversation, conversations, sendMessageWS, user]
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
      sendMessageWS({ type: 'chat.get_conversations' });
      if (usernameFromQuery) {
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
  }, [messages]);

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
      sendMessageWS({ type: 'chat.search_user', keyword: searchTerm.trim() });
    }
  }, [searchTerm, sendMessageWS]);

  const startConversation = useCallback(
    (targetUser) => {
      sendMessageWS({ type: 'chat.start_conversation', receiver_id: targetUser.id });
    },
    [sendMessageWS]
  );

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

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-160px)] bg-sky-50 p-6 mt-20">
        <div className="mx-auto max-w-7xl h-[82vh] bg-white rounded-3xl shadow-xl grid grid-cols-12 overflow-hidden">
          <aside className="col-span-4 bg-gradient-to-b from-sky-600 to-sky-700 text-white p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-semibold">M</div>
                <div>
                  <div className="text-sm font-semibold">Messages</div>
                  <div className="text-xs opacity-80">All chats</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search users or username"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full rounded-md py-2 px-3 bg-white/10 placeholder-white/80 focus:outline-none"
              />
              <button
                onClick={handleSearch}
                className="absolute right-2 top-2 bg-white/20 px-3 py-1 rounded-md text-xs"
              >
                Search
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {searchResults.length > 0 && (
                <div className="mb-3 rounded-md bg-white/5 p-2">
                  {searchResults.map((u) => (
                    <div
                      key={u.id}
                      onClick={() => startConversation(u)}
                      className="py-2 px-3 rounded-md cursor-pointer hover:bg-white/10"
                    >
                      <div className="text-sm font-medium">{u.username}</div>
                    </div>
                  ))}
                </div>
              )}
              <div className="space-y-2">
                {conversations.map((conv) => {
                  const other = getOtherUser(conv);
                  const lastMsg = conv.last_message?.content || '';
                  const shouldBold =
                    conv.has_unread &&
                    conv.last_message?.sender?.id !== user?.user_id &&
                    activeConversation?.id !== conv.id;
                  return (
                    <div
                      key={conv.id}
                      onClick={() => selectConversation(conv)}
                      className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition ${
                        activeConversation?.id === conv.id ? 'bg-white/10' : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-sm font-semibold">
                        {other?.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`flex justify-between items-center`}>
                          <div className={`truncate ${shouldBold ? 'font-semibold' : 'font-medium'}`}>
                            {other?.username || 'Unknown'}
                          </div>
                          <div className="text-xs opacity-70">
                            {conv.last_message?.timestamp
                              ? new Date(conv.last_message.timestamp).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : ''}
                          </div>
                        </div>
                        <div className="text-xs opacity-80 truncate">
                          {lastMsg.length > 40 ? `${lastMsg.slice(0, 37)}...` : lastMsg}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="pt-3">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSearchResults([]);
                }}
                className="w-full py-2 rounded-md bg-white/10 hover:bg-white/20 text-sm"
              >
                Clear search
              </button>
            </div>
          </aside>

          <main className="col-span-8 flex flex-col">
            {activeConversation ? (
              <>
                <div className="flex items-center justify-between px-6 py-4 border-b">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-semibold">
                      {getOtherUser(activeConversation)?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="text-lg font-semibold">
                        {getOtherUser(activeConversation)?.username || 'Unknown'}
                      </div>
                      <div className="text-sm text-sky-600">
                        {activeConversation?.last_active ? 'Active' : ''}
                      </div>
                    </div>
                  </div>
                </div>

                <div ref={messageContainerRef} className="flex-1 overflow-y-auto px-6 py-5 space-y-4 bg-slate-50">
                  {messages.map((msg) => {
                    const isSelf = msg.sender.id === user?.user_id;
                    return (
                      <div key={msg.id} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] break-words px-4 py-2 rounded-lg shadow-sm ${isSelf ? 'bg-sky-600 text-white rounded-br-none' : 'bg-white border border-slate-200 rounded-bl-none'}`}>
                          <div className="text-sm">{msg.content}</div>
                          <div className="flex items-center justify-end text-[11px] mt-1 opacity-70 space-x-2">
                            <div>
                              {msg.timestamp
                                ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : ''}
                            </div>
                            {isSelf && (
                              <div className="flex items-center">
                                {msg.status === 'seen' ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 17l4 4L19 11" />
                                  </svg>
                                ) : msg.status === 'delivered' ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 17l4 4L19 11" />
                                  </svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {partnerTyping && (
                    <div className="text-sm text-slate-500 italic">Typing...</div>
                  )}
                </div>

                <div className="px-6 py-4 border-t bg-white flex items-center gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Write a message"
                    className="flex-1 rounded-full border border-slate-200 px-4 py-3 focus:outline-none"
                  />
                  <button
                    onClick={sendMessage}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-sky-600 text-white hover:bg-sky-700"
                  >
                    Send
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <div className="text-xl font-semibold">No conversation selected</div>
                <div className="mt-2">Select a chat from the left or search users to start a conversation</div>
              </div>
            )}
          </main>
        </div>
      </div>

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
        message="You don’t have enough points to unlock this contact."
      />

      <Footer />
    </>
  );
}
