const express = require("express");
const {
  sendOtp,
  verifyOtp,
  doctorAuth
} = require("../controllers/doctorAuthController");

const router = express.Router();

// Doctor Auth Routes
router.post("/send-otp", sendOtp);
// Doctor verifies OTP
router.post("/verify-otp", verifyOtp);
// Doctor authentication route
router.post("/doctor-auth", doctorAuth);

module.exports = router;
