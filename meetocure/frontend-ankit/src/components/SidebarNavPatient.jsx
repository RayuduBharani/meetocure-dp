import React, { useState } from "react";
import {
  FaHome,
  FaCalendarAlt,
  FaUser,
  FaBars,
  FaHospital,
  FaQuestionCircle, // for enquiry
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import BottomNav from "./BottomNav";
import FloatingContactButton from "./FloatingContactButton"; 
import PatientEnquiryForm from "../pages/patient/PatientEnquery/PatientPublicForm"; // import the enquiry form

// navitems
const navItems = [
  { icon: <FaHospital />, label: "Hospitals", path: "/hospitalpages/Cards-data" },
  { icon: <FaHome />, label: "Home", path: "/patient-dashboard" },
  { 
    icon: <FaCalendarAlt />, 
    label: (
      <span className="flex flex-col text-center">
        <span>My</span>
        <span>Appointments</span>
      </span>
    ), 
    path: "/patient/calendar" 
  },
  { icon: <FaUser />, label: "Profile", path: "/patient/profile" },
  { icon: <FaQuestionCircle />, label: "Enquiry", action: "openEnquiry" }, // ✅ New Enquiry item
];

const SidebarNavPatient = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false); // track enquiry modal
  const navigate = useNavigate();
  const location = useLocation();

  const isBottomNavVisible = window.innerWidth < 768;
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* Sidebar for md+ screens */}
      <div
        className={`hidden md:flex flex-col bg-white shadow-xl min-h-full transition-all duration-300 ease-in-out ${isOpen ? "w-33" : "w-16"
          }`}
      >
        {/* Toggle Button */}
        <div className="flex justify-center items-center py-4 border-b border-gray-200">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-[#0A4D68] text-2xl focus:outline-none"
            title={isOpen ? "Collapse" : "Expand"}
          >
            <FaBars />
          </button>
        </div>

        {/* Nav Items */}
        <div className="flex flex-col items-center gap-3 py-6 px-2 text-[#0A4D68]">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;

            return (
              <div
                key={index}
                onClick={() => {
                  if (item.action === "openEnquiry") {
                    setIsEnquiryOpen(true); // open enquiry modal
                  } else if (item.path) {
                    navigate(item.path);
                  }
                }}
                className={`group flex flex-col items-center justify-center gap-1 py-2 px-2 cursor-pointer transition-all duration-200 ${
                  isActive
                    ? "text-[#0A4D68] font-semibold"
                    : "text-gray-600 hover:text-[#0A4D68]"
                }`}
                title={item.label}
              >
                <div className="text-2xl">{item.icon}</div>
                {isOpen && (
                  <span className="text-xs mt-1 leading-tight">{item.label}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Nav for mobile screens */}
      <div className="block md:hidden">
        <BottomNav 
          navItems={navItems.map((item) =>
            item.action === "openEnquiry"
              ? { ...item, onClick: () => setIsEnquiryOpen(true) } // custom open modal
              : item
          )}
        />
      </div>

      {/* Floating Contact Button */}
      <FloatingContactButton isBottomNavVisible={isBottomNavVisible} />

      {/* Patient Enquiry Modal */}
      {isEnquiryOpen && <PatientEnquiryForm open={isEnquiryOpen} setOpen={setIsEnquiryOpen} />}
    </>
  );
};

export default SidebarNavPatient;
