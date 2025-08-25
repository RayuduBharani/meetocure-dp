// models/Chat.js
const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    role: {
      type: String,
      enum: ["patient", "ai"], // who sent the message
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    sources: {
      type: [String], // optional, if AI gives sources
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);
