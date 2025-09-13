const { getAllHospitalLogins, getDoctorsForHospitalLogin, addDoctorsToHospitalLogin } = require("../controllers/hospitalController");

const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  createHospital,
  getAllHospitals,
  getHospitalById,
  filterHospitals,
  getNearbyHospitals,
} = require("../controllers/hospitalController");

// Add doctors to a hospital login document
router.post("/hospitallogins/:id/doctors", addDoctorsToHospitalLogin);

// Get doctors for a hospital login by hospital id
router.get("/hospitallogins/:id/doctors", getDoctorsForHospitalLogin);

// Get all hospitals from HospitalLogin collection
router.get("/hospitallogins", getAllHospitalLogins);

// Doctor adds hospital
router.post("/", protect(["doctor"]), createHospital);

// All hospitals
router.get("/", getAllHospitals);

// Place static routes before dynamic :id to avoid conflicts
router.get("/filter", filterHospitals);
router.get("/nearby", getNearbyHospitals);

// Specific hospital + doctor info
router.get("/:id", getHospitalById);

module.exports = router;
