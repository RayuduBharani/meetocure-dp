const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  getPatientProfile,
  updatePatientProfile,
  getFilteredPatients,
} = require("../controllers/patientController");

router.get("/profile", protect(["patient"]), getPatientProfile);
router.put("/profile", protect("patient"), updatePatientProfile);
router.get("/", protect(["doctor"]), getFilteredPatients); // Optional: e.g., doctor viewing patients

module.exports = router;
