const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/multerMemory");
const {
  bookAppointment,
  getDoctorAppointments,
  updateAppointmentStatus,
  cancelAppointment,
  acceptAppointment,
  completeAppointment,
  getPatientAppointments,
} = require("../controllers/appointmentController");
const Availability = require("../models/Availability");


// getting booked appointments based on doctor and specific date
router.post("/search/:doctorId", async (req, res) => {
  try {
    const { date } = req.body;
    const { doctorId } = req.params;

    if (!date || !doctorId) {
      return res.status(400).json({ success: false, message: "DoctorId and Date are required" });
    }

    const doctorsAvailable = await Availability.find({
      doctor: doctorId,
      days: { $elemMatch: { date: date } } // fetch only matching date
    }, { 
      days: { $elemMatch: { date: date } } // only return the matched date in the days array
    }).populate("doctor");

    res.json({ success: true, data: doctorsAvailable });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Patient books appointment
router.post(
  "/book",
  protect(["patient"]),
  upload.array("medicalRecords", 10), // field name must match frontend FormData
  bookAppointment
);

//Patient views their own appointments 
router.get("/my", protect(["patient"]), getPatientAppointments);

//Doctor views all their appointments -- Done
router.get("/doctor", protect(["doctor"]), getDoctorAppointments);

//Doctor updates appointment status 
router.put("/:id/status", protect(["doctor"]), updateAppointmentStatus);

//Doctor cancels appointment
router.put("/:id/cancel", protect(["doctor"]), cancelAppointment);

//Doctor accepts appointment
router.put("/:id/accept", protect(["doctor"]), acceptAppointment);

//Doctor completes appointment
router.put("/:id/complete", protect(["doctor"]), completeAppointment);



module.exports = router;
