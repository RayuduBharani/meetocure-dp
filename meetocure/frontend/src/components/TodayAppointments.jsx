import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaClock, FaUser, FaVenusMars } from "react-icons/fa";
import { API_BASE_URL } from "../lib/config";



const TodayAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  console.log(appointments)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('doctorToken');
        const response = await fetch(`${API_BASE_URL}/api/appointments/doctor`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        setAppointments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const handleView = (appt) => {
    navigate(`/doctor/patient/${appt.patient}`, { state: { patient: appt } });
  };

  if (loading) return <div>Loading appointments...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {appointments.length === 0 ? (
        <div className="col-span-2 text-center text-gray-500">No appointments found.</div>
      ) : (
        appointments.map((appt , index) => (
          <div
            key={index}
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
              <p className="font-semibold text-lg">Patient Name : {appt.patientInfo?.name}</p>
              <p className="text-sm flex items-center gap-2 mt-1">
                <FaUser /> Age : {appt.patientInfo?.age}
                <FaVenusMars /> Gender : {appt.patientInfo?.gender}
              </p>
              <p className="text-sm mt-1">Phone : {appt.patientInfo?.phone}</p>
              <p className="text-sm mt-1">Reason : {appt.reason}</p>
              <p className="text-sm mt-1">Status : <span className={`${appt.status === "Completed" ? "text-green-500" : "text-yellow-500"}`}>{appt.status}</span></p>
            </div>
            <div className="flex justify-between mt-2">
              <button 
                className={`text-sm py-2 px-6 rounded-full ${
                  appt.status === "Completed" ? "bg-gray-300 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-300"
                }`}
                disabled={appt.status === "Completed"}
              >
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
        ))
      )}
    </div>
  );
};

export default TodayAppointments;
