import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Paperclip, Mic, Send, ChevronLeft } from "lucide-react";
import TopIcons from "../../../components/PatientTopIcons";

/* Contact card showing avatar, name and role */
const ContactCard = ({ name, role, avatar = "/assets/logo.png" }) => {
  const src = avatar || "/assets/logo.png";
  return (
    <div className="bg-[#0A4D68] rounded-2xl p-6 text-white shadow-lg">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/90 p-1 flex items-center justify-center">
          <img
            src={src}
            alt={name || "Avatar"}
            className="w-full h-full sm:w-18 sm:h-18 rounded-full object-contain"
            onError={(e) => {
              e.currentTarget.src = "/assets/logo.png";
            }}
          />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold">{name}</h2>
          <p className="text-sm text-white/80">{role}</p>
        </div>
      </div>
    </div>
  );
};

/* Single message bubble */
const Message = ({ content, timestamp, isUser }) => (
  <div className={`flex mb-4 ${isUser ? "justify-end" : "justify-start"}`}>
    <div
      className={`max-w-md px-4 py-3 rounded-2xl ${
        isUser ? "bg-[#0A4D68] text-white rounded-br-md" : "bg-gray-100 text-gray-800 rounded-bl-md"
      }`}
    >
      <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
      <p className={`text-xs mt-1 ${isUser ? "text-[#a7d0e8]" : "text-gray-500"}`}>{timestamp}</p>
    </div>
  </div>
);

/* Typing indicator */
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

/* Input area with file upload and send */
const MessageInput = ({ value, onChange, onSend, onFileUpload }) => {
  const fileInputRef = useRef(null);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3">
        <button className="text-gray-400 hover:text-gray-600" onClick={() => fileInputRef.current.click()}>
          <Paperclip className="w-5 h-5" />
          <input ref={fileInputRef} type="file" className="hidden" onChange={onFileUpload} />
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

        <button onClick={onSend} className="bg-[#0A4D68] hover:bg-[#083952] text-white rounded-full p-2">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

/* Chat interface: messages, send, upload */
const ChatInterface = ({ patientId, activeConversation, onSaveConversation }) => {
  const initialMessages = activeConversation?.messages || [
    {
      id: "system-1",
      content: "Hi there! I'm your medical assistant. How can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isUser: false,
    },
  ];

  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const API_BASE = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    setMessages(activeConversation?.messages || initialMessages);
    setInputValue("");
  }, [activeConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    const text = inputValue.trim();
    if (!text) return;

    if (!patientId) {
      const systemMsg = {
        id: Date.now().toString(),
        content: "Please login to start a chat.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isUser: false,
      };
      setMessages((prev) => [...prev, systemMsg]);
      setInputValue("");
      return;
    }

    const userMsg = {
      id: Date.now().toString(),
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isUser: true,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      const resp = await axios.post(
        `${API_BASE}/api/chat`,
        { patientId, message: text },
        { headers: { "Content-Type": "application/json" }, withCredentials: true }
      );

      const aiText = resp.data?.answer || "No response from assistant.";
      const sources = resp.data?.sources || [];

      const aiReply = {
        id: (Date.now() + 1).toString(),
        content: aiText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isUser: false,
        sources,
      };

      setMessages((prev) => {
        const next = [...prev, aiReply];
        if (onSaveConversation && patientId) {
          const convId = activeConversation?.id || `conv_${Date.now()}`;
          onSaveConversation({
            id: convId,
            title: next.find((m) => !m.isUser)?.content?.slice(0, 40) || "Chat",
            lastMessage: aiText,
            timestamp: Date.now(),
            messages: next,
          });
        }
        return next;
      });
    } catch (error) {
      const errReply = {
        id: (Date.now() + 2).toString(),
        content: "Sorry, I couldn't reach the assistant. Please try again later.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isUser: false,
      };
      setMessages((prev) => [...prev, errReply]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileMsg = {
      id: Date.now().toString(),
      content: `📎 File uploaded: ${file.name}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isUser: true,
    };
    setMessages((prev) => [...prev, fileMsg]);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex mb-4 ${msg.isUser ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-md px-4 py-3 rounded-2xl ${
                msg.isUser ? "bg-[#0A4D68] text-white rounded-br-md" : "bg-gray-100 text-gray-800 rounded-bl-md"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
              <p className={`text-xs mt-1 ${msg.isUser ? "text-[#a7d0e8]" : "text-gray-500"}`}>{msg.timestamp}</p>
              {msg.sources && msg.sources.length > 0 && <div className="mt-2 text-xs text-gray-500">Sources: {msg.sources.join(", ")}</div>}
            </div>
          </div>
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput value={inputValue} onChange={setInputValue} onSend={handleSendMessage} onFileUpload={handleFileUpload} />
    </div>
  );
};

/* Sidebar with recent chats */
const Sidebar = ({ histories, onSelect, onStartNew }) => (
  <div className="bg-gray-50 p-4 lg:p-6">
    <ContactCard name="MeetOcure Medical Assistance" role="Appointment Agent" avatar="/assets/logo.png" />
    <div className="mt-6">
      <button onClick={onStartNew} className="w-full bg-[#0A4D68] hover:bg-[#083952] text-white rounded-xl py-2 px-4 mb-4 font-medium">
        + New Chat
      </button>

      <h3 className="text-sm text-gray-600 mb-2">Recent chats</h3>
      <div className="space-y-2 max-h-64 overflow-auto">
        {(!histories || histories.length === 0) && <div className="text-xs text-gray-500">No previous chats</div>}
        {histories?.map((h) => (
          <button key={h.id} onClick={() => onSelect(h)} className="w-full text-left p-3 bg-white border rounded-lg hover:shadow-sm">
            <div className="text-sm font-medium text-gray-800">{h.title || "Chat"}</div>
            <div className="text-xs text-gray-500 truncate">{h.lastMessage}</div>
            <div className="text-xs text-gray-400 mt-1">{new Date(h.timestamp).toLocaleString()}</div>
          </button>
        ))}
      </div>
    </div>
  </div>
);

/* Main page: manages histories and selected conversation */
const ChatPage = () => {
  const [showSidebar, setShowSidebar] = useState(true);
  const patientId = localStorage.getItem("patientId");
  const [histories, setHistories] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [newChatKey, setNewChatKey] = useState(Date.now());
  const SERVER_BASE =import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    if (!patientId) return;
    try {
      const raw = localStorage.getItem(`chat_history_${patientId}`);
      setHistories(raw ? JSON.parse(raw) : []);
    } catch {
      setHistories([]);
    }
  }, [patientId]);

  const persistHistories = (next) => {
    setHistories(next);
    if (!patientId) return;
    localStorage.setItem(`chat_history_${patientId}`, JSON.stringify(next));
  };

  const onSaveConversation = (conv) => {
    const idx = histories.findIndex((h) => h.id === conv.id);
    const next = idx >= 0 ? histories.map((h) => (h.id === conv.id ? conv : h)) : [conv, ...histories];
    persistHistories(next);
    setActiveConversation(conv);
  };

  const onStartNew = () => {
    setActiveConversation(null);
    setNewChatKey(Date.now());
  };

  const handleDeleteAll = async () => {
    if (!patientId) {
      alert("No patient logged in.");
      return;
    }
    if (!window.confirm("Delete all chats for this account? This cannot be undone.")) return;

    try {
      await axios.delete(`${SERVER_BASE}/api/chat/all/${patientId}`, { withCredentials: true });
    } catch {
      // continue even if server delete fails
    }

    localStorage.removeItem(`chat_history_${patientId}`);
    setHistories([]);
    setActiveConversation(null);
    setNewChatKey(Date.now());
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      <div className="px-6 pt-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => window.history.back()}>
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">Chat with AI</h1>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleDeleteAll} className="text-sm text-red-600 hover:underline mr-4">
            Delete All Chats
          </button>
          <TopIcons />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden mt-4">
        <div className="lg:hidden w-full flex">
          {showSidebar ? (
            <div className="w-full">
              <Sidebar histories={histories} onSelect={(h) => setActiveConversation(h)} onStartNew={onStartNew} />
              <div className="p-4">
                <button onClick={() => setShowSidebar(false)} className="w-full bg-[#0A4D68] hover:bg-[#083952] text-white rounded-xl py-3 font-medium">
                  Start Chat
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full bg-white">
              <ChatInterface key={newChatKey} patientId={patientId} activeConversation={activeConversation} onSaveConversation={onSaveConversation} />
            </div>
          )}
        </div>

        <div className="hidden lg:flex w-full">
          <div className="w-1/3 xl:w-1/4 border-r border-gray-200 bg-gray-50">
            <Sidebar histories={histories} onSelect={(h) => setActiveConversation(h)} onStartNew={onStartNew} />
          </div>
          <div className="flex-1 bg-white">
            <ChatInterface key={newChatKey} patientId={patientId} activeConversation={activeConversation} onSaveConversation={onSaveConversation} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
