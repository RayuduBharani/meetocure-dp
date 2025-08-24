const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const doctorController = require("../controllers/doctorController");

const {
  getDoctorProfile,
  updateDoctorProfile,
  getFilteredDoctors,
  
} = require("../controllers/doctorController");

router.get("/profile", protect(["doctor"]), getDoctorProfile);

router.put("/profile", protect("doctor"), doctorController.updateDoctorProfile);

router.get("/", protect(["patient", "doctor", "admin"]), getFilteredDoctors);


module.exports = router;
