const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Doctor = require("../models/DoctorShema");
const Otp = require("../models/Otp");
const Patient = require("../models/Patient");
const twilio = require("twilio");

const JWT_SECRET = process.env.JWT_SECRET;
const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID } = process.env;

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);


// ========== SEND OTP ==========
const sendOtp =async (req, res) => {
  try {
    const phone = req.body.phone;
    if (!phone) return res.status(400).json({ message: "Phone required" });

    // block if this number is already registered as a patient
    const existingPatient = await Patient.findOne({ phone });
    if (existingPatient) {
      return res.status(400).json({ message: "This phone is already registered as a patient" });
    }

    // Send OTP via Twilio Verify
    await client.verify.v2.services(TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({ to: phone, channel: "sms" });

    const doctor = await Doctor.findOne({ mobileNumber: phone });

    return res.json({
      success: true,
      message: "OTP sent successfully",
      registrationStatus: doctor ? doctor.registrationStatus : "under review by hospital",
    });
  } catch (err) {
    console.error("Doctor Send OTP Error:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

// ========== VERIFY OTP ==========
const verifyOtp = async (req, res) => {
  try {
    const phone = req.body.phone;
    const code = req.body.otp;

    if (!phone || !code) {
      return res.status(400).json({ message: "Phone and OTP required" });
    }

    const check = await client.verify.v2.services(TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({ to: phone, code });
    if (check.status !== "approved") {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    return res.json({ success: true, message: "OTP verified successfully" });
  } catch (err) {
    console.error("Doctor Verify OTP Error:", err);
    res.status(500).json({ message: "OTP verification failed" });
  }
};

// ========== REGISTER / LOGIN ==========
const doctorAuth = async (req, res) => {
  try {
    const { email, password, mobileNumber } = req.body;

    const existingPatient = await Patient.findOne({ phone: mobileNumber });
    if (existingPatient) {
      return res.status(400).json({ message: "This phone is already registered as a patient" });
    }

    let doctor = await Doctor.findOne({ email });

    if (!doctor) {
      // Register new doctor
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      doctor = await Doctor.create({
        email,
        passwordHash: hash,
        mobileNumber,
        registrationStatus: "under review by hospital",
      });
      // Send welcome notification to doctor
      try {
        const { createNotification } = require("./notificationController");
        const notification = await createNotification({
          userId: doctor._id,
          title: "Welcome!",
          message: `Welcome Dr. ${email} to MeetoCure! Your registration is pending verification.`,
          type: "DOCTOR_REGISTRATION"
        });
        const io = req.app.get("io");
        if (io) io.to(doctor._id.toString()).emit("receiveNotification", notification);
      } catch (error) {
        console.error('Failed to send notification:', error);
      }

      return res.json({
        message: "Registration submitted, pending verification",
        doctorId: doctor._id,
        registrationStatus: doctor.registrationStatus,
        isNewlyRegistered: true,
      });
    } else {
      const match = await bcrypt.compare(password, doctor.passwordHash);
      if (!match) return res.status(400).json({ message: "Invalid credentials" });

      // Use Doctor collection's registrationStatus
      if (doctor.registrationStatus !== "verified") {
        return res.json({
          message: "Doctor not verified",
          registrationStatus: doctor.registrationStatus,
          doctorId: doctor._id,
        });
      }

      const token = jwt.sign({ id: doctor._id, role: "doctor" }, JWT_SECRET, { expiresIn: "7d" });
      return res.json({
        message: "Login successful",
        token,
        doctor: {
          doctorId: doctor._id,
          registrationStatus: doctor.registrationStatus,
          role: "doctor",
        }
      });
    }
  } catch (err) {
    console.error("DoctorAuth Error:", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { sendOtp, verifyOtp, doctorAuth };
