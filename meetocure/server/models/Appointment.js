const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    // References
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DoctorVerification",
      required: false,
    },

    // Embedded snapshot of patient data
    patientInfo: {
      name: { type: String, required: true },
      gender: { type: String, enum: ["male", "female", "other"], required: true },
      age: { type: Number, required: true },
      phone: { type: String, required:true },  // e.g. "+91 XXXXXXXX"
      note: { type: String, default: "" },  // e.g. “Diabetic, allergic to penicillin”
    },

    // Appointment core
    date: { type: String, required: true },
    time: { type: String, required: true },
    status: {
      type: String,
      enum: ["Upcoming", "Completed", "Cancelled"],
      default: "Upcoming",
    },
    reason: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointments", appointmentSchema);
