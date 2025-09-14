const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  codeHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 }
});

module.exports = mongoose.model("Otp", otpSchema);
