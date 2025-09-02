// controllers/DoctorVerificationForm.js
const Doctor = require("../models/DoctorShema");
const DoctorVerification = require("../models/DoctorVerificationShema");
const jwt = require("jsonwebtoken");
const cloudinary = require('../utils/cloudinary');

// helper to upload a buffer to Cloudinary
const uploadBufferToCloudinary = (buffer, folder, filename) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, public_id: filename, resource_type: 'auto' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};

const verifyDoctor = async (req, res) => {
  try {
    console.log("Doctor Verification Request: files:", Object.keys(req.files || {}));

    const { doctorId } = req.query; // from frontend query param
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Build data from body
    const data = { ...req.body };

    // If files were uploaded, upload them to Cloudinary and set URLs
    if (req.files) {
      // profileImage
      if (req.files.profileImage && req.files.profileImage[0]) {
        const file = req.files.profileImage[0];
        const url = await uploadBufferToCloudinary(file.buffer, 'doctor_verifications', `profile_${doctorId}`);
        data.profileImage = url;
      }

      // identityDocument
      if (req.files.identityDocument && req.files.identityDocument[0]) {
        const file = req.files.identityDocument[0];
        const url = await uploadBufferToCloudinary(file.buffer, 'doctor_verifications', `identity_${doctorId}`);
        data.identityDocumentUrl = url;
      }

      // medicalCouncilCertificate
      if (req.files.medicalCouncilCertificate && req.files.medicalCouncilCertificate[0]) {
        const file = req.files.medicalCouncilCertificate[0];
        const url = await uploadBufferToCloudinary(file.buffer, 'doctor_verifications', `council_${doctorId}`);
        data.medicalCouncilCertificateUrl = url;
      }

      // qualificationCertificates (multiple)
      if (req.files.qualificationCertificates && req.files.qualificationCertificates.length) {
        const certUrls = [];
        for (const [idx, file] of req.files.qualificationCertificates.entries()) {
          const url = await uploadBufferToCloudinary(file.buffer, 'doctor_verifications', `qual_${doctorId}_${idx}`);
          certUrls.push(url);
        }
        data.qualificationCertificatesUrls = certUrls;
      }
    }

    // Parse JSON fields that might be sent as strings (e.g., arrays or objects)
    try {
      if (typeof data.qualifications === 'string') data.qualifications = JSON.parse(data.qualifications);
      if (typeof data.clinicHospitalAffiliations === 'string') data.clinicHospitalAffiliations = JSON.parse(data.clinicHospitalAffiliations);
      if (typeof data.qualificationCertificatesUrls === 'string') data.qualificationCertificatesUrls = JSON.parse(data.qualificationCertificatesUrls);
    } catch (parseErr) {
      // ignore parse errors and keep original strings
      console.warn('Failed to parse some JSON fields:', parseErr.message);
    }

    const verification = new DoctorVerification({
      doctorId: doctor._id,
      ...data,
    });
    await verification.save();

    doctor.verificationDetails = verification._id;
    doctor.registrationStatus = "verified"; // in production consider 'under_review'
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
    res.status(500).json({ message: err.message || "Verification failed" });
  }
};

module.exports = { verifyDoctor };