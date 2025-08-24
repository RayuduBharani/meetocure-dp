import React, { useState, useRef, useEffect } from 'react';
import {
  MessageCircle, Bell, Wallet, Phone, Clock, Paperclip, Mic, Send, ChevronLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import TopIcons from "../../../components/PatientTopIcons";

// ContactCard Component
const ContactCard = ({ name, role, avatar, workingHours, onCallClick }) => {
  return (
    <div className="bg-[#0A4D68] rounded-2xl p-6 text-white shadow-lg">
      <div className="flex items-start gap-4 mb-4">
        <img src={avatar} alt={name} className="w-16 h-16 rounded-full border-2 border-white/20 object-cover" />
        <div className="flex-1">
          <h2 className="text-lg font-semibold">{name}</h2>
          <p className="text-sm text-white/80">{role}</p>
        </div>
      </div>
      <Link to="/contact">
        <button
          onClick={onCallClick}
          className="w-full bg-white/20 hover:bg-white/30 transition rounded-xl py-2 px-4 flex items-center justify-center gap-2 font-medium"
        >
          <Phone className="w-4 h-4" />
          Call Now
        </button>
      </Link>
      <div className="flex items-center gap-2 text-white/70 text-sm mt-3">
        <Clock className="w-4 h-4" />
        <span>{workingHours}</span>
      </div>
    </div>
  );
};

// Message Bubble
const Message = ({ content, timestamp, isUser }) => (
  <div className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
    <div className={`max-w-md px-4 py-3 rounded-2xl ${isUser ? 'bg-[#0A4D68] text-white rounded-br-md' : 'bg-gray-100 text-gray-800 rounded-bl-md'
      }`}>
      <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
      <p className={`text-xs mt-1 ${isUser ? 'text-[#a7d0e8]' : 'text-gray-500'}`}>{timestamp}</p>
    </div>
  </div>
);

// TypingIndicator
const TypingIndicator = () => (
  <div className="flex items-center gap-2 mb-4">
    <div className="bg-gray-100 rounded-2xl px-4 py-3 max-w-xs">
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300" />
      </div>
    </div>
  </div>
);

// MessageInput Component (with file upload)
const MessageInput = ({ value, onChange, onSend, onFileUpload }) => {
  const fileInputRef = useRef(null);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3">
        <button className="text-gray-400 hover:text-gray-600" onClick={triggerFileInput}>
          <Paperclip className="w-5 h-5" />
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={onFileUpload}
          />
        </button>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Message..."
          className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-500"
        />
        <button className="text-gray-400 hover:text-gray-600">
          <Mic className="w-5 h-5" />
        </button>
        <button
          onClick={onSend}
          className="bg-[#0A4D68] hover:bg-[#083952] text-white rounded-full p-2"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Chat Interface Logic
const ChatInterface = () => {
  const [messages, setMessages] = useState([
    { id: '1', content: 'Hi there!', timestamp: '11:25', isUser: true }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMsg = {
      id: Date.now().toString(),
      content: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isUser: true
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const aiReply = {
        id: (Date.now() + 1).toString(),
        content: "How can I assist you with your appointment?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isUser: false
      };
      setMessages((prev) => [...prev, aiReply]);
      setIsTyping(false);
    }, 1500);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileMsg = {
        id: Date.now().toString(),
        content: `📎 File uploaded: ${file.name}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isUser: true
      };
      setMessages((prev) => [...prev, fileMsg]);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg) => (
          <Message key={msg.id} {...msg} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>
      <MessageInput
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSendMessage}
        onFileUpload={handleFileUpload}
      />
    </div>
  );
};

// Sidebar
const Sidebar = () => (
  <div className="bg-gray-50 p-4 lg:p-6">
    <ContactCard
      name="Sai Kiran"
      role="Appointment Agent"
      avatar="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150"
      workingHours="6:00 AM - 9:00 PM"
      onCallClick={() => { }}
    />
  </div>
);

// ChatPage Final
const ChatPage = () => {
  const [showSidebar, setShowSidebar] = useState(true);

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      <div className="px-6 pt-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => window.history.back()}>
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>

          <h1 className="text-xl font-semibold text-gray-800">Chat with AI</h1>
        </div>
        <TopIcons />
      </div>

      <div className="flex-1 flex overflow-hidden mt-4">
        {/* Mobile View */}
        <div className="lg:hidden w-full flex">
          {showSidebar ? (
            <div className="w-full">
              <Sidebar />
              <div className="p-4">
                <button
                  onClick={() => setShowSidebar(false)}
                  className="w-full bg-[#0A4D68] hover:bg-[#083952] text-white rounded-xl py-3 font-medium"
                >
                  Start Chat
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full bg-white">
              <ChatInterface />
            </div>
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden lg:flex w-full">
          <div className="w-1/3 xl:w-1/4 border-r border-gray-200 bg-gray-50">
            <Sidebar />
          </div>
          <div className="flex-1 bg-white">
            <ChatInterface />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
