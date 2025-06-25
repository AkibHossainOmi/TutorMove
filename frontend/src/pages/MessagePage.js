import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar'; // Assuming you have a Navbar component
import LoadingSpinner from '../components/LoadingSpinner'; // Assuming you have a LoadingSpinner component

// Helper function for consistent notification logging (similar to your dashboard)
const useNotification = () => {
  const showNotification = (message, type) => console.log(`Notification (${type}): ${message}`);
  return { showNotification };
};

const MessagePage = () => {
  const { showNotification } = useNotification();

  // State to manage the current authenticated user
  const [currentUser, setCurrentUser] = useState(null);
  // State for the user search input
  const [searchTerm, setSearchTerm] = useState('');
  // State to store the results of user search
  const [searchResults, setSearchResults] = useState([]);
  // State to hold the user currently chatting with
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  // State to store messages for the current chat
  const [messages, setMessages] = useState([]);
  // State for the new message text input
  const [newMessageText, setNewMessageText] = useState('');
  // Loading state for API calls
  const [isLoading, setIsLoading] = useState(true);
  // Error state for API calls
  const [error, setError] = useState(null);
  // State to control the visibility of the user search modal/panel
  const [showUserSearchModal, setShowUserSearchModal] = useState(false);

  // Ref for the messages container to enable auto-scrolling
  const messagesEndRef = useRef(null);

  // API base URL for your Django backend
  const API_BASE_URL = 'http://localhost:3000/api'; // Updated API Base URL

  // --- Initial Load and User Authentication Check ---
  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser && storedUser.user_id) {
        setCurrentUser(storedUser);
        // In a real app, you might want to load a list of recent chats here
        // For this example, we'll just set isLoading to false initially
        setIsLoading(false);
      } else {
        // Redirect to login if no user found
        window.location.href = '/login'; // Or show an access denied message
      }
    } catch (err) {
      console.error("Failed to parse user from localStorage:", err);
      setError("Failed to load user data. Please log in again.");
      setIsLoading(false);
    }
  }, []);

  // --- Message Polling Effect ---
  useEffect(() => {
    let messagePollingInterval;
    if (currentUser && selectedChatUser) {
      // Start polling for new messages every 20 seconds
      messagePollingInterval = setInterval(() => {
        fetchMessages();
      }, 20000); // 20 seconds
    }

    // Cleanup interval on component unmount or when chat user changes
    return () => {
      if (messagePollingInterval) {
        clearInterval(messagePollingInterval);
      }
    };
  }, [currentUser, selectedChatUser]); // Re-run effect if current user or selected chat user changes

  // --- Auto-scroll to bottom of messages when messages update ---
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // --- API Functions ---

  /**
   * Searches for users by username.
   * @param {string} usernameQuery - The username to search for.
   */
  const handleSearchUsers = async (usernameQuery) => {
    if (!usernameQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // Ensure the search endpoint is correct for your Django backend
      const response = await axios.get(`${API_BASE_URL}/users/search/?username=${usernameQuery}`);
      // Filter out the current user from search results
      const filteredResults = response.data.filter(user => user.id !== currentUser.user_id);
      setSearchResults(filteredResults);
    } catch (err) {
      console.error("Error searching users:", err.response?.data || err.message);
      setError("Failed to search users. Please try again.");
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetches messages between the current user and the selected chat user.
   */
  const fetchMessages = async () => {
    if (!currentUser || !selectedChatUser) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // Assuming your Django endpoint can filter messages by two participants
      const response = await axios.get(
        `${API_BASE_URL}/messages/?participant1_id=${currentUser.user_id}&participant2_id=${selectedChatUser.id}`
      );
      // Sort messages by timestamp to ensure correct order
      const sortedMessages = response.data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      setMessages(sortedMessages);
    } catch (err) {
      console.error("Error fetching messages:", err.response?.data || err.message);
      setError("Failed to load messages. Please try again.");
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles selecting a user from search results to start/continue a chat.
   * @param {Object} user - The user profile object.
   */
  const handleSelectChat = (user) => {
    setSelectedChatUser(user);
    setSearchResults([]); // Clear search results after selection
    setShowUserSearchModal(false); // Close the search modal
    setNewMessageText(''); // Clear new message text area
    // Fetch messages for the newly selected chat user
    // This will be triggered by the useEffect for polling
    if (currentUser) {
      fetchMessages();
    }
  };

  /**
   * Sends a new message to the selected chat user.
   */
  const handleSendMessage = async () => {
    if (!newMessageText.trim() || !currentUser || !selectedChatUser) {
      showNotification("Message cannot be empty.", 'error');
      return;
    }

    // Optimistically add the message to the UI
    const tempMessage = {
      id: `temp-${Date.now()}`, // Temporary ID for optimistic update
      from_user_id: currentUser.user_id,
      to_user_id: selectedChatUser.id,
      text: newMessageText,
      timestamp: new Date().toISOString(),
      isSending: true // Flag for UI feedback
    };
    setMessages(prev => [...prev, tempMessage]);
    setNewMessageText(''); // Clear the input immediately
    scrollToBottom();

    try {
      const response = await axios.post(`${API_BASE_URL}/messages/`, {
        from: currentUser.user_id,
        to: selectedChatUser.id,
        text: tempMessage.text, // Use the text from the optimistic update
        // Django will typically handle the date-time (timestamp) on the server side
      });

      // Find and update the optimistically added message with the actual data from the backend
      setMessages(prev => prev.map(msg =>
        msg.id === tempMessage.id ? { ...response.data, isSending: false } : msg
      ));
      showNotification("Message sent!", 'success');
    } catch (err) {
      console.error("Error sending message:", err.response?.data || err.message);
      setError("Failed to send message. Please try again.");
      showNotification("Failed to send message.", 'error');
      // Revert optimistic update if sending failed
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
    }
  };

  // --- UI Rendering ---

  if (isLoading && !currentUser) { // Only show full spinner if no user is loaded yet
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
        <p className="text-gray-700">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Reload Page
        </button>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-700">You must be logged in to view messages.</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 font-inter">
      <Navbar />
      <div className="pt-16 flex flex-1 overflow-hidden"> {/* pt-16 for navbar */}

        {/* Left Panel: Search and Recent Chats */}
        <div className="w-full md:w-1/3 lg:w-1/4 bg-white border-r border-gray-200 flex flex-col shadow-md rounded-lg m-4">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
            <button
              onClick={() => setShowUserSearchModal(true)}
              className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors flex items-center justify-center"
              aria-label="Search User"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Display "Previously chatted" users here if you implement storing chat history */}
            <div className="p-4 text-gray-600">
              {selectedChatUser ? (
                <div className="flex items-center justify-between p-3 bg-blue-100 rounded-lg shadow-sm">
                  <span className="font-medium text-blue-800">{selectedChatUser.username}</span>
                  <button
                    onClick={() => setSelectedChatUser(null)} // Option to close current chat
                    className="text-blue-500 hover:text-blue-700"
                    aria-label="Close Chat"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ) : (
                <p>No chat selected. Search for a user to start a conversation.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: Chat Window */}
        <div className="flex-1 flex flex-col bg-white shadow-md rounded-lg m-4 ml-0 md:ml-4">
          {selectedChatUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center">
                <img
                  src={`https://placehold.co/40x40/f3f4f6/334155?text=${selectedChatUser.username.charAt(0).toUpperCase()}`}
                  alt={selectedChatUser.username}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <h3 className="text-lg font-semibold text-gray-800">{selectedChatUser.username}</h3>
                {isLoading && (
                  <span className="ml-auto text-sm text-gray-500 flex items-center">
                    <LoadingSpinner size="sm" className="mr-2" /> Loading messages...
                  </span>
                )}
              </div>

              {/* Messages Display Area */}
              <div className="flex-1 p-4 overflow-y-auto custom-scrollbar" style={{ maxHeight: 'calc(100vh - 250px)' }}> {/* Adjust height dynamically */}
                {messages.length > 0 ? (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex mb-4 ${msg.from_user_id === currentUser.user_id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg shadow-md ${
                          msg.from_user_id === currentUser.user_id
                            ? 'bg-blue-500 text-white rounded-br-none'
                            : 'bg-gray-200 text-gray-800 rounded-bl-none'
                        } ${msg.isSending ? 'opacity-75' : ''}`}
                      >
                        <p className="text-sm break-words">{msg.text}</p>
                        <span className={`block text-xs mt-1 ${msg.from_user_id === currentUser.user_id ? 'text-blue-100' : 'text-gray-600'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 mt-20">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                )}
                <div ref={messagesEndRef} /> {/* For auto-scrolling */}
              </div>

              {/* Message Input Area */}
              <div className="p-4 border-t border-gray-200 flex items-center">
                <input
                  type="text"
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all mr-2"
                />
                <button
                  onClick={handleSendMessage}
                  className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
                  aria-label="Send Message"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l4.453-1.483a1 1 0 00.672-.25L10 16l4.294-3.521a1 1 0 00.672.25l4.453 1.483a1 1 0 001.169-1.409l-7-14z" />
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <p>Select a user to start chatting.</p>
            </div>
          )}
        </div>
      </div>

      {/* User Search Modal (or integrated search panel) */}
      {showUserSearchModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Search Users</h3>
            <button
              onClick={() => setShowUserSearchModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              aria-label="Close Search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex mb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchUsers(searchTerm)}
                placeholder="Enter username..."
                className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <button
                onClick={() => handleSearchUsers(searchTerm)}
                className="p-3 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 transition-colors"
              >
                Search
              </button>
            </div>

            {isLoading && (
              <div className="text-center">
                <LoadingSpinner size="md" />
                <p className="text-gray-600">Searching...</p>
              </div>
            )}

            {error && !isLoading && (
              <p className="text-red-500 text-sm mb-4">{error}</p>
            )}

            {!isLoading && searchResults.length > 0 && (
              <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                {searchResults.map(user => (
                  <div
                    key={user.id}
                    onClick={() => handleSelectChat(user)}
                    className="flex items-center p-3 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-blue-50 transition-colors"
                  >
                    <img
                      src={`https://placehold.co/30x30/e0f2f7/0288d1?text=${user.username.charAt(0).toUpperCase()}`}
                      alt={user.username}
                      className="w-8 h-8 rounded-full mr-3"
                    />
                    <div>
                      <p className="font-medium text-gray-800">{user.username}</p>
                      <p className="text-sm text-gray-500">{user.user_type}</p> {/* Assuming user_type is available */}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && searchResults.length === 0 && searchTerm.trim() && (
              <p className="text-gray-500 text-center">No users found for "{searchTerm}".</p>
            )}
            {!isLoading && searchResults.length === 0 && !searchTerm.trim() && (
              <p className="text-gray-500 text-center">Start typing to search for users.</p>
            )}
          </div>
        </div>
      )}

      {/* Tailwind CSS CDN (include this in your public/index.html or similar entry point) */}
      <script src="https://cdn.tailwindcss.com"></script>
    </div>
  );
};

export default MessagePage;
