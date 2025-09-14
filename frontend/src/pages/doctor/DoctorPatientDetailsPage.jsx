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
  // Extract patient data with fallbacks
  const patient = appt?.patientInfo || appt?.patient || {};
  
  // Use sample user icon for all patients
  const getUserImage = () => {
    return "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png";
  };

  if (!appt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-[#E2E8F0] flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-[#0A4D68] rounded-full flex items-center justify-center">
            <FaUser className="text-white text-3xl" />
          </div>
          <h2 className="text-2xl font-semibold text-[#0A4D68] mb-2">No Appointment Data</h2>
          <p className="text-gray-600 mb-6">Appointment information is not available</p>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 font-poppins">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(-1)}
                className="p-3 rounded-2xl bg-gradient-to-r from-[#0A4D68]/10 to-[#0A4D68]/20 hover:from-[#0A4D68]/20 hover:to-[#0A4D68]/30 transition-all duration-300 group shadow-sm"
              >
                <FaArrowLeft className="text-xl text-[#0A4D68] group-hover:scale-110 transition-transform duration-200" />
              </button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0A4D68] to-[#1e6b8a] bg-clip-text text-transparent">
                  Patient Details
                </h1>
                <p className="text-gray-600 mt-1 font-medium">View patient information and medical records</p>
              </div>
            </div>
            <TopIcons />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Profile Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden mb-8 hover:shadow-2xl transition-all duration-300">
          <div className="bg-gradient-to-r from-[#0A4D68]/5 via-blue-50/50 to-indigo-50/50 p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#0A4D68]/20 to-blue-500/20 rounded-3xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                <img
                  src={patient.photo || getUserImage()}
                  alt={patient.name}
                  className="relative w-36 h-36 rounded-3xl object-cover border-4 border-white shadow-2xl group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                  <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-[#0A4D68] to-[#1e6b8a] bg-clip-text text-transparent mb-3">
                  {patient.name || appt.name || "Unknown Patient"}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div className="flex items-center gap-3 bg-white/60 rounded-xl p-3 shadow-sm">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#0A4D68]/10 to-[#0A4D68]/20 rounded-lg flex items-center justify-center">
                      <FaUser className="text-[#0A4D68] text-lg" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Age</p>
                      <p className="font-semibold text-gray-900">{patient.age || "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white/60 rounded-xl p-3 shadow-sm">
                    <div className="w-10 h-10 bg-gradient-to-r from-pink-100 to-rose-200 rounded-lg flex items-center justify-center">
                      <FaVenusMars className="text-pink-600 text-lg" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Gender</p>
                      <p className="font-semibold text-gray-900">{patient.gender || "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white/60 rounded-xl p-3 shadow-sm">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-emerald-200 rounded-lg flex items-center justify-center">
                      <FaPhone className="text-green-600 text-lg" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Phone</p>
                      <p className="font-semibold text-gray-900">{patient.phone || appt.phone || "+91 XXXXXXXX"}</p>
                    </div>
                  </div>
                </div>
                {patient.blood_group && (
                  <div className="mt-4 inline-block">
                    <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-3 shadow-sm">
                      <span className="text-sm font-semibold text-red-700">Blood Group: {patient.blood_group}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Appointment Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-[#0A4D68]/10 to-blue-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FaCalendarAlt className="text-2xl text-[#0A4D68]" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1 font-medium">Appointment Date</p>
                <p className="text-xl font-bold bg-gradient-to-r from-[#0A4D68] to-[#1e6b8a] bg-clip-text text-transparent">
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
          
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-100 to-green-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FaClock className="text-2xl text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1 font-medium">Appointment Time</p>
                <p className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">{appt.time}</p>
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
                <strong>{patient.name || appt.name || "Patient"}</strong> is a {patient.age || "unknown"}-year-old {patient.gender || "unknown"} currently
                seeking medical consultation. This patient has scheduled an appointment for 
                medical evaluation and treatment.
              </p>
              
              {appt.reason && (
                <div className="bg-blue-50 rounded-lg p-4 mt-4">
                  <p className="text-sm text-blue-800">
                    <strong>Appointment Reason:</strong> {appt.reason}
                  </p>
                </div>
              )}
              
              {patient.allergies && patient.allergies.length > 0 && (
                <div className="bg-red-50 rounded-lg p-4 mt-4">
                  <p className="text-sm text-red-800 mb-2">
                    <strong>Allergies:</strong>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {patient.allergies.map((allergy, index) => (
                      <span key={index} className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {patient.medical_history_summary && (
                <div className="bg-yellow-50 rounded-lg p-4 mt-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Medical History:</strong> {patient.medical_history_summary}
                  </p>
                </div>
              )}
              
              {patient.note && (
                <div className="bg-gray-50 rounded-lg p-4 mt-4">
                  <p className="text-sm text-gray-600">
                    <strong>Patient Note:</strong> {patient.note}
                  </p>
                </div>
              )}
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
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  appt.status === "completed" ? "bg-green-100 text-green-800" :
                  appt.status === "cancelled" ? "bg-red-100 text-red-800" :
                  appt.status === "confirmed" ? "bg-blue-100 text-blue-800" :
                  "bg-yellow-100 text-yellow-800"
                }`}>
                  {appt.status || "pending"}
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
                  {appt.medicalRecords ? appt.medicalRecords.length : 0} Documents
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
            {appt.medicalRecords && appt.medicalRecords.length > 0 ? (
              appt.medicalRecords.map((record, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#0A4D68]/10 rounded-lg flex items-center justify-center group-hover:bg-[#0A4D68]/20 transition-colors">
                      <FaStethoscope className="text-lg text-[#0A4D68]" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{record.description || record.record_type || "Medical Record"}</p>
                      <p className="text-sm text-gray-500">
                        {record.record_type || "Document"} • Uploaded {new Date(record.upload_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => window.open(record.file_url, '_blank')}
                      className="p-2 text-gray-400 hover:text-[#0A4D68] transition-colors"
                      title="View file"
                    >
                      <FaEye className="text-lg" />
                    </button>
                    <button 
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = record.file_url;
                        link.download = record.description || 'medical-record';
                        link.click();
                      }}
                      className="p-2 text-gray-400 hover:text-[#0A4D68] transition-colors"
                      title="Download file"
                    >
                      <FaDownload className="text-lg" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <FaFileAlt className="text-2xl text-gray-400" />
                </div>
                <p className="text-gray-500 mb-2">No medical records uploaded</p>
                <p className="text-sm text-gray-400">Patient has not uploaded any medical documents for this appointment.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorPatientDetailsPage;

