// controllers/DoctorVerificationForm.js
const Doctor = require("../models/DoctorShema");
const DoctorVerification = require("../models/DoctorVerificationShema");
const jwt = require("jsonwebtoken");
const cloudinary = require('../utils/cloudinary');

// helper to upload a buffer to Cloudinary
const uploadBufferToCloudinary = (buffer, folder, filename) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, public_id: filename, resource_type: 'image' },
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

      // identityDocument (Aadhaar image) -> identityDocumentUrl
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

      // digitalSignatureCertificate -> digitalSignatureCertificateUrl
      if (req.files.digitalSignatureCertificate && req.files.digitalSignatureCertificate[0]) {
        const file = req.files.digitalSignatureCertificate[0];
        const url = await uploadBufferToCloudinary(file.buffer, 'doctor_verifications', `dsig_${doctorId}`);
        data.digitalSignatureCertificateUrl = url;
      }
    }

    // Parse JSON fields that might be sent as strings (e.g., arrays or objects)
    try {
      if (typeof data.qualifications === 'string') data.qualifications = JSON.parse(data.qualifications);
      if (typeof data.clinicHospitalAffiliations === 'string') data.clinicHospitalAffiliations = JSON.parse(data.clinicHospitalAffiliations);
      if (typeof data.qualificationCertificatesUrls === 'string') data.qualificationCertificatesUrls = JSON.parse(data.qualificationCertificatesUrls);
      if (typeof data.location === 'string') data.location = JSON.parse(data.location);
    } catch (parseErr) {
      console.warn('Failed to parse some JSON fields:', parseErr.message);
    }

    // Server-side required field checks (ensure required image URLs present)
    if (!data.profileImage) return res.status(400).json({ message: "Profile image is required" });
    if (!data.identityDocumentUrl) return res.status(400).json({ message: "Aadhaar image (identityDocument) is required" });
    if (!data.medicalCouncilCertificateUrl) return res.status(400).json({ message: "Medical council certificate image is required" });
    if (!data.digitalSignatureCertificateUrl) return res.status(400).json({ message: "Digital signature certificate image is required" });
    if (!Array.isArray(data.qualificationCertificatesUrls) || data.qualificationCertificatesUrls.length === 0) {
      return res.status(400).json({ message: "At least one qualification certificate image is required" });
    }
    if (!data.medicalCouncilRegistrationNumber) {
      return res.status(400).json({ message: "medicalCouncilRegistrationNumber is required" });
    }

    // Ensure medicalCouncilRegistrationNumber is unique across verifications (and optionally doctors)
    const existing = await DoctorVerification.findOne({ medicalCouncilRegistrationNumber: data.medicalCouncilRegistrationNumber });
    if (existing && existing.doctorId.toString() !== doctorId.toString()) {
      return res.status(400).json({ message: "This medical council registration number is already used" });
    }

    const verification = new DoctorVerification({
      doctorId: doctor._id,
      ...data,
    });
    await verification.save();

    doctor.verificationDetails = verification._id;
    // Consider 'under_review' if you have workflow — keeping 'verified' as before:
    doctor.registrationStatus = "verified";
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