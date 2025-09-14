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
        const token =
          localStorage.getItem("doctorToken") || localStorage.getItem("token");

        if (!token) {
          setError("No authentication token found");
          setLoading(false);
          return;
        }

        const url = `${API_BASE_URL}/api/appointments/doctor`;

        const response = await 
        fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          if (response.status === 404) {
            setAppointments([]);
          } else if (response.status === 401) {
            setError("Authentication failed. Please log in again.");
          } else if (response.status === 403) {
            setError("Access denied. You may not have permission to view appointments.");
          } else {
            setError(`Server error: ${response.status} - ${errorText}`);
          }
        } else {
          const data = await response.json();

          // ✅ Handle both {appointments: [...]} and plain array
          if (data.appointments && Array.isArray(data.appointments)) {
            setAppointments(data.appointments);
          } else if (Array.isArray(data)) {
            setAppointments(data);
          } else {
            setAppointments([]);
          }
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load appointments");
        setAppointments([]);
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
      const token =
        localStorage.getItem("doctorToken") || localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found");
        return;
      }

      const confirmed = window.confirm(
        `Are you sure you want to cancel the appointment with ${
          appt.patientInfo?.name || appt.name
        } on ${appt.date} at ${appt.time}?`
      );

      if (!confirmed) return;
      const response = await fetch(
        `${API_BASE_URL}/api/appointments/${appt._id}/cancel`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      console.log("Cancel response:", { status: response.status, data });

      if (response.ok && data.success) {
        setAppointments((prevAppointments) =>
          prevAppointments.map((apt) =>
            apt._id === appt._id ? { ...apt, status: "cancelled" } : apt
          )
        );
        alert("Appointment cancelled successfully!");
      } else {
        throw new Error(data.message || "Failed to cancel appointment");
      }
    } catch (err) {
      console.error("Error cancelling appointment:", err);
      alert(`Error cancelling appointment: ${err.message}`);
    }
  };

  const handleAccept = async (appt) => {
    try {
      const token =
        localStorage.getItem("doctorToken") || localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found");
        return;
      }

      const confirmed = window.confirm(
        `Are you sure you want to accept the appointment with ${
          appt.patientInfo?.name || appt.name
        } on ${appt.date} at ${appt.time}?`
      );

      if (!confirmed) return;
      const response = await fetch(
        `${API_BASE_URL}/api/appointments/${appt._id}/accept`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
    

      if (response.ok && data.success) {
        setAppointments((prevAppointments) =>
          prevAppointments.map((apt) =>
            apt._id === appt._id ? { ...apt, status: "accepted" } : apt
          )
        );
        alert("Appointment accepted successfully!");
      } else {
        throw new Error(data.message || "Failed to accept appointment");
      }
    } catch (err) {
      console.error("Error accepting appointment:", err);
      alert(`Error accepting appointment: ${err.message}`);
    }
  };

  const handleComplete = async (appt) => {
    try {
      const token =
        localStorage.getItem("doctorToken") || localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found");
        return;
      }

      const confirmed = window.confirm(
        `Are you sure you want to mark the appointment with ${
          appt.patientInfo?.name || appt.name
        } on ${appt.date} at ${appt.time} as completed?`
      );

      if (!confirmed) return;
      const response = await fetch(
        `${API_BASE_URL}/api/appointments/${appt._id}/complete`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      console.log("Complete response:", { status: response.status, data });

      if (response.ok && data.success) {
        setAppointments((prevAppointments) =>
          prevAppointments.map((apt) =>
            apt._id === appt._id ? { ...apt, status: "completed" } : apt
          )
        );
        alert("Appointment completed successfully!");
      } else {
        throw new Error(data.message || "Failed to complete appointment");
      }
    } catch (err) {
      console.error("Error completing appointment:", err);
      alert(`Error completing appointment: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-[#0A4D68]/10 rounded-full flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[#0A4D68] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-500 text-sm">Loading appointments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <div className="w-8 h-8 bg-red-500 rounded-full"></div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Appointments</h3>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <FaCalendarAlt className="text-2xl text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Upcoming Appointments
        </h3>
        <p className="text-gray-500 text-sm">
          You don't have any upcoming appointments scheduled. Check back later
          or set your availability.
        </p>
      </div>
    );
  }

  const isToday = (date) => {
    const today = new Date().toISOString().split("T")[0];
    return date.startsWith(today);
  };

  const isTomorrow = (date) => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    return date.startsWith(tomorrow);
  };

  const isUpcoming = (date) => {
    const today = new Date().toISOString().split("T")[0];
    return date > today;
  };

  const formatDate = (date) => {
    const appointmentDate = new Date(date);
    const today = new Date();
    const diffTime = appointmentDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays > 1) return `In ${diffDays} days`;
    return appointmentDate.toLocaleDateString();
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {appointments.map((appt) => (
        <div
          key={appt._id}
          className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group"
        >
          {/* Date & Time Header */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2 text-[#0A4D68]">
              <div className="w-8 h-8 bg-gradient-to-r from-[#0A4D68]/10 to-blue-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FaCalendarAlt className="text-xs" />
              </div>
              <span className="font-semibold text-sm">{new Date(appt.date).toLocaleDateString()}</span>
              {isToday(appt.date) && (
                <span className="text-xs bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-3 py-1 rounded-full font-semibold border border-green-200">
                  Today
                </span>
              )}
              {isTomorrow(appt.date) && (
                <span className="text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-3 py-1 rounded-full font-semibold border border-blue-200">
                  Tomorrow
                </span>
              )}
              {isUpcoming(appt.date) && (
                <span className="text-xs bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 px-3 py-1 rounded-full font-semibold border border-purple-200">
                  {formatDate(appt.date)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-emerald-600">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-100 to-green-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FaClock className="text-xs" />
              </div>
              <span className="font-semibold text-sm">{appt.time}</span>
            </div>
          </div>

          {/* Patient Info */}
          <div className="mb-4">
            <h3 className="font-bold text-base bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
              {appt.patientInfo?.name || appt.name}
            </h3>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-gradient-to-r from-[#0A4D68]/10 to-[#0A4D68]/20 rounded-md flex items-center justify-center">
                  <FaUser className="text-[#0A4D68] text-xs" />
                </div>
                <span className="font-medium">Age: {appt.patientInfo?.age || "N/A"}</span>
                <div className="w-5 h-5 bg-gradient-to-r from-pink-100 to-rose-200 rounded-md flex items-center justify-center ml-2">
                  <FaVenusMars className="text-pink-600 text-xs" />
                </div>
                <span className="font-medium">Gender: {appt.patientInfo?.gender || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 font-medium">Phone: {appt.patientInfo?.phone || "N/A"}</span>
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

          {/* Action Buttons */}
          <div className="space-y-2">
            {/* Primary Action Buttons Row */}
            <div className="flex gap-2">
              {appt.status === "pending" && (
                <button
                  onClick={() => handleAccept(appt)}
                  className="flex-1 bg-gradient-to-r from-green-100 to-emerald-100 hover:from-green-200 hover:to-emerald-200 text-green-700 text-xs py-2 rounded-lg font-semibold transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  Accept
                </button>
              )}
              {appt.status === "accepted" && (
                <button
                  onClick={() => handleComplete(appt)}
                  className="flex-1 bg-gradient-to-r from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 text-blue-700 text-xs py-2 rounded-lg font-semibold transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  Complete
                </button>
              )}
              <button
                onClick={() => handleView(appt)}
                className="flex-1 bg-gradient-to-r from-[#0A4D68] to-[#1e6b8a] hover:from-[#083e54] hover:to-[#0A4D68] text-white text-xs py-2 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                View Details
              </button>
            </div>
            
            {/* Cancel Button Row */}
            <div className="flex gap-2">
              <button
                onClick={() => handleCancel(appt)}
                className={`flex-1 text-xs py-2 rounded-lg font-semibold transition-all duration-300 shadow-sm ${
                  appt.status === "completed" || appt.status === "cancelled"
                    ? "bg-gradient-to-r from-gray-100 to-gray-200 cursor-not-allowed text-gray-400"
                    : "bg-gradient-to-r from-red-100 to-rose-100 hover:from-red-200 hover:to-rose-200 text-red-700 hover:shadow-md"
                }`}
                disabled={appt.status === "completed" || appt.status === "cancelled"}
              >
                {appt.status === "cancelled" ? "Cancelled" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UpcomingAppointments;
