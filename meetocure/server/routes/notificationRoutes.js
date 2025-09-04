// ...existing code...


const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { getMyNotifications, markAsRead, markAllAsRead, createNotification } = require("../controllers/notificationController");

// Fetch notifications for logged-in user
router.get("/my", protect(["patient", "doctor"]), getMyNotifications);
// Mark one notification as read
router.put("/:id/read", protect(["patient", "doctor"]), markAsRead);
// Mark all notifications as read
router.put("/read-all", protect(["patient", "doctor"]), markAllAsRead);

// Delete all read notifications for logged-in user
router.delete("/delete-read", protect(["patient", "doctor"]), async (req, res) => {
  try {
    const userId = req.user.id;
    // Delete from Notification collection
    const Notification = require("../models/Notification");
    const result = await Notification.deleteMany({ userId: userId, isRead: true });
    // Also remove read notifications from Patient.notifications array (field is 'read', not 'isRead')
    const Patient = require("../models/Patient");
    await Patient.updateOne(
      { _id: userId },
      { $pull: { notifications: { read: true } } }
    );
    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create notification (admin or system use)
router.post("/create", async (req, res) => {
  try {
    const { userId, title, message, type, targetPath, metadata } = req.body;
    const notification = await createNotification({ userId, title, message, type, targetPath, metadata });
    // Emit socket event to patient
    const io = req.app.get("io");
    if (io && userId) {
      io.to(userId).emit("receiveNotification", notification);
    }
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete notification (admin or system use)
router.delete("/:id", async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;