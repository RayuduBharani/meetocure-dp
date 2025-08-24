const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { _id: false, timestamps: true }
);

const patientSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true }, // E.164 or 10-digit (decide one format)
    notifications: { type: [notificationSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema);
