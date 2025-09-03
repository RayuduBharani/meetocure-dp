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
} from "react-icons/fa";
import TopIcons from "../../components/TopIcons";

const DoctorPatientDetailsPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const appt = state?.appt;
  const patient = appt?.patientInfo;

  if (!appt || !patient) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 text-lg">
        No patient data available.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFC] to-[#EFF5F9] font-poppins text-[#1F2A37] px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)}>
            <FaArrowLeft className="text-2xl text-[#0A4D68]" />
          </button>
          <h1 className="text-3xl font-bold tracking-tight text-[#0A4D68]">
            Patient Details
          </h1>
        </div>
        <TopIcons />
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col md:flex-row md:items-center gap-6 mb-10">
        <img
          src={patient.photo || "https://via.placeholder.com/100"}
          alt={patient.name}
          className="w-28 h-28 rounded-xl object-cover border shadow"
        />
        <div className="flex-1">
          <p className="text-2xl font-semibold text-[#0A4D68] mb-1">
            {patient.name}
          </p>
          <div className="text-base text-gray-600 space-y-1">
            <p>
              <FaUser className="inline mr-2 text-[#0A4D68]" /> Age:{" "}
              {patient.age}
            </p>
            <p>
              <FaVenusMars className="inline mr-2 text-[#0A4D68]" /> Gender:{" "}
              {patient.gender}
            </p>
            <p>
              <FaPhone className="inline mr-2 text-[#0A4D68]" /> Phone:{" "}
              {patient.phone || "+91 XXXXXXXX"}
            </p>
          </div>
        </div>
      </div>

      {/* Appointment Info */}
      <div className="grid grid-cols-2 gap-6 text-center mb-12">
        <div className="bg-white p-6 rounded-xl shadow">
          <FaCalendarAlt className="text-[#0A4D68] text-2xl mb-2 mx-auto" />
          <p className="text-base text-gray-500">Appointment Date</p>
          <p className="text-lg font-semibold">{new Date(appt.date).toLocaleDateString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <FaClock className="text-[#0A4D68] text-2xl mb-2 mx-auto" />
          <p className="text-base text-gray-500">Appointment Time</p>
          <p className="text-lg font-semibold">
            {appt.time}
          </p>
        </div>
      </div>

      {/* About Patient */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-3 text-[#0A4D68]">
          About Patient
        </h2>
        <p className="text-base leading-relaxed text-gray-700 bg-white p-6 rounded-xl shadow">
          {patient.name} is a {patient.age}-year-old {patient.gender} currently
          seeking medical consultation. Additional notes can be added here by
          the doctor. This section may later include medical history,
          allergies, or remarks.
        </p>
      </section>

      {/* Patient Files */}
      <section>
        <h2 className="text-2xl font-semibold mb-5 text-[#0A4D68]">
          Patient Files
        </h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex justify-between items-center bg-white px-5 py-4 rounded-xl shadow-sm"
            >
              <div className="flex items-center gap-4">
                <FaFileAlt className="text-[#0A4D68] text-xl" />
                <div>
                  <p className="font-semibold text-base">Document {i}</p>
                  <p className="text-sm text-gray-500">PDF, 3.2 MB</p>
                </div>
              </div>
              <FaEllipsisV className="text-gray-400 text-lg" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DoctorPatientDetailsPage;
