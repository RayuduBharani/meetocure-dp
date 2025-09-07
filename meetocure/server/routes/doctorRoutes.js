const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const doctorController = require("../controllers/doctorController");
const { getDoctorProfile, updateDoctorProfile, getDoctorStats } = require("../controllers/doctorController");
const DoctorVerificationShema = require("../models/DoctorVerificationShema");

// Public: list doctors, supports optional filtering via query params
router.get("/", async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {};

    if (category) {
      // case-insensitive substring match
      const regex = new RegExp(category, "i");
      filter.$or = [
        { primarySpecialization: regex },
        { category: regex },
        { specialization: regex },
        { fullName: regex },
      ];
    } else if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [
        { primarySpecialization: regex },
        { category: regex },
        { specialization: regex },
        { fullName: regex },
      ];
    }

    const doctors = await DoctorVerificationShema.find(filter);
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Protected routes for doctor profile management
router.get("/profile", protect(["doctor"]), getDoctorProfile);
router.put("/profile", protect(["doctor"]),updateDoctorProfile);

// Doctor dashboard statistics
router.get("/stats", protect(["doctor"]), getDoctorStats);

// Get doctor by id (keep after other routes)
router.get("/:id", async (req, res) => {
  try {
    const doctorId = req.params.id;
    const doctor = await DoctorVerificationShema.findOne({doctorId:doctorId});
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.status(200).json(doctor);
  } catch (error) {
    console.error("Error fetching doctor:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
