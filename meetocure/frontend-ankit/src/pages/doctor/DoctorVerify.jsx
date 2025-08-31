import React, { useState } from "react";
import { FaEnvelope, FaPhoneAlt, FaLock, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

const DoctorVerify = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    mobileNumber: "",
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const [registrationStatus, setRegistrationStatus] = useState("pending_verification");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /** ========== SEND OTP ========== */
  const handleSendOtp = async () => {
    const loadingToast = toast.loading("Sending OTP...");
    try {
      let phone = formData.mobileNumber.trim();
      if (/^\d{10}$/.test(phone)) {
        phone = "+91" + phone;
      }

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/doctor/send-otp`,
        { phone }
      );

      setRegistrationStatus(res.data.registrationStatus);
      setOtpSent(true);

      toast.dismiss(loadingToast);
      toast.success("OTP sent successfully!");
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err.response?.data?.message || "Failed to send OTP");
    }
  };

  /** ========== VERIFY OTP ========== */
  const handleVerifyOtp = async () => {
    const loadingToast = toast.loading("Verifying OTP...");
    try {
      let phone = formData.mobileNumber.trim();
      if (/^\d{10}$/.test(phone)) {
        phone = "+91" + phone;
      }

      await axios.post("${import.meta.env.VITE_BACKEND_URL}/api/auth/doctor/verify-otp", {
        phone,
        otp,
      });

      setOtpVerified(true);
      toast.dismiss(loadingToast);
      toast.success("OTP Verified!");
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err.response?.data?.message || "Invalid OTP");
    }
  };

  /** ========== REGISTER / LOGIN ========== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otpVerified) return toast.error("Please verify OTP first");

    const loadingToast = toast.loading("Signing in...");
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/doctor/doctor-auth`,
        formData
      );

      if (res.data.registrationStatus === "pending_verification") {
        toast.dismiss(loadingToast);
        navigate(`/doctor-verification/?doctorId=${res.data.doctorId}`);
      } else if (res.data.registrationStatus === "verified") {
        localStorage.setItem("doctorToken", res.data.token);
        toast.dismiss(loadingToast);
        toast.success("Login successful!");
        navigate("/doctor-dashboard");
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-white font-[Poppins] px-6 pt-6 pb-28">
      <button onClick={() => navigate(-1)} className="text-xl mb-4">
        <FaArrowLeft />
      </button>

      {/* Header */}
      <div className="flex flex-col items-center text-center mb-6">
        <img src="/assets/logo.png" alt="Logo" className="w-28 h-28 mb-4" />
        <h1 className="text-3xl font-extrabold text-[#004B5C]">
          Doctor Verification
        </h1>
        <p className="text-base text-gray-700 mt-1">
          Enter details to Register/Login with OTP
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="max-w-md mx-auto space-y-6"
        autoComplete="off"
      >
        {/* Email */}
        <div>
          <label className="block text-sm font-semibold mb-1">Email</label>
          <div className="flex items-center border border-[#7A869A] rounded-xl px-3 py-2">
            <FaEnvelope className="text-[#7A869A] mr-2" />
            <input
              type="email"
              name="email"
              placeholder="Enter Your Email"
              className="w-full outline-none bg-transparent text-gray-700 placeholder-gray-500"
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-semibold mb-1">Password</label>
          <div className="flex items-center border border-[#7A869A] rounded-xl px-3 py-2">
            <FaLock className="text-[#7A869A] mr-2" />
            <input
              type="password"
              name="password"
              placeholder="Enter Password (min 6 chars)"
              className="w-full outline-none bg-transparent text-gray-700 placeholder-gray-500"
              required
              value={formData.password}
              onChange={handleChange}
              minLength={6}
            />
          </div>
        </div>

        {/* Mobile + OTP */}
        <div>
          <label className="block text-sm font-semibold mb-1">
            Mobile Number
          </label>
          <div className="flex items-center border border-[#7A869A] rounded-xl px-3 py-2">
            <FaPhoneAlt className="text-[#7A869A] mr-2" />
            <input
              type="tel"
              name="mobileNumber"
              placeholder="Enter 10-digit Mobile Number"
              className="w-full outline-none bg-transparent text-gray-700 placeholder-gray-500"
              required
              pattern="\d{10}"
              maxLength={10}
              value={formData.mobileNumber}
              onChange={handleChange}
              disabled={otpSent}
            />
          </div>

          {!otpSent ? (
            <button
              type="button"
              onClick={handleSendOtp}
              className="mt-2 px-4 py-2 bg-[#004B5C] text-white rounded-full font-medium"
            >
              Send OTP
            </button>
          ) : (
            <div className="mt-3">
              <label className="block text-sm font-semibold mb-1">
                Enter OTP
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full border border-[#7A869A] px-4 py-2 rounded-xl outline-none placeholder-gray-500"
                placeholder="6-digit OTP"
                required
              />
              <button
                type="button"
                onClick={handleVerifyOtp}
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded-full font-medium"
              >
                Verify OTP
              </button>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full py-3 rounded-full font-semibold bg-[#004B5C] text-white hover:bg-[#003246] transition"
          >
            Continue
          </button>
        </div>
      </form>

      {/* Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-[2rem] px-10 py-8 max-w-sm w-full text-center shadow-2xl">
            <img
              src="/assets/popups/success.png"
              alt="Success"
              className="w-28 h-28 object-contain mx-auto mb-6"
            />
            <h3 className="text-[22px] font-bold text-[#1F2A37] mb-2">
              Registration Submitted
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Your registration is pending verification. Please wait for
              approval.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorVerify;
