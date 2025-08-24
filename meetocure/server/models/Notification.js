const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    from: { type: String, required: true },   // sender userId/username
    to:   { type: String, required: true },   // receiver userId/username
    message: { type: String, required: true },
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

NotificationSchema.index({ to: 1, createdAt: -1 });

module.export = mongoose.model("Notification", NotificationSchema);
