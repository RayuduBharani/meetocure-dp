import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../../lib/config";
import {
  FaArrowLeft,
  FaEdit,
  FaUserEdit,
  FaBell as FaNotify,
  FaComments,
  FaCog,
  FaQuestionCircle,
  FaFileContract,
  FaSignOutAlt,
  FaUser,
} from "react-icons/fa";
import BottomNav from "../../../components/BottomNav";
import TopIcons from "../../../components/TopIcons";
import LogoutModal from "../../../components/LogoutModal";
import profileImg from "/assets/doc_profile.png";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const options = [
  { icon: <FaUser />, label: "View Profile", path: "/doctor/profile-view" },
  { icon: <FaUserEdit />, label: "Edit Profile", path: "/doctor/profile/edit" },
  { icon: <FaNotify />, label: "Notifications", path: "/doctor/notifications" },
  { icon: <FaComments />, label: "Chat with AI", path: "/doctor/ai-chat" },
  { icon: <FaCog />, label: "Settings", path: "/doctor/settings" },
  { icon: <FaQuestionCircle />, label: "Help and Support", path: "/doctor/help" },
  { icon: <FaFileContract />, label: "Terms and Conditions", path: "/doctor/terms" },
  { icon: <FaSignOutAlt />, label: "Log Out", path: "logout" },
];

const DoctorProfilePage = () => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const defaultImage = profileImg;
  const [profileImage, setProfileImage] = useState(() =>
    localStorage.getItem("doctorProfileImage") || defaultImage
  );

  // Save new image to localStorage
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        localStorage.setItem("doctorProfileImage", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOptionClick = (path) => {
    if (path === "logout") {
      setShowLogoutModal(true);
    } else {
      navigate(path);
    }
  };

  const [doctorInfo, setDoctorInfo] = useState();

  useEffect(() => {
    const fetchDoctorInfo = async () => {
      try {
        const token = localStorage.getItem("doctorToken");
        console.log(token)
        const res = await fetch(`${API_BASE_URL}/api/doctor/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setDoctorInfo(data);
        console.log("Fetched doctor info:", data);
      } catch (error) {
        console.error("Failed to fetch doctor info:", error);
      }
    };

    fetchDoctorInfo();
  }, []);


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F4F8] to-[#E9F1F8] font-[Poppins] pb-24 md:pb-10">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-6 bg-white shadow-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <FaArrowLeft
            onClick={() => navigate("/doctor-dashboard")}
            className="text-[#0A4D68] text-xl cursor-pointer hover:text-[#08374f]"
          />
          <h1 className="text-2xl md:text-3xl font-bold text-[#0A4D68]">Profile</h1>
        </div>
        <TopIcons />
      </div>

      {/* Profile Image and Info */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center text-center px-4 mt-10"
      >
        <div className="relative mb-4">
          <img
            src={doctorInfo?.profileImage || profileImage}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
          />
          
        </div>
        <h2 className="text-xl font-semibold text-[#0A4D68] mb-1">
          {doctorInfo?.fullName || "Loading..."}
        </h2>
        <p className="text-[#6B7280] mb-2">
          {doctorInfo?.primarySpecialization || "Loading"}
        </p>
        <p className="text-[#0A4D68] font-medium mb-2">
          Consultation Fee: ₹{doctorInfo?.consultationFee || "Loading"}
        </p>
        {doctorInfo?.about && (
          <p className="text-[#6B7280] mb-6 max-w-lg text-sm">
            {doctorInfo.about}
          </p>
        )}
      </motion.div>

      {/* Profile Options */}
      <div className="max-w-3xl mx-auto px-6 mt-10 space-y-4">
        {options.map((option, index) => (
          <motion.div
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
          </motion.div>
        ))}
      </div>

      {/* Bottom Nav */}
      <div className="block md:hidden fixed bottom-0 left-0 right-0">
        <BottomNav />
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <LogoutModal
          onCancel={() => setShowLogoutModal(false)}
          onConfirm={() => {
            localStorage.clear();
            setShowLogoutModal(false);
            navigate("/choose-role");
          }}
        />
      )}
    </div>
  );
};

export default DoctorProfilePage;
