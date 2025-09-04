const Notification = require("../models/Notification");

// Create a notification
const createNotification = async ({ userId, title, message, type = "info", targetPath = "", metadata = {} }) => {
  const notif = new Notification({ userId, title, message, type, targetPath, metadata });
  await notif.save();
  return notif;
};

// Get notifications for current user
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(100);
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mark one as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notif = await Notification.findOne({ _id: id, userId: req.user.id });
    if (!notif) return res.status(404).json({ message: "Notification not found" });
    notif.isRead = true;
    await notif.save();
    res.json({ success: true, notification: notif });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mark all as read
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id, isRead: false }, { $set: { isRead: true } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createNotification,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
};


