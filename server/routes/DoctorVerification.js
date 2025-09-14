const express = require("express");
const router = express.Router();
const upload = require('../middleware/multerMemory');
const { verifyDoctor, getVerificationStatus, deleteVerification } = require("../controllers/DoctorVerificationForm");

// Get verification status
router.get("/verification-status/:doctorId", getVerificationStatus);

// Delete verification (for testing/debugging)
router.delete("/verification/:doctorId", deleteVerification);

// Clear all verifications (for testing only - remove in production)
router.delete("/verifications/clear-all", async (req, res) => {
  try {
    const DoctorVerification = require("../models/DoctorVerificationShema");
    await DoctorVerification.deleteMany({});
    res.json({ success: true, message: "All verifications cleared" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Doctor Verification filling Route - accept files
router.post(
	"/verify-doctor",
	upload.fields([
		{ name: 'profileImage', maxCount: 1 },
		{ name: 'identityDocument', maxCount: 1 },
		{ name: 'medicalCouncilCertificate', maxCount: 1 },
		{ name: 'qualificationCertificates', maxCount: 10 },
	]),
	verifyDoctor
);

module.exports = router;




