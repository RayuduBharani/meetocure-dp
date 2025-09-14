const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' }, // Made optional for system notifications
  type: { type: String, enum: ['DOCTOR_REGISTRATION', 'APPOINTMENT', 'GENERAL'], default: 'GENERAL' },
  isRead: { type: Boolean, default: false },
  metadata: { type: mongoose.Schema.Types.Mixed }, // For additional data like doctorId
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);