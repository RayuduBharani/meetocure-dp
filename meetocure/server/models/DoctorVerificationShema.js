const mongoose = require("mongoose");

const DoctorVerificationSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  fullName: String,
  gender: String,
  dateOfBirth: String,
  medicalCouncilRegistrationNumber: String,
  medicalCouncilName: String,
  yearOfRegistration: String,
  primarySpecialization: String,
  additionalSpecializations: String,
  qualifications: [{
    degree: String,
    universityCollege: String,
    year: String,
  }],
  experienceYears: String,
  clinicHospitalAffiliations: [{
    name: String,
    city: String,
    state: String,
    startDate: String,
    endDate: String,
    designation: String,
  }],
  aadhaarNumber: String,
  panNumber: String,
  identityDocumentUrl: String,
  medicalCouncilCertificateUrl: String,
  qualificationCertificatesUrls: [String],
  digitalSignatureCertificateId: String,
  verified: { type: Boolean, default: false }
});

module.exports = mongoose.model("DoctorVerification", DoctorVerificationSchema);
