const Notification = require("../models/Notification");

// Create a notification
const createNotification = async ({ user, title, message, type = "info", targetPath = "", metadata = {} }) => {
    const notif = new Notification({ user, title, message, type, targetPath, metadata });
    await notif.save();
    return notif;
};

// Get notifications for current user
const getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(100);
        res.json({ notifications });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Mark one as read
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notif = await Notification.findOne({ _id: id, user: req.user.id });
        if (!notif) return res.status(404).json({ message: "Notification not found" });
        notif.read = true;
        await notif.save();
        res.json({ success: true, notification: notif });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Mark all as read
const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany({ user: req.user.id, read: false }, { $set: { read: true } });
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


