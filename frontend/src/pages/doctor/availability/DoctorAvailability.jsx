import React, { useEffect, useState } from "react";
import { FaArrowLeft, FaCalendarAlt, FaClock, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import TopIcons from "../../../components/TopIcons";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const DoctorAvailability = () => {
  const navigate = useNavigate();
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);

  


  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("doctorToken");
        const user = JSON.parse(localStorage.getItem("doctorInfo") || "{}");
        const doctorId = user?.doctorId;
        if (!doctorId) {
          setAvailability([]);
          setLoading(false);
          return;
        }

        const base = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
        const res = await axios.get(
          `${base}/api/availability/${doctorId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // backend returns availability doc; we want days array
        setAvailability(res.data.days || []);
      } catch (err) {
        console.error("Fetch availability error:", err);
        console.error("Error details:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          url: err.config?.url
        });
        const status = err.response?.status;
        const message = err.response?.data?.message || "";
        const isNotFoundOrEmpty = status === 404 || /no\s+availability|not\s+found/i.test(message);
        if (!isNotFoundOrEmpty) {
          toast.error(err.response?.data?.message || err.message || "Failed to fetch availability");
        }
        setAvailability([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAvailability();
  }, []);

  // Sort by date ascending (works with YYYY-MM-DD) and guard against bad data
  const sortedAvailability = (Array.isArray(availability) ? availability : [])
    .filter((day) => day && typeof day.date === "string")
    .sort((a, b) => (a.date || "").localeCompare(b.date || ""));

  // Delete all slots for a given date (with confirm)
  const handleDeleteDate = async (date) => {
    if (!window.confirm(`Delete all slots for ${new Date(date).toLocaleDateString()}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("doctorToken");
      // encode date in case of special chars
      const encodedDate = encodeURIComponent(date);

      await toast.promise(
        axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/availability/${encodedDate}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        {
          loading: "Deleting...",
          success: "Availability deleted successfully",
          error: "Failed to delete availability",
        }
      );

      // remove from UI
      setAvailability((prev) => prev.filter((d) => d.date !== date));
    } catch (err) {
      console.error("Delete availability error:", err);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="relative bg-[#F8FAFC] min-h-screen font-[Poppins] px-4 py-6 md:px-10 md:py-10 overflow-hidden">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Background Gradient Accent */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-[#F0F9FF] to-[#DFF4F3] rounded-b-full blur-xl opacity-50 -z-10" />

      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/doctor-dashboard")}
            className="text-[#0A4D68] text-xl"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-3xl font-bold text-[#0A4D68] tracking-tight">
            Availability
          </h1>
        </div>
        <TopIcons />
      </div>

      {/* All Availability Cards */}
      <div className="space-y-8 max-w-3xl mx-auto">
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : sortedAvailability.length === 0 ? (
          <div className="text-center text-gray-400">No data is available</div>
        ) : (
          sortedAvailability.map((day) => (
            <AvailabilityCard
              key={day.date}
              dayLabel={new Date(day.date).toLocaleDateString(undefined, {
                weekday: "long",
              })}
              date={new Date(day.date).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              slots={Array.isArray(day.slots) ? day.slots : []}
              onChange={() => navigate(`/doctor/availability/change/${day.date}`)}
              onDelete={() => handleDeleteDate(day.date)}
            />
          ))
        )}
      </div>

      {/* Floating Add Button */}
      <div className="fixed bottom-16 right-6 md:right-10">
        <button
          onClick={() => navigate("/doctor/availability/add")}
          className="bg-[#0A4D68] hover:bg-[#08374f] text-white px-6 py-3 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg"
        >
          <FaPlus /> Add Availability
        </button>
      </div>

    </div>
  );
};

const AvailabilityCard = ({ dayLabel, date, slots, onChange, onDelete }) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all hover:-translate-y-1 duration-300">
    <h2 className="text-lg font-bold text-[#1F2A37] mb-2">{dayLabel}</h2>
    <hr className="mb-4" />
    <div className="flex items-center gap-2 text-[#0A4D68] font-semibold text-base mb-4">
      <FaCalendarAlt className="text-md" />
      <span>{date}</span>
    </div>

    {/* Slot Chips */}
    <div className="flex flex-wrap gap-3 text-sm mb-6">
      {!slots || slots.length === 0 ? (
        <span className="text-gray-400">No slots set</span>
      ) : (
        slots.map((slot, idx) => (
          <div
            key={idx}
            className="flex items-center gap-1 bg-[#E0F2F1] text-[#0A4D68] px-4 py-2 rounded-full text-sm font-medium shadow-sm transition-transform duration-200 hover:scale-105"
          >
            <FaClock className="text-sm" />
            {slot}
          </div>
        ))
      )}
    </div>

    {/* Action Buttons */}
    <div className="flex gap-4">
      <button
        onClick={onDelete}
        className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-full font-semibold hover:bg-gray-200 transition"
      >
        Delete
      </button>
      <button
        onClick={onChange}
        className="flex-1 bg-[#0A4D68] text-white py-2 rounded-full font-semibold hover:bg-[#08374f] transition"
      >
        Change
      </button>
    </div>
  </div>
);

export default DoctorAvailability;
