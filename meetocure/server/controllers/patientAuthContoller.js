const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const twilio = require("twilio");
const Patient = require("../models/Patient");
const Otp = require("../models/Otp");
require("dotenv").config();
const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_MESSAGING_SERVICE_SID,
  JWT_SECRET,
} = process.env;


const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);


const signToken = (patient) =>
  jwt.sign({ id: patient._id, role: "patient" }, JWT_SECRET, { expiresIn: "7d" });

// Format phone → Indian numbers
const normalizePhone = (p) => {
  const digits = (p || "").replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
  if (digits.startsWith("+")) return digits;
  throw new Error("Invalid phone number");
};

// Send OTP
exports.sendOtp = async (req, res) => {
  console.log("hello");   //  Check if this prints when API is hit
  try {
    const phone = normalizePhone(req.body.phone);  //  If this throws, it will go to catch
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const codeHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

    await Otp.findOneAndUpdate(
      { phone },
      { codeHash, expiresAt, attempts: 0 },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await client.messages.create({
      body: `Your verification code is From MeetOCure: ${otp}. It expires in 2 minutes.`,
      messagingServiceSid: TWILIO_MESSAGING_SERVICE_SID,
      to: phone, 
    });
    // console.log(`OTP for ${phone}: ${otp}`);   Log OTP for testing

    return res.json({ success: true, message: "OTP sent" });  // should always return
  } catch (err) {
    console.error("Error in sendOtp:", err);  // 👈 log actual error
    return res.status(400).json({ success: false, message: err.message });
  }
};



// Verify OTP
exports.verifyOtp = async (req, res) => {
  try {
    const phone = normalizePhone(req.body.phone);
    const code = (req.body.otp || "").trim();

    const doc = await Otp.findOne({ phone });
    if (!doc) return res.status(400).json({ message: "OTP not found. Please resend." });

    if (doc.expiresAt < new Date()) {
      await Otp.deleteOne({ phone });
      return res.status(400).json({ message: "OTP expired. Please resend." });
    }

    if (doc.attempts >= 5) {
      await Otp.deleteOne({ phone });
      return res.status(429).json({ message: "Too many attempts. Please resend OTP." });
    }

    const ok = await bcrypt.compare(code, doc.codeHash);
    if (!ok) {
      doc.attempts += 1;
      await doc.save();
      return res.status(400).json({ message: "Invalid OTP" });
    }

    
    let patient = await Patient.findOne({ phone });
    if (!patient) {
      patient = await Patient.create({ phone, notifications: [] });
    }

    const token = signToken(patient);

   
    await Otp.deleteOne({ phone });

    res.json({
      success: true,
      token,
      patient: {
        _id: patient._id,
        phone: patient.phone,
        notifications: patient.notifications,
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

