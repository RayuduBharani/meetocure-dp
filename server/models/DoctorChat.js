const mongoose = require("mongoose");

const doctorAIChatSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    role: {
      type: String,
      enum: ["doctor", "ai"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    sources: {
      type: [String],
      default: [],
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("DoctorAIChat", doctorAIChatSchema);