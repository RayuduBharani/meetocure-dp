const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  setDoctorSlots,
  getDoctorSlots,
  getSlotsByDoctorId,
} = require("../controllers/slotController");

// Doctor sets slots
router.post("/", protect(["doctor"]), setDoctorSlots);

// Doctor views their slots
router.get("/", protect(["doctor"]), getDoctorSlots);

// Patients can view slots of a doctor
router.get("/:doctorId", getSlotsByDoctorId);

module.exports = router;
