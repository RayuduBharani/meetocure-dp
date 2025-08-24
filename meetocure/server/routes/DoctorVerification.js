const express = require("express");
const router = express.Router();
const { verifyDoctor } = require("../controllers/DoctorVerificationForm");
// Doctor Verification filling Route
router.post("/verify-doctor", verifyDoctor);

module.exports = router;


