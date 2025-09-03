const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Doctor = require("../models/DoctorShema");
const Otp = require("../models/Otp");
const Patient = require("../models/Patient");
const Notification = require("../models/Notification");
const twilio = require("twilio");

const JWT_SECRET = process.env.JWT_SECRET;
const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_MESSAGING_SERVICE_SID } = process.env;

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);


// ========== SEND OTP ==========
const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: "Phone required" });

    const existingPatient = await Patient.findOne({phone});
    if (existingPatient) {
      return res.status(400).json({ message: "This phone is already registered as a patient" });
    }
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const salt = await bcrypt.genSalt(10);
    const codeHash = await bcrypt.hash(otp, salt);

    await Otp.findOneAndUpdate(
      { phone },
      { codeHash, expiresAt: Date.now() + 5 * 60 * 1000, attempts: 0 },
      { upsert: true, new: true }
    );
    // await client.messages.create({
    //   body: `Your verification code is: ${otp}`,
    //   messagingServiceSid: TWILIO_MESSAGING_SERVICE_SID,
    //   to: phone,
    // });

    console.log(`OTP for ${phone}: ${otp}`); // For testing purposes only
    const doctor = await Doctor.findOne({ mobileNumber: phone });
    return res.json({
      success: true,
      message: "OTP sent successfully",
      registrationStatus: doctor ? doctor.registrationStatus : "pending_verification",
    });
  } catch (err) {
    console.error("Send OTP Error:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

// ========== VERIFY OTP ==========
const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) return res.status(400).json({ message: "Phone and OTP required" });

    const record = await Otp.findOne({ phone });
    if (!record) return res.status(400).json({ message: "No OTP found" });

    if (record.expiresAt < Date.now()) {
      await Otp.deleteOne({ phone });
      return res.status(400).json({ message: "OTP expired" });
    }

    if (record.attempts >= 5) {
      await Otp.deleteOne({ phone });
      return res.status(400).json({ message: "Too many attempts. Request a new OTP" });
    }

    const isMatch = await bcrypt.compare(otp, record.codeHash);
    if (!isMatch) {
      record.attempts += 1;
      await record.save();
      return res.status(400).json({ message: "Invalid OTP" });
    }

    await Otp.deleteOne({ phone });

    return res.json({ success: true, message: "OTP verified successfully" });
  } catch (err) {
    console.error("Verify OTP Error:", err);
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
        registrationStatus: "pending_verification",
      });
      // Emit socket event for new doctor registration
      try {
        const io = req.app.get('io');
        const notification = await Notification.create({
          message: `New doctor registration: ${email}`,
          type: 'DOCTOR_REGISTRATION',
          isRead: false,
          createdAt: new Date()
        });

        io.emit('receiveNotification', {
          type: 'DOCTOR_REGISTRATION',
          message: `New doctor registration: ${email}`,
          doctorId: doctor._id,
          notificationId: notification._id
        });
      } catch (error) {
        console.error('Failed to send notification:', error);
      }

      return res.json({
        message: "Registration submitted, pending verification",
        doctorId: doctor._id,
        registrationStatus: doctor.registrationStatus,
      });
    } else {
      const match = await bcrypt.compare(password, doctor.passwordHash);
      if (!match) return res.status(400).json({ message: "Invalid credentials" });

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
        doctor:{
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
