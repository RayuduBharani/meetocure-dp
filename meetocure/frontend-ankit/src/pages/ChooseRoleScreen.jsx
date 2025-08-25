import React, { useState } from "react";
import { FaUserMd } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ChooseRoleScreen = () => {
  const [showSOSModal, setShowSOSModal] = useState(false);
  const navigate = useNavigate();

  const handleSOSClick = () => {
    setShowSOSModal(true);
  };

  const handleEmergencyCall = () => {
   navigate("/patient//emergency-contact");
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center font-[Poppins] px-2 sm:px-4 relative">
      {/* SOS Floating Button */}
      <button
        onClick={handleSOSClick}
        className="fixed top-4 right-4 sm:top-5 sm:right-5 w-12 h-12 sm:w-14 sm:h-14 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-2xl flex items-center justify-center z-50 transition-all duration-300 hover:scale-110"
        style={{
          boxShadow: "0 6px 18px rgba(239, 68, 68, 0.4)",
          animation: "pulse 2s infinite",
        }}
      >
        <span className="text-sm sm:text-lg font-bold">SOS</span>
      </button>

      {/* Mobile Mockup */}
      <div className="w-full max-w-[340px] sm:max-w-[380px] h-[640px] sm:h-[720px] bg-white rounded-[1.8rem] sm:rounded-[2rem] shadow-xl overflow-hidden flex flex-col border border-gray-200 mx-auto">
        {/* Top Section */}
        <div className="bg-[#044E63] flex justify-center py-4 sm:py-5 px-4 flex-shrink-0">
          <img
            src="/assets/phone-mock.png"
            alt="Phone UI"
            className="w-[200px] sm:w-[240px] object-contain"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
          {/* Fallback */}
          <div className="w-[200px] sm:w-[240px] h-[110px] sm:h-[140px] hidden items-center justify-center">
            <div className="text-white text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-1 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg
                  className="w-7 h-7 sm:w-8 sm:h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="text-xs sm:text-sm opacity-80">Healthcare Platform</p>
            </div>
          </div>
        </div>

        {/* Bottom Content */}
        <div className="bg-white rounded-t-[1.8rem] sm:rounded-t-[2rem] px-6 sm:px-7 pt-6 sm:pt-7 pb-6 sm:pb-8 text-center flex-1 flex flex-col justify-between">
          <div>
            {/* Logo */}
            <img
              src="/assets/logo.png"
              alt="Logo"
              className="w-16 h-16 sm:w-24 sm:h-24 object-contain mx-auto mb-3 sm:mb-5"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
            {/* Fallback logo */}
            <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-3 sm:mb-5 bg-[#004B5C] rounded-full hidden items-center justify-center">
              <svg
                className="w-8 h-8 sm:w-12 sm:h-12 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            {/* Headings */}
            <h1 className="text-lg sm:text-xl font-bold text-[#004B5C] mb-1">
              Let's get started
            </h1>
            <p className="text-xs sm:text-sm text-black mb-5">Choose your role</p>
          </div>

          {/* Role Buttons */}
          <div className="space-y-3 w-full">
            <button
              onClick={() => navigate("/dual-patient")}
              className="w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 text-white bg-[#004B5C] rounded-full font-semibold text-sm sm:text-base shadow hover:bg-[#003246] transition-all duration-200 active:scale-95"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
              Patient
            </button>

            <button
              onClick={() => navigate("/dual-doctor")}
              className="w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 text-white bg-[#004B5C] rounded-full font-semibold text-sm sm:text-base shadow hover:bg-[#003246] transition-all duration-200 active:scale-95"
            >
             <FaUserMd className="w-4 h-4 sm:w-4 sm:h-4" />
              Doctor
            </button>
          </div>
        </div>
      </div>

      {/* SOS Modal */}
      {showSOSModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 px-3">
          <div className="bg-white rounded-xl p-5 sm:p-6 max-w-xs sm:max-w-sm w-full mx-3 shadow-2xl">
            <div className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 bg-red-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-7 h-7 sm:w-8 sm:h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">
                Emergency Assistance
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mb-5">
                You're about to contact emergency services. Use only in genuine
                medical emergencies.
              </p>

              {/* Buttons */}
              <div className="space-y-2">
                <button
                  onClick={handleEmergencyCall}
                  className="w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-bold text-sm sm:text-base shadow-md transition-all duration-300"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  Call Emergency Services
                </button>

                <button
                  onClick={() => setShowSOSModal(false)}
                  className="w-full flex items-center justify-center gap-2 py-2 sm:py-2.5 bg-gray-100 hover:bg-gray-200 text-[#004B5C] rounded-full font-medium text-sm sm:text-base transition-all duration-300"
                >
                  Cancel
                </button>
              </div>

              <p className="text-[10px] sm:text-xs text-gray-400 mt-3">
                By proceeding, you confirm this is a genuine emergency requiring
                immediate medical attention.
              </p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
};

export default ChooseRoleScreen;
