const jwt = require("jsonwebtoken");
const twilio = require("twilio");
const Patient = require("../models/Patient");
require("dotenv").config();
const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
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
// Send OTP
exports.sendOtp = async (req, res) => {
  try {
    const phone = normalizePhone(req.body.phone);

    await client.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({ to: phone, channel: "sms" });

    res.json({ success: true, message: "OTP sent" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: err.message });
  }
};



// Verify OTP
exports.verifyOtp = async (req, res) => {
  try {
    const phone = normalizePhone(req.body.phone);
    const code = req.body.otp;

    const check = await client.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({ to: phone, code });

    if (check.status !== "approved") {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    let patient = await Patient.findOne({ phone });
    if (!patient) patient = await Patient.create({ phone, notifications: [] });

    const token = signToken(patient);

    res.json({ success: true, token, patient });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

