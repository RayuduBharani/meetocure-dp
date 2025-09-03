import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../lib/config";
import { FaArrowLeft, FaUser, FaPhoneAlt, FaVenusMars } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import TopIcons from "../../../components/PatientTopIcons";
import toast from "react-hot-toast";

const PatientDetails = () => {
  const navigate = useNavigate();
   const location = useLocation();
  // Extract passed props
  const { date, time, doctorId } = location.state || {};
  console.log("Received props:", { date, time, doctorId });
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    age: "",
    gender: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if(!date || !time || !doctorId) {
      toast.error("Missing appointment details. Please select again.");
      navigate("/patient/appointments/datetime");
    }
  },[location.state, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "age" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const handleGenderSelect = (gender) => {
    setFormData((prev) => ({ ...prev, gender }));
  };

  const validatePhone = (phone) => /^\d{10}$/.test(phone);

const handleContinue = async () => {
  const { name, phone, age, gender } = formData;

  if (!name || !phone || !age || !gender) {
    toast.error("Please fill all required fields");
    return;
  }

  if (!validatePhone(phone)) {
    toast.error("Please enter a valid 10-digit mobile number.");
    return;
  }

  if (age <= 0 || age > 120) {
    toast.error("Please enter a valid age.");
    return;
  }

  if (!doctorId || !date || !time) {
    toast.error("Appointment details missing. Please try again.");
    navigate("/patient/appointments/datetime");
    return;
  }

  setLoading(true);
  const loadingToast = toast.loading("Booking appointment...");

  try {
    const token = localStorage.getItem("token");

    // ✅ Parse stored patient object
    const storedPatient = localStorage.getItem("user");
    const patientId = storedPatient ? JSON.parse(storedPatient)._id : null;

    if (!patientId) {
      toast.error("Patient not found. Please log in again.");
      setLoading(false);
      navigate("/dual-patient");
      return;
    }

    const payload = {
      patient: patientId,        // ✅ correct _id
      doctor: doctorId,
      patientInfo: { name, phone, age, gender: gender.toLowerCase() }, // 👈 lowercase to match schema
      date,
      time,
      reason: "Routine Checkup",
    };
    console.log("Booking payload:", payload);
    await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/api/appointments`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    toast.dismiss(loadingToast);
    toast.success("Appointment booked in progress!");
    window.location.href = "https://rzp.io/rzp/8l24wgPo";
    setLoading(false);
    // navigate("/patient/appointments/payment");
  } catch (error) {
    setLoading(false);
    toast.dismiss(loadingToast);
    console.error("Booking failed", error);
    toast.error(error.response?.data?.message || "Failed to book appointment");
  }
};




  return (
    <div className="min-h-screen bg-white px-6 py-6 lg:px-20 lg:py-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-black">
            <FaArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold">Appointment</h1>
        </div>
        <TopIcons />
      </div>

      {/* Step Progress */}
      <div className="flex justify-center mb-10">
        <div className="flex items-center gap-6 text-center">
          <div>
            <div className="w-10 h-10 rounded-full bg-[#0A4D68] text-white flex items-center justify-center font-semibold">✓</div>
            <p className="text-sm text-[#0A4D68] mt-2">Date & Time</p>
          </div>
          <div className="w-10 h-px bg-gray-300 mt-4"></div>
          <div>
            <div className="w-10 h-10 rounded-full bg-[#0A4D68] text-white flex items-center justify-center font-semibold">2</div>
            <p className="text-sm text-[#0A4D68] mt-2">Patient Detail</p>
          </div>
          <div className="w-10 h-px bg-gray-300 mt-4"></div>
          <div>
            <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-semibold">3</div>
            <p className="text-sm text-gray-400 mt-2">Payment</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto bg-gray-50 rounded-2xl p-8 shadow-md space-y-6">
        {/* Patient Name */}
        <div>
          <label className="block font-semibold mb-1">Patient Name</label>
          <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2 gap-2 bg-white">
            <FaUser className="text-gray-500" />
            <input
              type="text"
              name="name"
              placeholder="Enter Patient Name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full focus:outline-none"
            />
          </div>
        </div>

        {/* Mobile Number */}
        <div>
          <label className="block font-semibold mb-1">Mobile Number</label>
          <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2 gap-2 bg-white">
            <FaPhoneAlt className="text-gray-500" />
            <input
              type="tel"
              name="phone"
              placeholder="Enter Mobile Number"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full focus:outline-none"
              maxLength={10}
            />
          </div>
        </div>

        {/* Age */}
        <div>
          <label className="block font-semibold mb-1">Age</label>
          <input
            type="number"
            name="age"
            placeholder="Enter Age"
            value={formData.age}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none bg-white"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block font-semibold mb-2">Gender</label>
          <div className="flex gap-4">
            {["Male", "Female", "Other"].map((g) => (
              <button
                key={g}
                onClick={() => handleGenderSelect(g)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-medium transition ${
                  formData.gender === g
                    ? "bg-[#0A4D68] text-white border-[#0A4D68]"
                    : "bg-white text-gray-700 border-gray-300 hover:border-[#0A4D68]"
                }`}
              >
                <FaVenusMars />
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Continue Button */}
        <div className="pt-4 flex justify-center sm:justify-end">
          <button
            onClick={handleContinue}
            disabled={
              loading ||
              !formData.name ||
              !formData.phone ||
              !formData.age ||
              !formData.gender
            }
            className={`w-full sm:w-auto px-6 py-3 rounded-xl text-white font-semibold text-lg transition ${
              !loading &&
              formData.name &&
              formData.phone &&
              formData.age &&
              formData.gender
                ? "bg-[#0A4D68] hover:bg-[#083952]"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {loading ? "Booking..." : "Book Appointment"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;
