import React, { useEffect, useState } from "react";
import { Calendar, Clock, CheckCircle, ArrowLeft, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import PatientTopIcons from "../../components/PatientTopIcons";

export default function PatientAppointView() {
  const [appointment, setAppointment] = useState({ date: null, time: null });
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const [bookings, setBookings] = useState([]);
  const [bookingsByDate, setBookingsByDate] = useState({});
  const [nextAppointment, setNextAppointment] = useState(null);
  const [todaysBookings, setTodaysBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [bookingsError, setBookingsError] = useState(null);
  const check=true;
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
console.log(nextAppointment);
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  useEffect(() => {
    const date = localStorage.getItem("appointmentDate");
    const time = localStorage.getItem("appointmentTime");
    setAppointment({ date, time });
  }, []);

  const parseTime = (timeStr) => {
    if (!timeStr) return { hours: 0, minutes: 0 };
    const parts = timeStr.trim().split(" ");
    const hm = parts[0].split(":").map(Number);
    let hours = hm[0];
    const minutes = hm[1] || 0;
    const period = parts[1]?.toUpperCase();
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return { hours, minutes };
  };

  // helper: normalize appointment objects from backend (support different field names)
  const normalizeAppointment = (a) => {
    return {
      _id: a._id,
      appointment_date: a.appointment_date || a.date || a.day || null,
      appointment_time: a.appointment_time || a.time || a.slot || null,
      status: a.status,
      doctor: a.doctorName,
      patientInfo: a.patientInfo || a.patient || {},
      reason: a.reason || "",
      // keep other fields but frontend will not display them
    };
  };

  useEffect(() => {
    const fetchBookings = async () => {
      setLoadingBookings(true);
      setBookingsError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setBookingsError("Not authenticated");
          setBookings([]);
          setBookingsByDate({});
          setTodaysBookings([]);
          setNextAppointment(null);
          setLoadingBookings(false);
          return;
        }
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/appointments/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || `HTTP ${res.status}`);
        }
        const data = await res.json();
        console.log("Fetched appointments:", data);
        const itemsRaw = Array.isArray(data.appointments) ? data.appointments : [];
        const items = itemsRaw.map(normalizeAppointment);

        // Build bookingsByDate keyed by date.toDateString()
        const byDate = {};
        items.forEach((b) => {
          const d = b.appointment_date ? new Date(b.appointment_date) : null;
          const key = d ? d.toDateString() : "Unknown";
          if (!byDate[key]) byDate[key] = [];
          byDate[key].push(b);
        });

        // Sort each day's bookings by time
        Object.keys(byDate).forEach((k) => {
          byDate[k].sort((a, b) => {
            const ta = parseTime(a.appointment_time);
            const tb = parseTime(b.appointment_time);
            return ta.hours * 60 + ta.minutes - (tb.hours * 60 + tb.minutes);
          });
        });

        // Find next upcoming appointment (status not cancelled/completed)
        const now = new Date();
        let next = null;
        let nextDt = null;
        items.forEach((b) => {
          if (["cancelled"].includes((b.status || "").toLowerCase())) return;
          if (!b.appointment_date) return;
          const d = new Date(b.appointment_date);
          const { hours, minutes } = parseTime(b.appointment_time || "");
          d.setHours(hours, minutes, 0, 0);
          if (d >= now) {
            if (!nextDt || d < nextDt) {
              nextDt = d;
              next = b;
            }
          }
        });

        const todayKey = new Date().toDateString();
        const todays = byDate[todayKey] || [];

        setBookings(items);
        setBookingsByDate(byDate);
        setNextAppointment(next || null);
        setTodaysBookings(todays);
        if (next) {
          setAppointment({ date: next.appointment_date, time: next.appointment_time });
        } else if (items.length > 0) {
          setAppointment({ date: items[0].appointment_date, time: items[0].appointment_time });
        } else {
          setAppointment({ date: null, time: null });
        }
      } catch (err) {
        console.error("Failed to load bookings:", err);
        setBookingsError(err.message || "Failed to load bookings");
        setBookings([]);
        setBookingsByDate({});
        setTodaysBookings([]);
        setNextAppointment(null);
      } finally {
        setLoadingBookings(false);
      }
    };

    fetchBookings();
  }, []);

  const appointmentDateObj = appointment.date ? new Date(appointment.date) : null;
  const today = new Date();

  const isAppointmentPast = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return false;
    const d = new Date(dateStr);
    const { hours, minutes } = parseTime(timeStr);
    d.setHours(hours, minutes, 0, 0);
    return d < new Date();
  };

  const appointmentPassed = isAppointmentPast(appointment.date, appointment.time);

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

  const formatTime = (t) => t || "—";
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link to={"/patient-dashboard"} className="flex items-center gap-2 text-[#0A4D68] hover:text-[#083952] transition-colors group w-fit">
                <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
              </Link>
              <div className="flex items-center gap-3 justify-center">
                <h1 className="text-2xl font-bold text-[#0A4D68]">Your Appointments</h1>
              </div>
            </div>
            <PatientTopIcons />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="bg-white rounded-3xl shadow-xl p-4 sm:p-8 border border-gray-100">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
                <h2 className="text-2xl font-bold text-[#0A4D68] flex items-center gap-3">
                  <Calendar className="w-6 h-6" />
                  Calendar View
                </h2>

                <div className="flex items-center gap-2 sm:gap-4 bg-gray-50 rounded-full px-2 sm:px-4 py-2">
                  <button onClick={() => handleMonthChange("prev")} className="p-2 hover:bg-white rounded-full transition-all duration-200 hover:shadow-md">
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>

                  <span className="text-lg font-semibold text-[#0A4D68] min-w-[100px] sm:min-w-[140px] text-center">
                    {monthNames[currentMonth]} {currentYear}
                  </span>

                  <button onClick={() => handleMonthChange("next")} className="p-2 hover:bg-white rounded-full transition-all duration-200 hover:shadow-md">
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-3 sm:p-6">
                <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-4">
                  {dayNames.map((day) => (
                    <div key={day} className="text-center font-semibold text-gray-500 text-xs sm:text-sm py-1 sm:py-2">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {generateCalendar().map((date, idx) => {
                    const isAppointmentDate =
                      date && appointmentDateObj && date.toDateString() === appointmentDateObj.toDateString();
                    const isToday = date && date.toDateString() === today.toDateString();
                    const isPastDate = date && date < today && !isToday;

                    const dayKey = date ? date.toDateString() : null;
                    const dayBookings = dayKey ? bookingsByDate[dayKey] : undefined;
                    const firstTime = dayBookings && dayBookings.length ? dayBookings[0].appointment_time : null;

                    return (
                      <div key={idx} className="relative">
                        {date ? (
                          <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer
                              ${isAppointmentDate ? "bg-gradient-to-r from-[#0A4D68] to-[#083952] text-white shadow-lg transform scale-105"
                                : isToday ? "bg-gray-200 text-[#0A4D68] border-2 border-[#0A4D68]"
                                : isPastDate ? "text-gray-400 bg-gray-100 cursor-not-allowed opacity-60"
                                : "hover:bg-gray-200 text-gray-700 hover:text-[#0A4D68]"}`}>
                              {date.getDate()}
                            </div>

                            {firstTime && (
                              <div className="mt-1 sm:mt-2 text-white text-[10px] sm:text-xs px-2 py-1 rounded-full shadow-sm bg-[#0A4D68]">
                                {firstTime}
                              </div>
                            )}
                            {isAppointmentDate && !firstTime && (
                              <div className={`mt-1 sm:mt-2 text-white text-[10px] sm:text-xs px-2 py-1 rounded-full shadow-sm ${appointmentPassed ? "bg-gray-500" : "bg-[#0A4D68]"}`}>
                                {appointment.time}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-8 h-8 sm:w-12 sm:h-12" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 order-1 lg:order-2">
            {loadingBookings ? (
              <div className="bg-white rounded-3xl shadow-xl p-4 sm:p-8 border border-gray-100 text-center">
                <p className="text-sm text-gray-500">Loading appointments...</p>
              </div>
            ) : todaysBookings.length > 0 ? (
              <div className="bg-white rounded-3xl shadow-xl p-4 sm:p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#0A4D68] flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#0A4D68]">Today's Appointments</h3>
                    <p className="text-sm text-gray-500">{new Date().toDateString()}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {todaysBookings.map((b) => (
                    <div key={b._id} className="p-3 rounded-xl bg-gray-50 flex items-center justify-between">
                      <div>
                        {/* Only show date/day, time, doctor name and reason */}
                        <p className="text-sm font-semibold text-gray-800">{new Date(b.appointment_date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</p>
                        <p className="text-lg font-semibold text-gray-900">{formatTime(b.appointment_time)}</p>
                        <p className="text-sm text-gray-700">Dr. {b?.doctor || (b.patientInfo?.doctorName) || "—"}</p>
                        {b.reason && <p className="text-xs text-gray-500 mt-1">{b.reason}</p>}
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          (b.status || "").toLowerCase() === "confirmed" ? "bg-green-100 text-green-700" :
                          (b.status || "").toLowerCase() === "completed" ? "bg-gray-100 text-gray-700" :
                          (b.status || "").toLowerCase() === "cancelled" ? "bg-red-100 text-red-700" :
                          "bg-yellow-100 text-yellow-800"
                        }`}>
                          {b.status || "pending"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : nextAppointment && nextAppointment.appointment_date && nextAppointment.appointment_time ? (
              <div className="bg-white rounded-3xl shadow-xl p-4 sm:p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${appointmentPassed ? "bg-gray-100" : "bg-green-100"}`}>
                    <CheckCircle className={`w-5 h-5 sm:w-6 sm:h-6 ${appointmentPassed ? "text-gray-500" : "text-green-600"}`} />
                  </div>
                  <div>
                    <h3 className={`text-lg sm:text-xl font-bold ${check ? "text-gray-600" : "text-[#0A4D68]"}`}>
                      {appointmentPassed ? "Completed Appointment" :"Active Appointment"}
                    </h3>
                    <p className="text-gray-500 text-xs sm:text-sm">
                      {appointmentPassed ? "This appointment has ended" : "Your next scheduled visit"}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                  <div className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl ${appointmentPassed ? "bg-gray-100" : "bg-gray-50"}`}>
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#0A4D68]" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500 font-medium">Date</p>
                      <p className={`text-base sm:text-lg font-semibold ${appointmentPassed ? "text-gray-600" : "text-gray-800"}`}>{new Date(nextAppointment.appointment_date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</p>
                    </div>
                  </div>

                  <div className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl ${appointmentPassed ? "bg-gray-100" : "bg-gray-50"}`}>
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[#0A4D68]" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500 font-medium">Time</p>
                      <p className={`text-base sm:text-lg font-semibold ${appointmentPassed ? "text-gray-600" : "text-gray-800"}`}>{formatTime(nextAppointment.appointment_time)}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3">
                  {/* Only show doctor name, status and reason */}
                  <div>
                    <p className="text-xs text-gray-500">Doctor</p>
                    <p className="font-semibold text-gray-800">Dr. {nextAppointment.doctor || nextAppointment.patientInfo?.doctorName || "—"}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Reason</p>
                    <p className="text-sm text-gray-800">{nextAppointment.reason || "—"}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                      (nextAppointment.status || "").toLowerCase() === "confirmed" ? "bg-green-100 text-green-700" :
                      (nextAppointment.status || "").toLowerCase() === "completed" ? "bg-gray-100 text-gray-700" :
                      (nextAppointment.status || "").toLowerCase() === "cancelled" ? "bg-red-100 text-red-700" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {nextAppointment.status || "pending"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-xl p-4 sm:p-8 border border-gray-100 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#0A4D68] mb-2 sm:mb-4">No Appointments</h3>
                <p className="text-gray-500 mb-4 sm:mb-8 text-sm sm:text-base">You don't have any upcoming appointments scheduled.</p>

                <button className="w-full bg-gradient-to-r from-[#0A4D68] to-[#083952] text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 font-medium text-sm sm:text-base">
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  Schedule Appointment
                </button>
              </div>
            )}

            <div className="bg-white rounded-3xl shadow-xl p-4 sm:p-8 border border-gray-100">
              <h3 className="text-base sm:text-lg font-bold text-[#0A4D68] mb-4 sm:mb-6">Your Bookings</h3>

              {loadingBookings ? (
                <p className="text-sm text-gray-500">Loading bookings...</p>
              ) : bookingsError ? (
                <p className="text-sm text-red-500">{bookingsError}</p>
              ) : bookings.length === 0 ? (
                <p className="text-sm text-gray-500">No bookings found.</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-auto">
                  {bookings.map((b) => (
                    <div key={b._id} className="p-3 rounded-lg bg-gray-50 flex items-start justify-between">
                      <div>
                        {/* Only show date/day, time, doctor name and reason */}
                        <p className="text-sm font-medium text-gray-800">{new Date(b.appointment_date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} • {formatTime(b.appointment_time)}</p>
                        <p className="text-xs text-gray-500">Dr. {b?.doctor || b.patientInfo?.name || "—"}</p>
                        {b.reason && <p className="text-xs text-gray-500 mt-1">{b.reason}</p>}
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          (b.status || "").toLowerCase() === "confirmed" ? "bg-green-100 text-green-700" :
                          (b.status || "").toLowerCase() === "completed" ? "bg-gray-100 text-gray-700" :
                          (b.status || "").toLowerCase() === "cancelled" ? "bg-red-100 text-red-700" :
                          "bg-yellow-100 text-yellow-800"
                        }`}>
                          {b.status || "pending"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
