import React from "react";
import toast from "react-hot-toast";

const LogoutModal = ({ onConfirm, onCancel }) => {
  const handleLogout = () => {
    toast.success("Logged out successfully!");
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white w-11/12 max-w-md p-8 rounded-[2rem] shadow-xl text-center animate-fade-in">

        {/* Full-Fit Logout Image (Taller & Wider) */}
        <img
          src="/assets/popups/logout.png"
          alt="Logout"
          className="w-36 h-36 object-contain mx-auto mb-6"
        />

        {/* Heading */}
        <h2 className="text-[22px] font-bold text-[#1F2A37] mb-2">
          Logout Confirmation
        </h2>

        {/* Subtext */}
        <p className="text-gray-500 mb-6">
          Are you sure you want to log out?
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleLogout}
            className="w-full py-3 rounded-full bg-[#004B5C] text-white font-semibold text-base hover:bg-[#003246] transition"
          >
            Yes
          </button>
          <button
            onClick={onCancel}
            className="w-full py-3 rounded-full bg-[#E6E8EB] text-[#1F2A37] font-semibold text-base hover:bg-gray-200 transition"
          >
            NO
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
