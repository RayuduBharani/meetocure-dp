import React from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaClock, FaUser, FaVenusMars } from "react-icons/fa";

const appointments = [
  {
    id: 1,
    name: "Nithin Sai",
    age: 22,
    gender: "Male",
    date: "June 13, 2025",
    time: "11.00 AM",
    concern: "Fever and Cough",
    photo: "/assets/patient/nithin.png", 
  },
  {
    id: 2,
    name: "Manideep",
    age: 30,
    gender: "Male",
    date: "June 13, 2025",
    time: "11.30 AM",
    concern: "Headache",
    photo: "/assets/patient/manideep.png",
  },
];

const TodayAppointments = () => {
  const navigate = useNavigate();

  const handleView = (appt) => {
    navigate(`/doctor/patient/${appt.id}`, { state: { patient: appt } });
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {appointments.map((appt) => (
        <div
          key={appt.id}
          className="bg-white rounded-xl shadow-md p-5 flex flex-col justify-between"
        >
          <div className="flex justify-between text-[#0A4D68] font-medium mb-2">
            <span className="flex items-center gap-2">
              <FaCalendarAlt /> {appt.date}
            </span>
            <span className="flex items-center gap-2">
              <FaClock /> {appt.time}
            </span>
          </div>
          <div className="mb-3">
            <p className="font-semibold text-lg">Patient Name : {appt.name}</p>
            <p className="text-sm flex items-center gap-2 mt-1">
              <FaUser /> Age : {appt.age}
              <FaVenusMars /> Gender : {appt.gender}
            </p>
          </div>
          <div className="flex justify-between mt-2">
            <button className="bg-gray-200 text-sm py-2 px-6 rounded-full">
              Cancel
            </button>
            <button
              onClick={() => handleView(appt)}
              className="bg-[#0A4D68] text-white text-sm py-2 px-6 rounded-full hover:bg-[#08374f]"
            >
              View
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TodayAppointments;
