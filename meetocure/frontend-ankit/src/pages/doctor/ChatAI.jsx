import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPaperclip, FaMicrophone, FaArrowUp } from "react-icons/fa";
import TopIcons from "../../components/TopIcons";
import { CHAT_API_URL } from "../../lib/config";
import { Toaster, toast } from "react-hot-toast";

const ChatAI = () => {
  const navigate = useNavigate();
  const chatRef = useRef(null);
  const fileInputRef = useRef(null);

  const [messages, setMessages] = useState([
    { text: "Hi", time: "11:25", fromUser: true },
    { text: "How can I help you today?", time: "11:25", fromUser: false },
  ]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const getCurrentTime = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    const time = getCurrentTime();
    const userMessage = { text: newMessage.trim(), time, fromUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");

    try {
      const response = await fetch(CHAT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMessage.trim() }),
      });

      const data = await response.json();

      const botReply = {
        text: data.answer || "Sorry, I didn't get that.",
        time: getCurrentTime(),
        fromUser: false,
      };
      setMessages((prev) => [...prev, botReply]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { text: "Error connecting to AI service.", time: getCurrentTime(), fromUser: false },
      ]);
      toast.error("Error connecting to AI service.");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const time = getCurrentTime();
      setMessages((prev) => [...prev, { text: `Attached: ${file.name}`, time, fromUser: true }]);
      toast.success(`File attached: ${file.name}`);
    }
  };

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      toast.error("Voice input not supported in this browser.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setNewMessage((prev) => `${prev} ${transcript}`.trim());
    };
    recognition.onstart = () => toast("Listening...");
    recognition.onend = () => toast("Stopped listening");
    recognition.start();
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-poppins flex flex-col">
      <Toaster position="top-right" reverseOrder={false} />
      
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <FaArrowLeft
            onClick={() => navigate("/doctor/profile")}
            className="text-xl text-[#0A4D68] cursor-pointer"
          />
          <h2 className="text-xl md:text-2xl font-semibold text-[#0A4D68]">
            Chat with AI
          </h2>
        </div>
        <TopIcons />
      </div>

      {/* Messages */}
      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto px-4 md:px-10 py-6 space-y-4"
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`max-w-xs px-5 py-3 text-sm rounded-2xl shadow-md whitespace-pre-line ${
              msg.fromUser
                ? "ml-auto bg-white border border-[#0A4D68] text-right"
                : "mr-auto bg-[#0A4D68] text-white"
            }`}
          >
            <p>{msg.text}</p>
            <p className="text-[10px] mt-1 text-gray-400 text-right">
              {msg.time} {msg.fromUser && "✓✓"}
            </p>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-white border-t px-4 md:px-10 py-4">
        <div className="flex items-center gap-3 rounded-full border shadow-md px-4 py-2 bg-white">
          <button onClick={() => fileInputRef.current.click()}>
            <FaPaperclip className="text-[#0A4D68] cursor-pointer" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileUpload}
          />
          <textarea
            rows={1}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message..."
            className="flex-1 resize-none outline-none text-sm px-2 bg-transparent"
          />
          <button onClick={handleVoiceInput}>
            <FaMicrophone className="text-[#0A4D68] cursor-pointer" />
          </button>
          <button
            onClick={handleSend}
            className="w-9 h-9 bg-[#0A4D68] text-white rounded-full flex items-center justify-center"
          >
            <FaArrowUp className="text-sm" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatAI;
