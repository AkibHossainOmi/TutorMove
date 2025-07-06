import React, { useEffect, useState, useRef, useCallback } from "react";
import ChatSocket from "../components/ChatSocket";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function WhatsAppLikeMessaging() {
  const [user, setUser] = useState(null);
  const socketRef = useRef(null);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [partnerTyping, setPartnerTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const messagesRef = useRef();

  // Safe send wrapper
  // Wrapped in useCallback so it can be used safely in other callbacks
  const sendSocketMessage = useCallback(
    (msg) => {
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.send(msg);
      }
    },
    []
  );

  // Handle incoming socket events
  const handleSocketMessage = useCallback(
    (data) => {
      switch (data.type) {
        case "chat.message":
          if (data.message.conversation_id === activeConversation?.id) {
            setMessages((prev) => [...prev, data.message]);
          }
          break;

        case "chat.typing":
          setPartnerTyping(data.is_typing);
          if (data.is_typing) {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => setPartnerTyping(false), 2000);
          }
          break;

        case "chat.conversations":
          setConversations(data.conversations);
          break;

        case "chat.messages":
          setMessages(data.messages);
          break;

        case "chat.search_results":
          setSearchResults(data.results);
          break;

        case "chat.conversation_started":
          const conv = data.conversation;
          setActiveConversation(conv);     // Open the new conversation
          setMessages([]);                 // Clear old messages

          // Request messages for this conversation
          sendSocketMessage({
            type: "chat.get_messages",
            conversation_id: conv.id,
          });

          // Add the new conversation to conversations list if not present
          setConversations((prev) => {
            if (prev.some((c) => c.id === conv.id)) return prev;
            return [conv, ...prev];
          });

          // Clear search UI
          setSearchResults([]);
          setSearchTerm("");
          break;

        default:
          break;
      }
    },
    [activeConversation, sendSocketMessage]
  );

  // Load user and initialize socket once
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const parsedUser = JSON.parse(userStr);
      setUser(parsedUser);

      const ws = new ChatSocket(parsedUser.user_id, handleSocketMessage);
      socketRef.current = ws;

      // When socket opens, fetch conversations
      const onOpen = () => {
        sendSocketMessage({ type: "chat.get_conversations", user_id: parsedUser.user_id });
      };
      ws.socket.addEventListener("open", onOpen);

      // Cleanup on unmount
      return () => {
        ws.socket.removeEventListener("open", onOpen);
        if (ws.socket.readyState === WebSocket.OPEN || ws.socket.readyState === WebSocket.CONNECTING) {
          ws.close();
        }
      };
    }
  }, [handleSocketMessage, sendSocketMessage]);

  // Scroll to latest message
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  const getOtherUser = (conv) => conv.participants.find((u) => u.id !== user?.user_id);

  const openConversation = (conv) => {
    setActiveConversation(conv);
    setMessages([]);
    sendSocketMessage({
      type: "chat.get_messages",
      conversation_id: conv.id,
    });
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !socketRef.current || !activeConversation) return;
    sendSocketMessage({
      type: "chat.message",
      sender_id: user.user_id,
      conversation_id: activeConversation.id,
      content: newMessage,
    });
    setNewMessage("");
  };

  const handleTyping = () => {
    if (!socketRef.current || !activeConversation) return;
    const partner = getOtherUser(activeConversation);
    if (!partner) return;

    sendSocketMessage({
      type: "chat.typing",
      sender_id: user.user_id,
      receiver_id: partner.id,
      is_typing: true,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      sendSocketMessage({
        type: "chat.typing",
        sender_id: user.user_id,
        receiver_id: partner.id,
        is_typing: false,
      });
    }, 2000);
  };

  const handleSearch = () => {
    if (!searchTerm.trim() || !socketRef.current) return;
    sendSocketMessage({
      type: "chat.search_user",
      keyword: searchTerm.trim(),
    });
  };

  const startConversationWith = (targetUser) => {
    if (!socketRef.current || !user) return;
    sendSocketMessage({
      type: "chat.start_conversation",
      sender_id: user.user_id,
      receiver_id: targetUser.id,
    });
    // Clearing search UI is now done in handleSocketMessage after conversation started
  };

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
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              {searchResults.length > 0 && (
                <div className="mt-2 bg-white shadow rounded border max-h-64 overflow-y-auto">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => startConversationWith(user)}
                      className="p-2 cursor-pointer hover:bg-green-100"
                    >
                      {user.username}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex-grow overflow-y-auto">
              {conversations.map((conv) => {
                const partner = getOtherUser(conv);
                return (
                  <div
                    key={conv.id}
                    onClick={() => openConversation(conv)}
                    className={`p-3 cursor-pointer hover:bg-green-100 ${
                      activeConversation?.id === conv.id ? "bg-green-50" : ""
                    }`}
                  >
                    {partner?.username || "Unknown"}
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

                <div
                  ref={messagesRef}
                  className="flex-grow overflow-y-auto px-6 py-4 space-y-3 bg-gray-50"
                >
                  {messages.map((msg) => {
                    const isSelf = msg.sender.id === user.user_id;
                    return (
                      <div key={msg.id} className={`max-w-xs ${isSelf ? "ml-auto" : ""}`}>
                        <div
                          className={`px-4 py-2 rounded-lg text-sm ${
                            isSelf
                              ? "bg-green-500 text-white rounded-br-none"
                              : "bg-white border border-gray-300 rounded-bl-none"
                          }`}
                        >
                          <div>{msg.content}</div>
                          <div className="text-[10px] mt-1 text-right text-gray-300">
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {partnerTyping && <div className="text-xs text-gray-400 italic">Typing...</div>}
                </div>

                <div className="p-4 flex gap-3 border-t">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
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
                Select a chat or search user
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
