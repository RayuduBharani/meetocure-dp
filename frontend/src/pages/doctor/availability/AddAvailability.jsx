import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import TopIcons from "../../../components/TopIcons";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const AddAvailability = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState("YYYY-MM-DD");
  const [selectedSlots, setSelectedSlots] = useState([]);

  const allSlots = [
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "12:00 AM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
    "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM"
  ];

 
  const toggleSlot = (slot) => {
    setSelectedSlots(prev =>
      prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]
    );
  };

  const handleConfirm = async () => {
    if (!selectedDate || selectedSlots.length === 0) {
      toast.error("Please select a date and at least one slot.", {
        position: "top-right",
        duration: 3000,
      });
      return;
    }

    const loadingToast = toast.loading("Adding availability...", {
      position: "top-right",
    });
    
    try {
      const token = localStorage.getItem("doctorToken");
      const base = import.meta.env.VITE_BACKEND_URL || "http://65.2.176.202:5000";
      await axios.post(
        `${base}/api/availability`,
        {
          days: [
            {
              date: selectedDate,
              slots: selectedSlots,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Availability updated successfully!", {
        id: loadingToast,
        position: "top-right",
        duration: 3000,
      });
      navigate("/doctor/availability");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add availability", {
        id: loadingToast,
        position: "top-right",
        duration: 3000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-[Poppins] px-6 py-8">
      <Toaster />
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/doctor/availability")} className="text-[#0A4D68] text-xl">
            <FaArrowLeft />
          </button>
          <h1 className="text-2xl font-bold text-[#0A4D68]">Availability</h1>
        </div>
        <TopIcons />
      </div>

      {/* Date Picker */}
      <h2 className="text-lg font-semibold mb-2">Select Date</h2>
      <input
        type="date"
        value={selectedDate}
        min={new Date().toISOString().slice(0, 10)}
        onChange={(e) => setSelectedDate(e.target.value)}
        className="mb-6 w-full max-w-xs p-2 border border-gray-300 rounded-md shadow-sm focus:outline-[#0A4D68]"
      />

      {/* Time Slots */}
      <h2 className="text-lg font-semibold mb-3">Select Hour</h2>
      <div className="grid grid-cols-3 gap-4">
        {allSlots.map((slot) => (
          <button
            key={slot}
            onClick={() => toggleSlot(slot)}
            className={`py-2 border rounded-md text-sm font-semibold ${selectedSlots.includes(slot)
              ? "bg-[#0A4D68] text-white"
              : "bg-white text-[#0A4D68] border-[#0A4D68]"
              }`}
          >
            {slot}
          </button>
        ))}
      </div>

      {/* Confirm Button */}
      <div className="mt-10">
        <button
          onClick={handleConfirm}
          className="w-full bg-[#0A4D68] text-white py-3 rounded-full font-semibold hover:bg-[#08374f]"
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

export default AddAvailability;