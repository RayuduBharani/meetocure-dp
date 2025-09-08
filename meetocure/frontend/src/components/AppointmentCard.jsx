import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaVenusMars,
  FaPhone,
} from "react-icons/fa";


const AppointmentCard = ({ appt }) => {
  const navigate = useNavigate();

  const patient = appt.patientInfo || {};
  const age = patient.age || "-";
  
  const defaultImage = "https://e7.pngegg.com/pngimages/709/489/png-clipart-computer-icons-physician-desktop-patient-home-monitoring-logo-monochrome.png";

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 w-full border border-white/20 hover:scale-[1.02] group">
      {/* Date & Time Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3 text-[#0A4D68]">
          <div className="w-10 h-10 bg-gradient-to-r from-[#0A4D68]/10 to-blue-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <FaCalendarAlt className="text-sm" />
          </div>
          <span className="font-semibold">{new Date(appt.date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-3 text-emerald-600">
          <div className="w-10 h-10 bg-gradient-to-r from-emerald-100 to-green-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <FaClock className="text-sm" />
          </div>
          <span className="font-semibold">{appt.time}</span>
        </div>
      </div>

      {/* Patient Info */}
      <div className="flex gap-4 items-start mb-6">
        <div className="relative group/avatar">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A4D68]/20 to-blue-500/20 rounded-2xl blur-md group-hover/avatar:blur-lg transition-all duration-300"></div>
          <img
            src={defaultImage}
            alt={patient.name || "Patient"}
            className="relative w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-lg group-hover/avatar:scale-105 transition-transform duration-300"
          />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">{patient.name || "Unknown Patient"}</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-r from-[#0A4D68]/10 to-[#0A4D68]/20 rounded-lg flex items-center justify-center">
                <FaUser className="text-[#0A4D68] text-xs" />
              </div>
              <span className="font-medium">Age: {age}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-r from-pink-100 to-rose-200 rounded-lg flex items-center justify-center">
                <FaVenusMars className="text-pink-600 text-xs" />
              </div>
              <span className="font-medium">Gender: {patient.gender || "-"}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-r from-green-100 to-emerald-200 rounded-lg flex items-center justify-center">
                <FaPhone className="text-green-600 text-xs" />
              </div>
              <span className="font-medium">{patient.phone || "Not provided"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reason */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <p className="text-sm text-blue-800 font-medium">
            <span className="font-semibold">Reason:</span> {appt.reason || "Not specified"}
          </p>
        </div>
      </div>

      {/* Status */}
      {appt.status && appt.status !== "pending" && appt.status !== "confirmed" && (
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 font-medium">Status:</span>
            <span className={`px-4 py-2 rounded-full text-xs font-semibold shadow-sm ${
              appt.status === "completed" ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200" : 
              appt.status === "cancelled" ? "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200" : 
              "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200"
            }`}>
              {appt.status}
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {appt.status !== "cancelled" && appt.status !== "completed" && (
          <button className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 text-sm py-3 rounded-xl font-semibold transition-all duration-300 shadow-sm hover:shadow-md">
            Cancel
          </button>
        )}
        <button
          onClick={() =>
            navigate(`/doctor/patient/${appt._id}`, { state: { appt } })
          }
          className="flex-1 bg-gradient-to-r from-[#0A4D68] to-[#1e6b8a] hover:from-[#083e54] hover:to-[#0A4D68] text-white text-sm py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          View Details
        </button>
      </div>
    </div>
  );
};


export default AppointmentCard;
