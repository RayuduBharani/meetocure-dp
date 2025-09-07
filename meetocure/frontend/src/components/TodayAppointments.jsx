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
        console.log('Doctor token:', token ? 'Found' : 'Not found');
        
        if (!token) {
          setError('No authentication token found');
          setLoading(false);
          return;
        }

        const url = `${API_BASE_URL}/api/appointments/doctor`;
        console.log('Fetching appointments from:', url);

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        if (!response.ok) {
          if (response.status === 404) {
            // No appointments found - this is normal for new doctors
            console.log('No appointments found (404)');
            setAppointments([]);
          } else {
            const errorText = await response.text();
            console.error('API Error:', response.status, errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        } else {
          const data = await response.json();
          console.log('Appointments data:', data);
          console.log('First appointment structure:', data[0]);
          setAppointments(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('Failed to load appointments');
        setAppointments([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const handleView = (appt) => {
    console.log('Navigating to appointment:', appt._id);
    navigate(`/doctor/patient/${appt._id}`, { state: { appt: appt } });
  };

  const handleCancel = async (appt) => {
    try {
      const token = localStorage.getItem('doctorToken');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      // Confirm cancellation
      const confirmed = window.confirm(
        `Are you sure you want to cancel the appointment with ${appt.patientInfo?.name} on ${appt.date} at ${appt.time}?`
      );

      if (!confirmed) {
        return;
      }

      console.log('Cancelling appointment:', appt._id);

      const response = await fetch(`${API_BASE_URL}/api/appointments/${appt._id}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('Cancel response:', data);

      if (response.ok && data.success) {
        // Update the local state to reflect the cancellation
        setAppointments(prevAppointments => 
          prevAppointments.map(apt => 
            apt._id === appt._id 
              ? { ...apt, status: 'Cancelled' }
              : apt
          )
        );
        
        // Show success message
        alert('Appointment cancelled successfully!');
      } else {
        throw new Error(data.message || 'Failed to cancel appointment');
      }
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      alert(`Error cancelling appointment: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">Loading appointments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="text-yellow-800 text-sm">
          {error}
        </div>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <FaCalendarAlt className="text-4xl text-blue-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-blue-800 mb-2">No Appointments Today or Tomorrow</h3>
        <p className="text-blue-600 text-sm">
          You don't have any appointments scheduled for today or tomorrow. Check back later or set your availability.
        </p>
      </div>
    );
  }

  // Helper function to check if appointment is today or tomorrow
  const isToday = (date) => {
    const today = new Date().toISOString().split('T')[0];
    return date === today;
  };

  const isTomorrow = (date) => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return date === tomorrow;
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {appointments.map((appt, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-md p-5 flex flex-col justify-between"
          >
            <div className="flex justify-between text-[#0A4D68] font-medium mb-2">
              <span className="flex items-center gap-2">
                <FaCalendarAlt /> 
                {appt.date}
                {isToday(appt.date) && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full ml-2">Today</span>}
                {isTomorrow(appt.date) && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-2">Tomorrow</span>}
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
              <p className="text-sm mt-1">Status : <span className={`${
                appt.status === "Completed" ? "text-green-500" : 
                appt.status === "Cancelled" ? "text-red-500" : 
                "text-yellow-500"
              }`}>{appt.status}</span></p>
            </div>
            <div className="flex justify-between mt-2">
              <button 
                onClick={() => handleCancel(appt)}
                className={`text-sm py-2 px-6 rounded-full ${
                  appt.status === "Completed" || appt.status === "Cancelled" 
                    ? "bg-gray-300 cursor-not-allowed text-gray-500" 
                    : "bg-red-200 hover:bg-red-300 text-red-800"
                }`}
                disabled={appt.status === "Completed" || appt.status === "Cancelled"}
              >
                {appt.status === "Cancelled" ? "Cancelled" : "Cancel"}
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
