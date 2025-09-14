import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaEdit,
  FaUserEdit,
  FaBell,
  FaComments,
  FaCog,
  FaQuestionCircle,
  FaFileContract,
  FaSignOutAlt,
} from "react-icons/fa";
import TopIcons from "../../../components/PatientTopIcons";
import LogoutModal from "../../../components/LogoutModal";
import { API_BASE_URL } from "../../../lib/config";

const options = [
  { icon: <FaUserEdit />, label: "Edit Profile", path: "/patient/profile/edit" },
  { icon: <FaBell />, label: "Notifications", path: "/patient/notifications" },
  { icon: <FaComments />, label: "Chat with AI", path: "/patient/chat" },
  { icon: <FaCog />, label: "Settings", path: "/patient/settings" },
  { icon: <FaQuestionCircle />, label: "Help and Support", path: "/patient/help" },
  { icon: <FaFileContract />, label: "Terms and Conditions", path: "/patient/terms" },
  { icon: <FaSignOutAlt />, label: "Log Out", path: "logout" },
];

const PatientProfilePage = () => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);


  const [patientInfo, setPatientInfo] = useState({ name: "", phone: "" });

  useEffect(() => {
    const fetchPatientInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/api/patient/profile/get`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setPatientInfo({
          name: data.name,
          phone: data.phone,
          photo: data.photo || " ",
        });
      } catch (error) {
        console.error("Failed to fetch patient info:", error);
      }
    };

    fetchPatientInfo();
  }, []);



  const handleOptionClick = (path) => {
    if (path === "logout") {
      setShowLogoutModal(true);
    } else {
      navigate(path);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F4F8] to-[#E9F1F8] font-[Poppins] pb-24 md:pb-10">
      <div className="flex justify-between items-center px-6 py-6 bg-white shadow-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <FaArrowLeft
            onClick={() => navigate("/patient-dashboard")}
            className="text-[#0A4D68] text-xl cursor-pointer hover:text-[#08374f]"
          />
          <h1 className="text-2xl md:text-3xl font-bold text-[#0A4D68]">Profile</h1>
        </div>
        <TopIcons />
      </div>

      <div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center text-center px-4 mt-10"
      >
        <div className="relative mb-4">
          <img
            src={patientInfo.photo || "/default-avatar.png"}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
          />

        </div>
        <h2 className="text-xl font-semibold text-[#0A4D68] mb-1">
          {patientInfo.name || "Add your name"}
        </h2>
        <p className="text-[#6B7280] mb-6">
          {patientInfo.phone ? `${patientInfo.phone}` : "Add your phone number"}
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-6 mt-10 space-y-4">
        {options.map((option, index) => (
          <div
            key={index}
            onClick={() => handleOptionClick(option.path)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white hover:bg-[#F9FAFB] rounded-xl shadow-sm px-6 py-4 flex justify-between items-center cursor-pointer group transition-all"
          >
            <div className="flex items-center gap-4 text-[#0A4D68] text-lg group-hover:scale-105 transition">
              {option.icon}
              <span className="text-[#0A4D68] text-base md:text-lg font-medium">
                {option.label}
              </span>
            </div>
            <span className="text-gray-300 text-xl font-light group-hover:text-gray-500">
              &gt;
            </span>
          </div>
        ))}
      </div>

      {showLogoutModal && (
        <LogoutModal
          onCancel={() => setShowLogoutModal(false)}
          onConfirm={() => {
            localStorage.clear();
            navigate("/choose-role");
          }}
        />
      )}
    </div>
  );
};

export default PatientProfilePage;
