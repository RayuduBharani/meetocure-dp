import React, { useState, useEffect } from "react";
import axios from "axios";
import { ChevronLeft, Trash } from "lucide-react";
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

import Chatpage2 from "./Chatpage2";

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
            <Trash />
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
              <Chatpage2 key={newChatKey} patientId={patientId} activeConversation={activeConversation} onSaveConversation={onSaveConversation} />
            </div>
          )}
        </div>

        <div className="hidden lg:flex w-full">
          <div className="w-1/3 xl:w-1/4 border-r border-gray-200 bg-gray-50">
            <Sidebar histories={histories} onSelect={(h) => setActiveConversation(h)} onStartNew={onStartNew} />
          </div>
          <div className="flex-1 bg-white">
            <Chatpage2 key={newChatKey} patientId={patientId} activeConversation={activeConversation} onSaveConversation={onSaveConversation} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
