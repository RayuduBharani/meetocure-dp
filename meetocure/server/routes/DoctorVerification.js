const express = require("express");
const router = express.Router();
const upload = require('../middleware/multerMemory');
const { verifyDoctor } = require("../controllers/DoctorVerificationForm");
// Doctor Verification filling Route - accept files
router.post(
	"/verify-doctor",
	upload.fields([
		{ name: 'profileImage', maxCount: 1 },
		{ name: 'identityDocument', maxCount: 1 },
		{ name: 'medicalCouncilCertificate', maxCount: 1 },
		{ name: 'qualificationCertificates', maxCount: 10 },
		{ name: 'digitalSignatureCertificate', maxCount: 1 }, // added: accept digital signature image
	]),
	verifyDoctor
);

module.exports = router;


