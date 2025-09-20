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

  // Helper to safely send JSON stringified WS messages
  const sendMessageWS = useCallback((msg) => {
    if (socketRef.current?.connected) {
      socketRef.current.send(msg);
    }
  }, []);

  // Extract the "other user" from conversation participants except self
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

  // WS message handler
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
            // Tutor unlocking a student → show unlock job modal
            setUnlockJobUserId(data.student_id);
            setShowUnlockJobModal(true);
          } else {
            // Student unlocking a tutor → show normal unlock modal
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

  // Load user info once on mount
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) setUser(JSON.parse(userStr));
  }, []);

  // Setup WS connection once user is loaded
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

  // Scroll messages container to bottom when messages change
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

  // Debounced typing indicator
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

  // When unlock contact is successful, start conversation and close modal
  const handleUnlockSuccess = useCallback(() => {
    if (!unlockTutorId) return;
    sendMessageWS({ type: 'chat.start_conversation', receiver_id: unlockTutorId });
    setShowUnlockModal(false);
  }, [sendMessageWS, unlockTutorId]);

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
                const lastMsg = conv.last_message?.content || '';
                const shouldBold =
                  conv.has_unread &&
                  conv.last_message?.sender?.id !== user?.user_id &&
                  activeConversation?.id !== conv.id;

                return (
                  <div
                    key={conv.id}
                    className={`p-3 cursor-pointer hover:bg-green-100 ${
                      activeConversation?.id === conv.id ? 'bg-green-50' : ''
                    } ${shouldBold ? 'font-bold' : 'font-normal'}`}
                    onClick={() => selectConversation(conv)}
                  >
                    <div className="flex flex-col">
                      <span>{other?.username || 'Unknown'}</span>
                      <span className="text-xs text-gray-500 truncate max-w-full">
                        {lastMsg.length > 30 ? lastMsg.slice(0, 27) + '...' : lastMsg}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {activeConversation ? (
              <>
                <div className="p-4 border-b font-semibold text-lg">
                  {getOtherUser(activeConversation)?.username}
                </div>
                <div
                  ref={messageContainerRef}
                  className="flex-grow overflow-y-auto px-6 py-4 space-y-3 bg-gray-50"
                >
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
                          <div className="text-[10px] mt-1 text-gray-300 flex items-center justify-end space-x-1">
                            <span>
                              {new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {isSelf && (
                              <span className="flex items-center">
                                {msg.status === 'seen' ? (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-4 h-4 text-white relative -top-[1px]"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 17l4 4L19 11" />
                                  </svg>
                                ) : msg.status === 'delivered' ? (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-4 h-4 text-white relative -top-[1px]"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-4 h-4 text-white relative -top-[1px]"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {partnerTyping && (
                    <div className="text-xs text-gray-400 italic">Typing...</div>
                  )}
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
          // After job unlock, automatically unlock contact
          sendMessageWS({ type: 'chat.start_conversation', receiver_id: unlockJobUserId });
          setShowUnlockJobModal(false);
        }}
      />

      <BuyCreditsModal
        show={showBuyCreditsModal}
        onClose={() => setShowBuyCreditsModal(false)}
        onBuyCredits={() => {
          setShowBuyCreditsModal(false);
          window.location.href = '/buy-credits';
        }}
        message="You don’t have enough credits to unlock this contact."
      />

      <Footer />
    </>
  );
}
