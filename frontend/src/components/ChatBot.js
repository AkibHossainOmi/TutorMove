import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  ChevronDown,
  HelpCircle,
  BookOpen,
  CreditCard,
  MapPin,
  UserPlus,
  Briefcase
} from 'lucide-react';

// FAQ Knowledge Base about TutorMove
const FAQ_DATABASE = {
  greetings: {
    keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy'],
    response: "Hello! 👋 Welcome to TutorMove! I'm here to help you navigate our platform. How can I assist you today?",
    suggestions: ['What is TutorMove?', 'How do I find a tutor?', 'How do I become a tutor?']
  },
  whatIs: {
    keywords: ['what is tutormove', 'about tutormove', 'tell me about', 'what does tutormove do', 'what is this'],
    response: "TutorMove is a location-based tutoring platform that connects students with qualified tutors in their neighborhood. You can find tutors near you using our interactive map, browse tutor profiles, post tutoring jobs, and communicate directly with tutors. Whether you need help with academics, skills, or languages, TutorMove makes finding the right tutor simple and convenient!",
    suggestions: ['How do I find a tutor?', 'How much does it cost?', 'How do I sign up?']
  },
  findTutor: {
    keywords: ['find tutor', 'search tutor', 'looking for tutor', 'need tutor', 'get tutor', 'how to find'],
    response: "Finding a tutor on TutorMove is easy! Here's how:\n\n1. Use the interactive map on our homepage to discover tutors near your location\n2. Browse the 'Find Tutors' page to filter by subject, rating, and availability\n3. View tutor profiles to see their qualifications, reviews, and hourly rates\n4. Contact tutors directly through our messaging system\n\nYou can also post a tutoring job and let tutors come to you!",
    suggestions: ['How do I post a job?', 'How do I contact a tutor?', 'What subjects are available?']
  },
  becomeTutor: {
    keywords: ['become tutor', 'register as tutor', 'tutor signup', 'want to tutor', 'how to teach', 'join as tutor'],
    response: "Great question! To become a tutor on TutorMove:\n\n1. Sign up for an account and select 'Tutor' as your role\n2. Complete your profile with your qualifications, subjects, and hourly rate\n3. Add your location to appear on the map search\n4. Start receiving inquiries from students!\n\nTutors can also browse and apply to tutoring jobs posted by students.",
    suggestions: ['How do I get paid?', 'What are credits?', 'How do I set my rates?']
  },
  pricing: {
    keywords: ['price', 'cost', 'fee', 'how much', 'payment', 'credits', 'money', 'charge'],
    response: "TutorMove uses a credit-based system:\n\n• Browsing tutors and posting jobs is FREE\n• Credits are used to unlock contact details and premium features\n• You can purchase credits through our secure payment system\n• Tutors set their own hourly rates\n\nWe offer various credit packages to suit your needs. Check our pricing page for current offers!",
    suggestions: ['How do I buy credits?', 'What can I do with credits?', 'Is there a free trial?']
  },
  signup: {
    keywords: ['sign up', 'register', 'create account', 'join', 'get started', 'new account'],
    response: "Signing up for TutorMove is quick and free!\n\n1. Click the 'Sign Up' button in the navigation bar\n2. Choose whether you're a Student or Tutor (you can be both!)\n3. Fill in your details and verify your email\n4. Complete your profile to get started\n\nYou'll have access to our map search, tutor browsing, and messaging features right away!",
    suggestions: ['What is TutorMove?', 'How do I find a tutor?', 'How much does it cost?']
  },
  postJob: {
    keywords: ['post job', 'create job', 'tutoring job', 'job listing', 'hire tutor', 'request tutor'],
    response: "To post a tutoring job:\n\n1. Sign in to your account\n2. Go to 'Post a Job' from the navigation\n3. Fill in the job details: subject, location, schedule, and budget\n4. Publish your job and wait for tutor applications\n\nTutors in your area will be able to see and apply to your job. You can review their profiles and choose the best fit!",
    suggestions: ['How do I contact applicants?', 'Can I edit my job post?', 'How do I find tutors?']
  },
  contact: {
    keywords: ['contact', 'message', 'chat', 'communicate', 'talk to tutor', 'reach out'],
    response: "To contact a tutor or student:\n\n1. Visit their profile page\n2. Click the 'Message' or 'Contact' button\n3. Use our built-in messaging system to communicate\n\nNote: Some contact features may require credits to unlock. Our messaging system keeps your conversations organized and secure!",
    suggestions: ['What are credits?', 'How do I find a tutor?', 'Is my data secure?']
  },
  subjects: {
    keywords: ['subject', 'course', 'teach', 'learn', 'topic', 'what can i learn'],
    response: "TutorMove offers tutoring in a wide range of subjects:\n\n📚 Academic: Math, Science, English, History, Languages\n💻 Technology: Programming, Web Development, Data Science\n🎨 Creative: Music, Art, Design\n📈 Professional: Business, Test Prep, Career Skills\n\nAnd many more! Use our search filters to find tutors for your specific subject.",
    suggestions: ['How do I find a tutor?', 'How much does tutoring cost?', 'Can I tutor multiple subjects?']
  },
  safety: {
    keywords: ['safe', 'secure', 'privacy', 'trust', 'verified', 'protection'],
    response: "Your safety is our priority! TutorMove includes:\n\n✅ Verified tutor profiles\n✅ Rating and review system\n✅ Secure messaging system\n✅ Privacy-protected contact sharing\n✅ Report and block features\n\nWe recommend meeting in public places for in-person sessions and using our platform for all communications.",
    suggestions: ['How do I report an issue?', 'How are tutors verified?', 'What is TutorMove?']
  },
  map: {
    keywords: ['map', 'location', 'nearby', 'area', 'distance', 'near me', 'local'],
    response: "Our interactive map feature helps you find tutors near you!\n\n🗺️ Use the map on the homepage to see tutors in your area\n📍 Set your location to find nearby tutors\n🔍 Adjust the search radius to expand or narrow results\n📌 Click on markers to view tutor details\n\nThis makes it easy to find tutors who can meet in person at convenient locations!",
    suggestions: ['How do I find a tutor?', 'Can I tutor online?', 'How do I set my location?']
  },
  help: {
    keywords: ['help', 'support', 'assist', 'problem', 'issue', 'question'],
    response: "I'm here to help! Here are some common topics I can assist with:\n\n• Finding tutors in your area\n• Becoming a tutor\n• Understanding credits and pricing\n• Posting tutoring jobs\n• Using the messaging system\n• Account and profile questions\n\nFeel free to ask me anything about TutorMove!",
    suggestions: ['What is TutorMove?', 'How do I find a tutor?', 'How do I become a tutor?']
  },
  thanks: {
    keywords: ['thank', 'thanks', 'appreciate', 'helpful', 'great'],
    response: "You're welcome! 😊 I'm glad I could help. If you have any more questions about TutorMove, feel free to ask. Good luck with your tutoring journey!",
    suggestions: ['How do I find a tutor?', 'What is TutorMove?', 'How do I sign up?']
  },
  bye: {
    keywords: ['bye', 'goodbye', 'see you', 'later', 'exit', 'close'],
    response: "Goodbye! 👋 Thank you for chatting with me. Best of luck with your tutoring experience on TutorMove. Come back anytime if you need help!",
    suggestions: []
  }
};

// Find the best matching FAQ response
const findResponse = (userMessage) => {
  const message = userMessage.toLowerCase().trim();

  // Check each FAQ category for keyword matches
  for (const [, faq] of Object.entries(FAQ_DATABASE)) {
    for (const keyword of faq.keywords) {
      if (message.includes(keyword)) {
        return faq;
      }
    }
  }

  // Default response if no match found
  return {
    response: "I'm not sure I understand that question. I can help you with:\n\n• Finding tutors near you\n• Becoming a tutor\n• Understanding pricing and credits\n• Posting tutoring jobs\n• Account setup and features\n\nCould you try rephrasing your question, or choose from the suggestions below?",
    suggestions: ['What is TutorMove?', 'How do I find a tutor?', 'How much does it cost?', 'How do I sign up?']
  };
};

// Quick action buttons for initial chat
const QUICK_ACTIONS = [
  { icon: HelpCircle, label: 'What is TutorMove?', query: 'What is TutorMove?' },
  { icon: MapPin, label: 'Find Tutors', query: 'How do I find a tutor?' },
  { icon: BookOpen, label: 'Become a Tutor', query: 'How do I become a tutor?' },
  { icon: CreditCard, label: 'Pricing', query: 'How much does it cost?' },
  { icon: Briefcase, label: 'Post a Job', query: 'How do I post a job?' },
  { icon: UserPlus, label: 'Sign Up', query: 'How do I sign up?' },
];

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hi! 👋 I'm TutorBot, your virtual assistant. I can help you learn about TutorMove and how to use our platform. What would you like to know?",
      timestamp: new Date(),
      suggestions: ['What is TutorMove?', 'How do I find a tutor?', 'How much does it cost?']
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSendMessage = (text) => {
    const messageText = text || inputValue.trim();
    if (!messageText) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot thinking and responding
    setTimeout(() => {
      const faqResponse = findResponse(messageText);
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: faqResponse.response,
        timestamp: new Date(),
        suggestions: faqResponse.suggestions
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 800 + Math.random() * 700); // Random delay between 800-1500ms
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-105"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <MessageCircle className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] h-[560px] max-h-[calc(100vh-140px)] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-4 flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-base">TutorBot</h3>
                <p className="text-purple-200 text-xs">Always here to help</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Minimize chat"
              >
                <ChevronDown className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {/* Quick Actions (shown only at start) */}
              {messages.length === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-2 gap-2 mb-4"
                >
                  {QUICK_ACTIONS.map((action, index) => (
                    <motion.button
                      key={action.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleSuggestionClick(action.query)}
                      className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-all text-left group"
                    >
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                        <action.icon className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-700 group-hover:text-purple-700">{action.label}</span>
                    </motion.button>
                  ))}
                </motion.div>
              )}

              {/* Message Bubbles */}
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index === messages.length - 1 ? 0.1 : 0 }}
                  className={`flex gap-2 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                    message.type === 'bot'
                      ? 'bg-gradient-to-br from-purple-500 to-indigo-500'
                      : 'bg-slate-700'
                  }`}>
                    {message.type === 'bot' ? (
                      <Sparkles className="w-4 h-4 text-white" />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div className={`max-w-[75%] ${message.type === 'user' ? 'text-right' : ''}`}>
                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                      message.type === 'bot'
                        ? 'bg-white border border-slate-200 text-slate-700 rounded-tl-md shadow-sm'
                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-md shadow-md'
                    }`}>
                      {message.content}
                    </div>

                    {/* Suggestions */}
                    {message.type === 'bot' && message.suggestions && message.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {message.suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-full border border-purple-200 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-200">
              <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-4 py-2 focus-within:ring-2 focus-within:ring-purple-500 focus-within:bg-white transition-all">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 placeholder:text-slate-400"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isTyping}
                  className="w-9 h-9 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md transition-all hover:scale-105 active:scale-95"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-400 text-center mt-2">
                Powered by TutorMove
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
