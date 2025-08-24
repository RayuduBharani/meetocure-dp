const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { getMyNotifications, markAsRead, markAllAsRead } = require("../controllers/notificationController");

router.get("/my", protect(["patient", "doctor"]), getMyNotifications);
router.put("/:id/read", protect(["patient", "doctor"]), markAsRead);
router.put("/read-all", protect(["patient", "doctor"]), markAllAsRead);

module.exports = router;


