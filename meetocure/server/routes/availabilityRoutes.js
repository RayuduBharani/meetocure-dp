const express = require("express");
const router = express.Router();
const { setAvailability, getAvailability, deleteAvailabilityDate, updateAvailabilityDate } = require("../controllers/availabilityController");
const protect = require("../middleware/authMiddleware");

// Doctor sets availability
router.post("/", protect("doctor"), setAvailability);

// Patient can fetch doctor's availability
router.get("/:doctorId", getAvailability);

// Update slots for a specific date (doctor)
router.put("/:date", protect("doctor"), updateAvailabilityDate);

router.delete("/:date", protect("doctor"), deleteAvailabilityDate);

module.exports = router;
