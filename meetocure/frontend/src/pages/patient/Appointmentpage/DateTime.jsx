// ⬅ UNCHANGED imports and setup
import React, { useEffect, useState } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import TopIcons from "../../../components/PatientTopIcons";
import toast from "react-hot-toast";
import axios from "axios";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const DateTime = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const doctorId = searchParams.get("doctorId");
  const today = new Date();

  useEffect(() => {
    if (!doctorId) {
      toast.error("Doctor not specified. Please select a doctor.");
      navigate("/patient-dashboard");
    }
  }, [doctorId, navigate]);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  // New: availability state from backend
  const [availabilityDays, setAvailabilityDays] = useState(null); // array of {date, slots}
  const [availableSlots, setAvailableSlots] = useState([]); // slots for selectedDate
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState("");

  const generateCalendar = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const calendar = [];

    for (let i = 0; i < startDay; i++) calendar.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      calendar.push(new Date(currentYear, currentMonth, d));
    }
    return calendar;
  };

  const handleMonthChange = (dir) => {
    if (dir === "prev") {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const handleDateSelect = (date) => {
    if (date < new Date().setHours(0, 0, 0, 0)) return;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formatted = `${year}-${month}-${day}`;

    setSelectedDate(formatted);
    setSelectedTime("");
    // clear previously loaded slots when selecting a new date
    setAvailableSlots([]);
    setSlotsError("");
  };

  // Fetch availability for doctor and pick slots for selected date
  const fetchAvailabilityForDate = async () => {
    if (!doctorId) {
      toast.error("Doctor ID missing");
      return;
    }
    if (!selectedDate) {
      toast.error("Please select a date first");
      return;
    }

    // if we already fetched availabilityDays once, reuse it
    if (availabilityDays) {
      const day = availabilityDays.find(d => d.date === selectedDate);
      setAvailableSlots(day ? day.slots || [] : []);
      if (!day) setSlotsError("No slots set for this date");
      return;
    }

    setLoadingSlots(true);
    setSlotsError("");
    try {
      const base = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      console.log("Fetching availability from:", `${base}/api/availability/${encodeURIComponent(doctorId)}`);
      const res = await axios.get(`${base}/api/availability/${encodeURIComponent(doctorId)}`);
      const data = res.data;
      const days = data?.days || [];
      setAvailabilityDays(days);

      const day = days.find(d => d.date === selectedDate);
      if (day && Array.isArray(day.slots) && day.slots.length > 0) {
        setAvailableSlots(day.slots);
      } else {
        setAvailableSlots([]);
        setSlotsError("No slots set for this date");
      }
    } catch (err) {
      console.error("Fetch availability error:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url
      });
      setSlotsError(err.response?.data?.message || err.message || "Failed to fetch availability");
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleContinue = () => {
    if (selectedDate && selectedTime) {
      navigate("/patient/appointments/patient-detail", {
        state: {
          date: selectedDate,
          time: selectedTime,
          doctorId
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-6 lg:px-32 lg:py-10">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-black">
            <FaArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">Appointment</h1>
        </div>
        <TopIcons />
      </div>

      {/* Step Indicators */}
      <div className="flex justify-center  mb-10">
        <div className="flex items-center  gap-6 text-center">
          <div className="flex flex-col items-center gap-y-0.5">
            <div className="w-10 h-10 rounded-full bg-[#0A4D68] text-white flex items-center justify-center font-semibold">1</div>
            <p className="text-sm text-[#0A4D68]">Date & Time</p>
          </div>
          <div className="w-14 h-px bg-gray-300 "></div>
          <div className="flex flex-col items-center gap-y-0.5">
            <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-semibold">2</div>
            <p className="text-sm text-gray-400 ">Patient Detail</p>
          </div>
          <div className="w-14 h-px bg-gray-300 "></div>
          <div className="flex flex-col items-center gap-y-0.5">
            <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-semibold">3</div>
            <p className="text-sm text-gray-400 ">Payment</p>
          </div>
        </div>
      </div>

      {/* Calendar Centered */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-center mb-4">Select Date</h2>
        <div className="bg-gray-100 rounded-xl p-6 shadow-md">
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => handleMonthChange("prev")}>
              <FaArrowLeft className="text-gray-600 hover:text-black" />
            </button>
            <p className="text-lg font-medium text-gray-800">
              {monthNames[currentMonth]} {currentYear}
            </p>
            <button onClick={() => handleMonthChange("next")}>
              <FaArrowRight className="text-gray-600 hover:text-black" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center font-medium text-sm text-gray-500 mb-3">
            {dayNames.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2 text-center">
            {generateCalendar().map((date, idx) => {
              if (!date) {
                return <div key={idx} className="w-10 h-10" />;
              }

              const isToday = date.toDateString() === today.toDateString();
              const currentDateFormatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
              const isSelected = currentDateFormatted === selectedDate;
              const isPast = date < new Date().setHours(0, 0, 0, 0);

              return (
                <div key={idx}>
                  <button
                    onClick={() => handleDateSelect(date)}
                    disabled={isPast}
                    className={`w-10 h-10 rounded-full text-sm transition-all ${
                      isPast
                        ? "text-gray-300 cursor-not-allowed"
                        : isSelected
                        ? "bg-[#0A4D68] text-white"
                        : isToday
                        ? "bg-gray-200 text-black font-semibold"
                        : "hover:bg-gray-200"
                    }`}
                  >
                    {date.getDate()}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Time Slots */}
      <div className="max-w-4xl mx-auto mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Select Hour</h2>
          {/* Load times button */}
          <div>
            {selectedDate ? (
              <button
                onClick={fetchAvailabilityForDate}
                disabled={loadingSlots}
                className="px-4 py-2 rounded-lg bg-[#0A4D68] text-white text-sm"
              >
                {loadingSlots ? "Loading..." : "Load Times"}
              </button>
            ) : (
              <span className="text-sm text-gray-400">Select a date to load available times</span>
            )}
          </div>
        </div>

        {/* Display available slots from backend */}
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 justify-center">
          {loadingSlots ? (
            <div className="col-span-full text-center text-gray-500">Loading slots...</div>
          ) : availableSlots && availableSlots.length > 0 ? (
            availableSlots.map((slot) => (
              <button
                key={slot}
                onClick={() => setSelectedTime(slot)}
                className={`py-2 px-4 rounded-xl text-sm font-medium border transition-all ${
                  selectedTime === slot
                    ? "bg-[#0A4D68] text-white border-[#0A4D68]"
                    : "bg-white border-gray-300 hover:border-[#0A4D68]"
                }`}
              >
                {slot}
              </button>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500">
              {slotsError || "No available slots. Click 'Load Times' to fetch availability."}
            </div>
          )}
        </div>

        <div className="mt-10 flex justify-center">
          <button
            disabled={!selectedDate || !selectedTime}
            onClick={handleContinue}
            className={`px-6 py-3 rounded-xl font-semibold text-lg transition-all ${
              selectedDate && selectedTime
                ? "bg-[#0A4D68] text-white hover:bg-[#083952]"
                : "bg-gray-300 text-white cursor-not-allowed"
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateTime;
