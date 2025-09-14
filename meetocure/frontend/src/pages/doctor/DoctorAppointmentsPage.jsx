import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCalendarAlt } from "react-icons/fa";
import AppointmentTabs from "../../components/AppointmentTabs";
import AppointmentCard from "../../components/AppointmentCard";
import TopIcons from "../../components/TopIcons";
import axios from "axios";
import { API_BASE_URL } from "../../lib/config";

const DoctorAppointmentsPage = () => {
  const [selectedTab, setSelectedTab] = useState("Upcoming");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem("doctorToken");
        
        if (!token) {
          console.error("No doctor token found");
          setAppointments([]);
          setLoading(false);
          return;
        }

        const res = await axios.get(
          `${API_BASE_URL}/api/appointments/doctor`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        
        const enrichedAppointments = (res.data.appointments || []).map((appt) => ({
          ...appt,
          age: appt.patientInfo?.age || "-",
          name: appt.patientInfo?.name || appt.name || "N/A",
          gender: appt.patientInfo?.gender || "N/A",
          phone: appt.patientInfo?.phone || appt.patient?.phone || "N/A",
          note: appt.patientInfo?.note || "",
          reason: appt.reason || "Not specified"
        }));


        setAppointments(enrichedAppointments);
      } catch (err) {
        console.error("Failed to fetch appointments:", err);
        console.error("Error details:", {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data
        });
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const filteredAppointments = appointments.filter((appt) => {
    const today = new Date().toISOString().split('T')[0];
    const appointmentDate = new Date(appt.date).toISOString().split('T')[0];
    
    switch (selectedTab) {
      case "Upcoming":
        return (appt.status === "pending" || appt.status === "accepted") && appointmentDate >= today;
      case "Completed":
        return appt.status === "completed";
      case "Cancelled":
        return appt.status === "cancelled";
      default:
        return true;
    }
  });

  const handleStatusUpdate = (appointmentId, newStatus) => {
    setAppointments(prevAppointments =>
      prevAppointments.map(appt =>
        appt._id === appointmentId ? { ...appt, status: newStatus } : appt
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 font-poppins">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate("/doctor-dashboard")}
                className="p-3 rounded-2xl bg-gradient-to-r from-[#0A4D68]/10 to-[#0A4D68]/20 hover:from-[#0A4D68]/20 hover:to-[#0A4D68]/30 transition-all duration-300 group shadow-sm"
              >
                <FaArrowLeft className="text-xl text-[#0A4D68] group-hover:scale-110 transition-transform duration-200" />
              </button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0A4D68] to-[#1e6b8a] bg-clip-text text-transparent">
                  Appointments
                </h1>
                <p className="text-gray-600 mt-1 font-medium">Manage your patient appointments</p>
              </div>
            </div>
            <TopIcons />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <AppointmentTabs active={selectedTab} onChange={setSelectedTab} />
        </div>

        {/* Appointment Cards */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-16">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-[#0A4D68]/10 to-blue-500/20 rounded-2xl flex items-center justify-center">
                  <div className="w-8 h-8 border-3 border-[#0A4D68] border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-gray-600 text-sm font-medium">Loading appointments...</p>
              </div>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="col-span-full">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-16 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                  <FaCalendarAlt className="text-3xl text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  No {selectedTab.toLowerCase()} appointments
                </h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto">
                  {selectedTab === "Upcoming" 
                    ? "You don't have any upcoming appointments scheduled. Check back later or set your availability."
                    : `You don't have any ${selectedTab.toLowerCase()} appointments at the moment.`
                  }
                </p>
              </div>
            </div>
          ) : (
            filteredAppointments.map((appt) => (
              <AppointmentCard key={appt._id} appt={appt} onStatusUpdate={handleStatusUpdate} />
            ))
          )}
        </section>
      </div>
    </div>
  );
};

export default DoctorAppointmentsPage;
