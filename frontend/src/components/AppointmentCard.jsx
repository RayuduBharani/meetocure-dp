import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaVenusMars,
  FaPhone,
} from "react-icons/fa";
import { API_BASE_URL } from "../lib/config";


const AppointmentCard = ({ appt, onStatusUpdate }) => {
  const navigate = useNavigate();

  const patient = appt.patientInfo || {};
  const age = patient.age || "-";
  
  const defaultImage = "https://e7.pngegg.com/pngimages/709/489/png-clipart-computer-icons-physician-desktop-patient-home-monitoring-logo-monochrome.png";

  const handleAccept = async () => {
    try {
      const token = localStorage.getItem("doctorToken") || localStorage.getItem("token");
      if (!token) {
        alert("No authentication token found");
        return;
      }

      const confirmed = window.confirm(
        `Are you sure you want to accept the appointment with ${patient.name || "this patient"}?`
      );

      if (!confirmed) return;

      const response = await fetch(`${API_BASE_URL}/api/appointments/${appt._id}/accept`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert("Appointment accepted successfully!");
        if (onStatusUpdate) {
          onStatusUpdate(appt._id, "accepted");
        }
      } else {
        throw new Error(data.message || "Failed to accept appointment");
      }
    } catch (err) {
      console.error("Error accepting appointment:", err);
      alert(`Error accepting appointment: ${err.message}`);
    }
  };

  const handleComplete = async () => {
    try {
      const token = localStorage.getItem("doctorToken") || localStorage.getItem("token");
      if (!token) {
        alert("No authentication token found");
        return;
      }

      const confirmed = window.confirm(
        `Are you sure you want to mark the appointment with ${patient.name || "this patient"} as completed?`
      );

      if (!confirmed) return;

      const response = await fetch(`${API_BASE_URL}/api/appointments/${appt._id}/complete`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert("Appointment completed successfully!");
        if (onStatusUpdate) {
          onStatusUpdate(appt._id, "completed");
        }
      } else {
        throw new Error(data.message || "Failed to complete appointment");
      }
    } catch (err) {
      console.error("Error completing appointment:", err);
      alert(`Error completing appointment: ${err.message}`);
    }
  };

  const handleCancel = async () => {
    try {
      const token = localStorage.getItem("doctorToken") || localStorage.getItem("token");
      if (!token) {
        alert("No authentication token found");
        return;
      }

      const confirmed = window.confirm(
        `Are you sure you want to cancel the appointment with ${patient.name || "this patient"}?`
      );

      if (!confirmed) return;

      const response = await fetch(`${API_BASE_URL}/api/appointments/${appt._id}/cancel`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert("Appointment cancelled successfully!");
        if (onStatusUpdate) {
          onStatusUpdate(appt._id, "cancelled");
        }
      } else {
        throw new Error(data.message || "Failed to cancel appointment");
      }
    } catch (err) {
      console.error("Error cancelling appointment:", err);
      alert(`Error cancelling appointment: ${err.message}`);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 w-full border border-white/20 hover:scale-[1.02] group">
      {/* Date & Time Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 text-[#0A4D68]">
          <div className="w-8 h-8 bg-gradient-to-r from-[#0A4D68]/10 to-blue-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <FaCalendarAlt className="text-xs" />
          </div>
          <span className="font-semibold text-sm">{new Date(appt.date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2 text-emerald-600">
          <div className="w-8 h-8 bg-gradient-to-r from-emerald-100 to-green-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <FaClock className="text-xs" />
          </div>
          <span className="font-semibold text-sm">{appt.time}</span>
        </div>
      </div>

      {/* Patient Info */}
      <div className="flex gap-3 items-start mb-4">
        <div className="relative group/avatar">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A4D68]/20 to-blue-500/20 rounded-xl blur-md group-hover/avatar:blur-lg transition-all duration-300"></div>
          <img
            src={defaultImage}
            alt={patient.name || "Patient"}
            className="relative w-12 h-12 rounded-xl object-cover border-2 border-white shadow-lg group-hover/avatar:scale-105 transition-transform duration-300"
          />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-base bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">{patient.name || "Unknown Patient"}</h3>
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gradient-to-r from-[#0A4D68]/10 to-[#0A4D68]/20 rounded-md flex items-center justify-center">
                <FaUser className="text-[#0A4D68] text-xs" />
              </div>
              <span className="font-medium">Age: {age}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gradient-to-r from-pink-100 to-rose-200 rounded-md flex items-center justify-center">
                <FaVenusMars className="text-pink-600 text-xs" />
              </div>
              <span className="font-medium">Gender: {patient.gender || "-"}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gradient-to-r from-green-100 to-emerald-200 rounded-md flex items-center justify-center">
                <FaPhone className="text-green-600 text-xs" />
              </div>
              <span className="font-medium">{patient.phone || "Not provided"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reason */}
      <div className="mb-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
          <p className="text-xs text-blue-800 font-medium">
            <span className="font-semibold">Reason:</span> {appt.reason || "Not specified"}
          </p>
        </div>
      </div>

      {/* Status */}
      {appt.status && appt.status !== "pending" && (
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 font-medium">Status:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
              appt.status === "completed" ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200" : 
              appt.status === "cancelled" ? "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200" : 
              appt.status === "accepted" ? "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200" :
              "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200"
            }`}>
              {appt.status}
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2">
        {/* Primary Action Buttons Row */}
        <div className="flex gap-2">
          {appt.status === "pending" && (
            <button
              onClick={handleAccept}
              className="flex-1 bg-gradient-to-r from-green-100 to-emerald-100 hover:from-green-200 hover:to-emerald-200 text-green-700 text-xs py-2 rounded-lg font-semibold transition-all duration-300 shadow-sm hover:shadow-md"
            >
              Accept
            </button>
          )}
          {appt.status === "accepted" && (
            <button
              onClick={handleComplete}
              className="flex-1 bg-gradient-to-r from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 text-blue-700 text-xs py-2 rounded-lg font-semibold transition-all duration-300 shadow-sm hover:shadow-md"
            >
              Complete
            </button>
          )}
          <button
            onClick={() =>
              navigate(`/doctor/patient/${appt._id}`, { state: { appt } })
            }
            className="flex-1 bg-gradient-to-r from-[#0A4D68] to-[#1e6b8a] hover:from-[#083e54] hover:to-[#0A4D68] text-white text-xs py-2 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            View Details
          </button>
        </div>
        
        {/* Cancel Button Row */}
        <div className="flex gap-2">
          {appt.status !== "cancelled" && appt.status !== "completed" && (
            <button
              onClick={handleCancel}
              className="flex-1 bg-gradient-to-r from-red-100 to-rose-100 hover:from-red-200 hover:to-rose-200 text-red-700 text-xs py-2 rounded-lg font-semibold transition-all duration-300 shadow-sm hover:shadow-md"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


export default AppointmentCard;
