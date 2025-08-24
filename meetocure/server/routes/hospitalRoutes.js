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
