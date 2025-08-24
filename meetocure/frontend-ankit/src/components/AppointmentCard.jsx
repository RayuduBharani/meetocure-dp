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

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 w-full">
      {/* Date & Time */}
      <div className="flex justify-between items-center text-[#0A4D68] font-medium text-sm mb-4">
        <div className="flex items-center gap-2">
          <FaCalendarAlt className="text-base" />
          <span>{new Date(appt.date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <FaClock className="text-base" />
          <span>{appt.time}</span>
        </div>
      </div>

      {/* Patient Info */}
      <div className="flex gap-6 items-start bg-[#F9FAFB] rounded-xl p-4 shadow-sm mb-5">
        <img
          src={"/assets/patient_default.png"} // Optional: store photo separately if needed
          alt={patient.name || "Patient"}
          className="w-20 h-20 rounded-xl object-cover border shadow-sm"
        />
        <div className="flex-1 text-sm text-[#1F2A37]">
          <p className="font-semibold text-lg mb-1">{patient.name || "Unknown"}</p>
          <div className="space-y-1 text-gray-600">
            <p className="flex items-center gap-2">
              <FaUser className="text-[#0A4D68]" />
              Age: {age}
            </p>
            <p className="flex items-center gap-2">
              <FaVenusMars className="text-[#0A4D68]" />
              Gender: {patient.gender || "-"}
            </p>
            <p className="flex items-center gap-2">
              <FaPhone className="text-[#0A4D68]" />
              Phone: {patient.phone}
            </p>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-5">
        <button className="w-full bg-gray-100 hover:bg-gray-200 text-sm py-2.5 rounded-full font-medium transition">
          Cancel
        </button>
        <button
          onClick={() =>
            navigate(`/doctor/patient/${appt._id}`, { state: { appt } })
          }
          className="w-full bg-[#0A4D68] hover:bg-[#083e54] text-white text-sm py-2.5 rounded-full font-medium transition"
        >
          View more
        </button>
      </div>
    </div>
  );
};


export default AppointmentCard;
