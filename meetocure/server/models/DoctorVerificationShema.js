const mongoose = require("mongoose");

const urlImageRegex = /\.(jpg|jpeg|png|gif)$/i;
const urlValidator = {
  validator: (v) => typeof v === "string" && urlImageRegex.test(v),
  message: (props) => `${props.path} must be a URL pointing to an image (jpg|jpeg|png|gif)`,
};

const DoctorVerificationSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  fullName: String,
  gender: String,
  dateOfBirth: String,
  medicalCouncilRegistrationNumber: { type: String, required: true, unique: true },
  medicalCouncilName: String,
  yearOfRegistration: String,
  primarySpecialization: String,
  additionalSpecializations: String,
  category: {
    type: String,
    enum: [
      'Cardiology',
      'Dentistry',
      'Pulmonology',
      'Neurology',
      'Gastroenterology',
      'Laboratory',
      'Vaccination',
      'General',
      'Other'
    ],
    default: 'General'
  },
  qualifications: [{
    degree: String,
    universityCollege: String,
    year: String,
  }],
  experienceYears: String,
  location: {
    city: String,
    state: String
  },
  clinicHospitalAffiliations: {
    name: String,
    city: String,
    state: String,
    joinDate: String,
    designation: String
  },
  aadhaarNumber: { type: String, unique: true, sparse: true },
  panNumber: { type: String, unique: true, sparse: true },

  // Aadhaar image (identity document) — required and must be image URL
  identityDocumentUrl: {
    type: String,
    required: true,
    validate: urlValidator
  },

  // Medical council certificate image URL (required)
  medicalCouncilCertificateUrl: {
    type: String,
    required: true,
    validate: urlValidator
  },

  // Qualification certificates must be image URLs
  qualificationCertificatesUrls: {
    type: [String],
    required: true,
    validate: {
      validator: function(arr) {
        if (!Array.isArray(arr) || arr.length === 0) return false;
        return arr.every(v => urlImageRegex.test(v));
      },
      message: 'qualificationCertificatesUrls must be an array of image URLs (jpg|jpeg|png|gif)'
    }
  },

  // Digital signature certificate should be an image URL now (required)
  digitalSignatureCertificateUrl: {
    type: String,
    required: true,
    validate: urlValidator
  },

  profileImage: {
    type: String,
    required: true,
    validate: urlValidator
  },
  verified: { type: Boolean, default: false }
});

module.exports = mongoose.model("DoctorVerification", DoctorVerificationSchema);