// models/Doctor.js
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const doctorSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    mobileNumber: {
      type: String,
      required: true,
      unique: true,
    },
    registrationStatus:{
      type: String,
      enum: [
        "pending_verification",
        "under review by hospital",
        "under admin approval",         
        "verified",         
        "rejected",
        "active",
        "inactive",
      ],
      default: "pending_verification",
    },
    verificationDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DoctorVerification",
    },
  },
  { timestamps: true }
);




module.exports = mongoose.model("Doctor", doctorSchema);
