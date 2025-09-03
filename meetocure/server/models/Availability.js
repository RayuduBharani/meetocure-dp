const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DoctorVerification",
      required: true,
      unique: true  
    },
    days: [
      {
        date: { type: String, required: true },
        slots: [String]
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Availability", availabilitySchema);
