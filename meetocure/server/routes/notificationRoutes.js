// const express = require("express");
// const router = express.Router();
// const protect = require("../middleware/authMiddleware");
// const { getMyNotifications, markAsRead, markAllAsRead } = require("../controllers/notificationController");

// router.get("/my", protect(["patient", "doctor"]), getMyNotifications);
// router.put("/:id/read", protect(["patient", "doctor"]), markAsRead);
// router.put("/read-all", protect(["patient", "doctor"]), markAllAsRead);

// module.exports = router;


const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// Get all notifications for a user
router.get('/:userId', async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new notification
router.post('/', async (req, res) => {
  try {
    const { message, userId } = req.body;
    const notification = new Notification({ message, userId });
    await notification.save();
    // Emit socket event (handled in server.js)
    req.app.get('io').to(userId).emit('receiveNotification', notification);
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a notification
router.delete('/:id', async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;