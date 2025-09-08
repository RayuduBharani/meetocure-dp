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
        "under review by hospital",     
        "verified",         
        "rejected"
      ],
      default: "under review by hospital",
    },
    verificationDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DoctorVerification",
    },
  },
  { timestamps: true }
);




module.exports = mongoose.model("Doctor", doctorSchema);
