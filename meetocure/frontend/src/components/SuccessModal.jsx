import React, { useEffect } from "react";

const SuccessModal = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  buttonText = "Continue",
  autoClose = true,
  autoCloseDelay = 3000,
  icon = "✅"
}) => {
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2rem] shadow-xl text-center animate-fade-in">
        
        {/* Success Icon */}
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mt-8 mb-4">
          <span className="text-4xl">{icon}</span>
        </div>

        {/* Title */}
        <h2 className="text-[22px] font-bold text-[#1F2A37] mb-2 px-6">
          {title}
        </h2>

        {/* Message */}
        <p className="text-gray-500 mb-8 px-6">
          {message}
        </p>

        {/* Action Button */}
        <div className="px-6 pb-8">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-full font-semibold text-base text-white bg-green-500 hover:bg-green-600 transition"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
