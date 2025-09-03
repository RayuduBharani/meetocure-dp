import React from "react";

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  type = "default", // default, danger, warning, success
  icon = null 
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          confirmButton: "bg-white-500 hover:bg-white-600",
          icon: "⚠️",
          iconBg: "bg-white-100"
        };
      case "warning":
        return {
          confirmButton: "bg-white-500 hover:bg-white-600",
          icon: "⚠️",
          iconBg: "bg-white-100"
        };
      case "success":
        return {
          confirmButton: "bg-white-500 hover:bg-white-600",
          icon: "✅",
          iconBg: "bg-white-100"
        };
      default:
        return {
          confirmButton: "bg-[#004B5C] hover:bg-[#003246]",
          icon: "ℹ️",
          iconBg: "bg-blue-100"
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2rem] shadow-xl text-center animate-fade-in">
        
        {/* Icon */}
        <div className={`w-20 h-20 ${styles.iconBg} rounded-full flex items-center justify-center mx-auto mt-8 mb-4`}>
          <span className="text-3xl">{icon || styles.icon}</span>
        </div>

        {/* Title */}
        <h2 className="text-[22px] font-bold text-[#1F2A37] mb-2 px-6">
          {title}
        </h2>

        {/* Message */}
        <p className="text-gray-500 mb-8 px-6">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="space-y-3 px-6 pb-8">
          <button
            onClick={onConfirm}
            className={`w-full py-3 rounded-full font-semibold text-base text-white transition ${styles.confirmButton}`}
          >
            {confirmText}
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-full bg-[#E6E8EB] text-[#1F2A37] font-semibold text-base hover:bg-gray-200 transition"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
