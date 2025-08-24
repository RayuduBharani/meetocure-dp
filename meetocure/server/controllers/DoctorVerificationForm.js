// controllers/doctorController.js
const Doctor = require("../models/DoctorShema");
const DoctorVerification = require("../models/DoctorVerificationShema");
const jwt = require("jsonwebtoken");


const verifyDoctor = async (req, res) => {
  try {
    console.log("Doctor Verification Request:", req.body);

    const { doctorId } = req.query; // from frontend query param
    // const ec=await Doctor.findById("68a36851267ffefa49bed42f");
    // console.log("Doctor ID from query:", ec);
    // Find doctor by ID (doctorId is ObjectId in Doctor collection)
    const doctor = await Doctor.findById(doctorId);
    console.log("Found Doctor:", doctor);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }


    const verification = new DoctorVerification({
      doctorId: doctor._id,
      ...req.body,
    });
    await verification.save();


    doctor.verificationDetails = verification._id;
    doctor.registrationStatus = "verified"; //under review after verification in main production admin should verify the doctor
    await doctor.save();

    const token = jwt.sign(
      { doctorId: doctor._id, email: doctor.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      message: "Verification submitted successfully",
      token,
    });
  } catch (err) {
    console.error("Doctor Verification Error:", err);
    res.status(500).json({ message: "Verification failed" });
  }
};

module.exports = { verifyDoctor };