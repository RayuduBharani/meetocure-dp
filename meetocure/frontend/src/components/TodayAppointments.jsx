import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaClock, FaUser, FaVenusMars } from "react-icons/fa";
import { API_BASE_URL } from "../lib/config";



const UpcomingAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('doctorToken') || localStorage.getItem('token');
        
        if (!token) {
          setError('No authentication token found');
          setLoading(false);
          return;
        }

        const url = `${API_BASE_URL}/api/appointments/doctor`;

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          const errorText = await response.text();
          
          if (response.status === 404) {
            // No appointments found - this is normal for new doctors
            setAppointments([]);
          } else if (response.status === 401) {
            setError('Authentication failed. Please log in again.');
          } else if (response.status === 403) {
            setError('Access denied. You may not have permission to view appointments.');
          } else {
            setError(`Server error: ${response.status} - ${errorText}`);
          }
        } else {
          const data = await response.json();
          setAppointments(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        setError('Failed to load appointments');
        setAppointments([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const handleView = (appt) => {
    navigate(`/doctor/patient/${appt._id}`, { state: { appt: appt } });
  };

  const handleCancel = async (appt) => {
    try {
      const token = localStorage.getItem('doctorToken') || localStorage.getItem('token');
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


      const response = await fetch(`${API_BASE_URL}/api/appointments/${appt._id}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

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

  const createTestAppointment = async () => {
    try {
      const token = localStorage.getItem('doctorToken') || localStorage.getItem('token');
      if (!token) {
        alert('No authentication token found');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/appointments/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('Test appointment creation response:', data);

      if (response.ok && data.success) {
        alert('Test appointment created successfully! Refresh the page to see it.');
        // Refresh the appointments
        window.location.reload();
      } else {
        alert(`Failed to create test appointment: ${data.message}`);
      }
    } catch (err) {
      console.error('Error creating test appointment:', err);
      alert(`Error creating test appointment: ${err.message}`);
    }
  };

  if (appointments.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <FaCalendarAlt className="text-4xl text-blue-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-blue-800 mb-2">No Upcoming Appointments</h3>
        <p className="text-blue-600 text-sm mb-4">
          You don't have any upcoming appointments scheduled. Check back later or set your availability.
        </p>
        
        {/* Debug Information */}
        <div className="mt-4 p-3 bg-gray-100 rounded text-left text-xs">
          <p><strong>Debug Info:</strong></p>
          <p>• Token found: {localStorage.getItem('doctorToken') || localStorage.getItem('token') ? 'Yes' : 'No'}</p>
          <p>• API URL: {API_BASE_URL}/api/appointments/doctor</p>
          <p>• Check browser console for detailed logs</p>
        </div>
        
        {/* Test Appointment Button */}
        <button
          onClick={createTestAppointment}
          className="mt-3 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm"
        >
          Create Test Appointment
        </button>
      </div>
    );
  }

  // Helper function to check if appointment is today, tomorrow, or upcoming
  const isToday = (date) => {
    const today = new Date().toISOString().split('T')[0];
    return date === today;
  };

  const isTomorrow = (date) => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return date === tomorrow;
  };

  const isUpcoming = (date) => {
    const today = new Date().toISOString().split('T')[0];
    return date > today;
  };

  const formatDate = (date) => {
    const appointmentDate = new Date(date);
    const today = new Date();
    const diffTime = appointmentDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays > 1) return `In ${diffDays} days`;
    return appointmentDate.toLocaleDateString();
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
                {isUpcoming(appt.date) && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full ml-2">{formatDate(appt.date)}</span>}
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

export default UpcomingAppointments;
