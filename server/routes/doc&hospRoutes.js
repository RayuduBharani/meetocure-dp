const express = require("express");
const router = express.Router();
const { searchDoctors, searchHospitals } = require("../controllers/doc&hospController");
const protect = require("../middleware/authMiddleware");

router.get("/doctors", protect(["patient"]), searchDoctors);
router.get("/hospitals", protect(["patient"]), searchHospitals);

module.exports = router;
