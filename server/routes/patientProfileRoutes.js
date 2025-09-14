const express = require("express");
const router = express.Router();
const controller = require("../controllers/patientProfileController");
const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/multerMemory");

// Mounted at: app.use("/api/patient/profile", require("./routes/patientProfileRoutes"));

// GET /api/patient/profile/get
router.get("/get", protect(["patient"]), controller.getProfile);

// PUT /api/patient/profile/add
// protect -> then multer to parse multipart/form-data
router.put("/add", protect(["patient"]), upload.single("photo"), controller.createOrUpdateProfile);

module.exports = router;