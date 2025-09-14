import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowUp, FaTrash, FaRobot, FaUserMd } from "react-icons/fa";
import { ChevronLeft, Trash } from "lucide-react";
import TopIcons from "../../components/TopIcons";
import { Toaster, toast } from "react-hot-toast";

// Contact card component for AI Assistant
const ContactCard = () => (
  <div className="bg-[#0A4D68] rounded-2xl p-6 text-white shadow-lg">
    <div className="flex items-start gap-4 mb-4">
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/90 p-1 flex items-center justify-center">
        <FaRobot className="w-10 h-10 text-[#0A4D68]" />
      </div>
      <div className="flex-1">
        <h2 className="text-lg font-semibold">Medical AI Assistant</h2>
        <p className="text-sm text-white/80">Powered by Advanced Medical AI</p>
      </div>
    </div>
  </div>
);

const ChatAI = () => {
  const navigate = useNavigate();
  const chatRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  // Get doctorId from localStorage
  const doctorId = JSON.parse(localStorage.getItem("doctorInfo"))?.doctorId;
  // Fetch chat history on component mount
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const token = localStorage.getItem("doctorToken");
        if (!token || !doctorId) {
          toast.error("Please login again");
          navigate("/auth/doctor");
          return;
        }
        
        const ap=import.meta.env.VITE_BACKEND_URL;
        const response = await fetch(`${ap}/api/chat/doctor/${doctorId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch chat history");
        
        const chats = await response.json();
        setMessages(
          chats.map(chat => ({
            text: chat.message,
            fromUser: chat.role === "doctor",
            time: new Date(chat.createdAt).toLocaleTimeString([], { 
              hour: "2-digit", 
              minute: "2-digit" 
            }),
            sources: chat.sources
          }))
        );
      } catch (error) {
        console.error("Error fetching chat history:", error);
        toast.error("Failed to load chat history");
      }
    };

    fetchChatHistory();
  }, [doctorId, navigate]);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const getCurrentTime = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const handleSend = async () => {
    if (!newMessage.trim() || !doctorId) return;

    const time = getCurrentTime();
    const userMessage = { text: newMessage.trim(), time, fromUser: true };
    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");
    setLoading(true);

    try {
      
      const ap=import.meta.env.VITE_BACKEND_URL;
      const token = localStorage.getItem("doctorToken");
      const response = await fetch(`${ap}/api/chat/doctor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: newMessage.trim(),
          doctorId
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        text: data.message,
        time: getCurrentTime(),
        fromUser: false,
        sources: data.sources || []
      }]);
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to send message");
      setMessages(prev => [...prev, {
        text: "Error connecting to AI service.",
        time: getCurrentTime(),
        fromUser: false
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = async () => {
    try {
      
      const ap=import.meta.env.VITE_BACKEND_URL;
      const token = localStorage.getItem("doctorToken");
      await fetch(`${ap}/api/chat/doctor/${doctorId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMessages([]);
      toast.success("Chat history cleared");
    } catch (error) {
      console.error("Error clearing chat:", error);
      toast.error("Failed to clear chat history");
    }
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/doctor-dashboard")}>
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">AI Medical Assistant</h1>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleClearChat} className="text-sm text-red-600 hover:underline mr-4">
            <Trash size={20}/>
          </button>
          <TopIcons />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden mt-4">
        {/* Sidebar */}
        <div className="hidden lg:block w-1/3 xl:w-1/4 border-r border-gray-200 bg-gray-50 p-4 lg:p-6">
          <ContactCard />
          <div className="mt-6">
            <h3 className="text-sm text-gray-600 mb-2">About AI Assistant</h3>
            <p className="text-sm text-gray-500">
              Ask me any medical questions and I'll provide evidence-based answers to help with your practice.
            </p>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-white flex flex-col">
          {/* Messages */}
          <div
            ref={chatRef}
            className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 space-y-4"
          >
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-full bg-[#0A4D68] bg-opacity-10 flex items-center justify-center">
                    <FaRobot className="w-8 h-8 text-[#0A4D68]" />
                  </div>
                  <h2 className="text-xl font-semibold text-[#0A4D68]">How can I assist you today?</h2>
                  <p className="text-sm text-gray-500 max-w-md">
                    Ask me any medical questions and I'll provide evidence-based answers.
                  </p>
                </div>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${msg.fromUser ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 
                    ${msg.fromUser ? 'bg-[#0A4D68]' : 'bg-gray-100'}`}>
                    {msg.fromUser ? (
                      <FaUserMd className="w-4 h-4 text-white" />
                    ) : (
                      <FaRobot className="w-4 h-4 text-[#0A4D68]" />
                    )}
                  </div>
                  
                  <div className={`flex flex-col max-w-[80%] space-y-1
                    ${msg.fromUser ? 'items-end' : 'items-start'}`}>
                    <div className={`rounded-2xl px-4 py-3 
                      ${msg.fromUser 
                        ? 'bg-[#0A4D68] text-white' 
                        : 'bg-gray-100'}`}>
                      <p className="whitespace-pre-line text-sm">{msg.text}</p>
                      {msg.sources?.length > 0 && (
                        <div className={`mt-2 pt-2 text-xs space-y-1 ${
                          msg.fromUser ? 'border-t border-white/20' : 'border-t border-gray-200'
                        }`}>
                          <p className="font-medium">Sources:</p>
                          {msg.sources.map((source, idx) => (
                            <p key={idx} className={msg.fromUser ? 'opacity-90' : 'text-gray-600'}>
                              {source}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400">{msg.time}</span>
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#0A4D68] rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-[#0A4D68] rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-[#0A4D68] rounded-full animate-bounce delay-200" />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t bg-white p-4 lg:p-6">
            <div className="max-w-4xl mx-auto">
              <div className="relative rounded-lg border shadow-sm">
                <textarea
                  rows={1}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your medical query..."
                  className="w-full px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A4D68] rounded-lg resize-none"
                  disabled={loading}
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !newMessage.trim()}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors
                    ${loading || !newMessage.trim() 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-[#0A4D68] hover:bg-[#0A4D68] hover:text-white'}`}
                >
                  <FaArrowUp className="w-4 h-4" />
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500 text-center">
                Press Enter to send, Shift + Enter for new line
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatAI;
