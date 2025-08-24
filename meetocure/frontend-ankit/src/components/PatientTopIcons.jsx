import React from "react";
import { FaBell, FaCommentDots} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const PatientTopIcons = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-5">
      {/* Chat Icon */}
      <div
        onClick={() => navigate("/patient/chat")}
        title="Chat"
        className="relative group cursor-pointer"
      >
        <FaCommentDots className="text-2xl text-[#0A4D68] group-hover:text-[#08374f] transition duration-200" />
      </div>

      {/* Wallet Icon 
      <div
        onClick={() => navigate("/patient/wallet")}
        title="Wallet"
        className="relative group cursor-pointer"
      >
        <FaWallet className="text-2xl text-[#0A4D68] group-hover:text-[#08374f] transition duration-200" />
      </div>
      */}

      {/* Notification Icon */}
      <div
        onClick={() => navigate("/patient/notifications")}
        title="Notifications"
        className="relative group cursor-pointer"
      >
        <FaBell className="text-2xl text-[#0A4D68] group-hover:text-[#08374f] transition duration-200" />
        {/* Notification Dot */}
        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-ping" />
        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
      </div>
    </div>
  );
};

export default PatientTopIcons;
