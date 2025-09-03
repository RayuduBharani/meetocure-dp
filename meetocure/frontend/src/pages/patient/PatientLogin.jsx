import React, { useState, useEffect, useRef } from "react";
import { FaPhoneAlt, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const PatientLogin = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("".padEnd(6, ""));
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef([]);
  useEffect(() => {
    let id;
    if (otpSent && timer > 0) {
      id = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(id);
  }, [otpSent, timer]);

  const normalized = (p) => p.replace(/\D/g, "").slice(-10);

  // ================== SEND OTP ==================
  const sendCode = async () => {
    if (!/^\d{10}$/.test(phone)) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    try {
      toast.loading("Sending OTP...", { id: "otp" });
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/patient/send-otp`,
        { phone }
      );

      toast.success("OTP Sent!", { id: "otp" });

      setOtpSent(true);
      setOtp("".padEnd(6, ""));
      setTimer(60);

      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } catch (e) {
      console.error("Send OTP error:", e.response?.data || e.message);
      toast.error("Failed to send OTP", { id: "otp" });
    } finally {
      setLoading(false);
    }
  };

  // ================== VERIFY OTP ==================
  const verifyCode = async () => {
    console.log("Verifying with:", { phone, otp });

    if (!/^\d{6}$/.test(otp)) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setLoading(true);
      toast.loading("Verifying OTP...", { id: "verify" });

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/patient/verify-otp`,
        { phone, otp }
      );

      console.log("Verify OTP Response:", res.data);
      toast.success("OTP Verified!", { id: "verify" });

      const { token, patient } = res.data;
      if (token) localStorage.setItem("token", token);
      if (patient) {
        localStorage.setItem("user", JSON.stringify(patient));
        // store patientId for chat page compatibility (handle different backend shapes)
        const pid = patient._id || patient.id || patient.patientId || null;
        if (pid) {
          localStorage.setItem("patientId", pid);
          // also seed initial conversation with "Analyzing" message
          try {
            const conv = {
              id: `conv_welcome_${Date.now()}`,
              title: "Analyzing",
              lastMessage: "Analyzing",
              timestamp: Date.now(),
              messages: [
                {
                  id: 'system-analyzing',
                  content: "Analyzing",
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  isUser: false
                }
              ]
            };
            localStorage.setItem(`chat_history_${pid}`, JSON.stringify([conv]));
          } catch (e) {
            // ignore localStorage errors
          }
        }
      }
      
      navigate("/patient-dashboard");
    } catch (e) {
      console.error("Verification error:", e.response?.data || e.message);
      toast.error("OTP verification failed", { id: "verify" });
    } finally {
      setLoading(false);
    }
  };

  // ================== OTP HANDLER ==================
  const handleOtpChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;

    const arr = otp.split("");
    arr[idx] = val;
    const nextOtp = arr.join("");
    setOtp(nextOtp);

    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
    if (!val && idx > 0) otpRefs.current[idx - 1]?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!otpSent) sendCode();
    else verifyCode();
  };

  // ================== RENDER ==================
  return (
    <div className="min-h-screen bg-white font-[Poppins] flex items-center justify-center px-4 relative">
      <Toaster position="top-right" />

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 text-2xl text-[#004B5C] hover:text-[#003246]"
      >
        <FaArrowLeft />
      </button>

      <form onSubmit={handleSubmit} className="w-full max-w-xl bg-white text-center">
        {/* Header */}
        <div className="flex flex-col items-center mb-10">
          <img src="/assets/logo.png" alt="Logo" className="w-28 h-28 mb-6" />
          <h1 className="text-4xl font-bold text-[#004B5C]">
            {otpSent ? "Verify Code" : "Hi, Welcome!"}
          </h1>
          <p className="text-base text-[#2D3A3A] mt-3 px-4">
            {otpSent
              ? "Enter the code we sent to your number."
              : "Enter your mobile number; we'll send a verification code."}
          </p>
        </div>

        {/* Phone Input */}
        <label className="block text-left text-sm font-semibold mb-2">
          Mobile Number
        </label>
        <div
          className={`flex items-center border ${
            otpSent ? "bg-gray-100" : ""
          } border-[#7A869A] rounded-xl px-4 py-3 mb-6`}
        >
          <FaPhoneAlt className="text-[#7A869A] mr-3" />
          <input
            type="tel"
            placeholder="Enter Your Mobile Number"
            value={phone}
            onChange={(e) => setPhone(normalized(e.target.value))}
            className="w-full outline-none bg-transparent text-gray-700 placeholder-gray-500 text-base"
            disabled={otpSent}
          />
        </div>

        {/* Conditional Rendering */}
        {!otpSent ? (
          // SEND OTP
          <button
            type="submit"
            className={`w-full py-3 rounded-full font-semibold text-lg ${
              /^\d{10}$/.test(phone)
                ? "bg-[#004B5C] text-white hover:bg-[#003246]"
                : "bg-gray-300 text-white"
            }`}
            disabled={!/^\d{10}$/.test(phone) || loading}
          >
            {loading ? "Sending..." : "Send Code"}
          </button>
        ) : (
          <>
            {/* OTP Inputs */}
            <div className="flex justify-between gap-3 mb-6">
              {[...Array(6)].map((_, i) => (
                <input
                  key={i}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={otp[i]}
                  onChange={(e) => handleOtpChange(e.target.value, i)}
                  ref={(el) => (otpRefs.current[i] = el)}
                  className="w-14 h-14 border border-[#004B5C] rounded text-center text-2xl font-semibold outline-none"
                />
              ))}
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              className={`w-full py-3 rounded-full font-semibold text-lg ${
                /^\d{6}$/.test(otp)
                  ? "bg-[#004B5C] text-white hover:bg-[#003246]"
                  : "bg-gray-300 text-white"
              }`}
              disabled={!/^\d{6}$/.test(otp) || loading}
            >
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>

            {/* Timer / Resend */}
            <div className="text-center text-sm text-gray-500 mt-4">
              Didn’t get the code?{" "}
              {timer > 0 ? (
                <span>Time Left: 00:{String(timer).padStart(2, "0")}</span>
              ) : (
                <span
                  onClick={() => !loading && sendCode()}
                  className="text-[#004B5C] font-semibold underline cursor-pointer"
                >
                  Resend
                </span>
              )}
            </div>

            {/* Change Number */}
            <div className="mt-3">
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtp("".padEnd(6, ""));
                  setTimer(60);
                  setPhone("");
                }}
                className="text-sm underline text-gray-500"
              >
                Use a different number
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default PatientLogin;
