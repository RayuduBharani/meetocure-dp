import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaVenusMars,
  FaPhone,
  FaFileAlt,
  FaEllipsisV,
  FaDownload,
  FaEye,
  FaHeartbeat,
  FaStethoscope,
  FaNotesMedical,
} from "react-icons/fa";
import TopIcons from "../../components/TopIcons";

const DoctorPatientDetailsPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const appt = state?.appt;
  const patient = appt?.patientInfo;

  // Use sample user icon for all patients
  const getUserImage = () => {
    return "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png";
  };

  if (!appt || !patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-[#E2E8F0] flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-[#0A4D68] rounded-full flex items-center justify-center">
            <FaUser className="text-white text-3xl" />
          </div>
          <h2 className="text-2xl font-semibold text-[#0A4D68] mb-2">No Patient Data</h2>
          <p className="text-gray-600 mb-6">Patient information is not available</p>
          <button 
            onClick={() => navigate(-1)}
            className="bg-[#0A4D68] text-white px-6 py-3 rounded-xl hover:bg-[#0A4D68]/90 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-[#E2E8F0] font-poppins">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(-1)}
                className="p-3 rounded-xl bg-[#0A4D68]/10 hover:bg-[#0A4D68]/20 transition-colors group"
              >
                <FaArrowLeft className="text-xl text-[#0A4D68] group-hover:scale-110 transition-transform" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-[#0A4D68]">
                  Patient Details
                </h1>
                <p className="text-gray-600 mt-1">View patient information and medical records</p>
              </div>
            </div>
            <TopIcons />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Profile Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-[#F8FAFC] to-[#E2E8F0] p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="relative">
                <img
                  src={patient.photo || getUserImage()}
                  alt={patient.name}
                  className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-lg"
                />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex-1 text-[#0A4D68]">
                <h2 className="text-3xl font-bold mb-2">{patient.name}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <FaUser className="text-lg" />
                    <span className="font-medium">Age: {patient.age}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaVenusMars className="text-lg" />
                    <span className="font-medium">Gender: {patient.gender}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaPhone className="text-lg" />
                    <span className="font-medium">{patient.phone || "+91 XXXXXXXX"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Appointment Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#0A4D68]/10 rounded-xl flex items-center justify-center">
                <FaCalendarAlt className="text-2xl text-[#0A4D68]" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Appointment Date</p>
                <p className="text-xl font-bold text-[#0A4D68]">
                  {new Date(appt.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#0A4D68]/10 rounded-xl flex items-center justify-center">
                <FaClock className="text-2xl text-[#0A4D68]" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Appointment Time</p>
                <p className="text-xl font-bold text-[#0A4D68]">{appt.time}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Medical Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* About Patient */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#0A4D68]/10 rounded-lg flex items-center justify-center">
                <FaNotesMedical className="text-lg text-[#0A4D68]" />
              </div>
              <h2 className="text-xl font-bold text-[#0A4D68]">Patient Information</h2>
            </div>
            <div className="space-y-3 text-gray-700">
              <p className="leading-relaxed">
                <strong>{patient.name}</strong> is a {patient.age}-year-old {patient.gender} currently
                seeking medical consultation. This patient has scheduled an appointment for 
                medical evaluation and treatment.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <p className="text-sm text-gray-600">
                  <strong>Note:</strong> Additional medical history, allergies, and previous 
                  treatments can be documented here by the attending physician.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#0A4D68]/10 rounded-lg flex items-center justify-center">
                <FaHeartbeat className="text-lg text-[#0A4D68]" />
              </div>
              <h2 className="text-xl font-bold text-[#0A4D68]">Quick Stats</h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Appointment Status</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Scheduled
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Priority Level</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  Normal
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Files Attached</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                  3 Documents
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Files */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#0A4D68]/10 rounded-lg flex items-center justify-center">
              <FaFileAlt className="text-lg text-[#0A4D68]" />
            </div>
            <h2 className="text-xl font-bold text-[#0A4D68]">Patient Files & Documents</h2>
          </div>
          
          <div className="space-y-4">
            {[
              { name: "Medical Report", type: "PDF", size: "2.4 MB", icon: FaStethoscope },
              { name: "Lab Results", type: "PDF", size: "1.8 MB", icon: FaHeartbeat },
              { name: "Prescription", type: "PDF", size: "0.9 MB", icon: FaNotesMedical }
            ].map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#0A4D68]/10 rounded-lg flex items-center justify-center group-hover:bg-[#0A4D68]/20 transition-colors">
                    <file.icon className="text-lg text-[#0A4D68]" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{file.name}</p>
                    <p className="text-sm text-gray-500">{file.type} • {file.size}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-[#0A4D68] transition-colors">
                    <FaEye className="text-lg" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-[#0A4D68] transition-colors">
                    <FaDownload className="text-lg" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <FaEllipsisV className="text-lg" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorPatientDetailsPage;
