const mongoose = require("mongoose");

const urlImageRegex = /\.(jpg|jpeg|png|gif)$/i;
const urlValidator = {
  validator: (v) => typeof v === "string" && urlImageRegex.test(v),
  message: (props) => `${props.path} must be a URL pointing to an image (jpg|jpeg|png|gif)`,
};

const DoctorVerificationSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },

  // Doctor Info
  fullName: { type: String, required: true },
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

  // Education & Experience
  qualifications: [
    {
      degree: String,
      universityCollege: String,
      year: String,
    }
  ],
  qualificationCertificates: [String], // store file paths after upload
  experienceYears: String,

  // Location
  location: {
    city: String,
    state: String,
  },

  // Affiliations
  clinicHospitalAffiliations: [
    {
      name: String,
      city: String,
      state: String,
      joinDate: String,
      designation: String,
    }
  ],

  // Government IDs
  aadhaarNumber: { type: String, unique: true, sparse: true },
  panNumber: { type: String, unique: true, sparse: true },

  // Files (store paths/filenames after multer/cloud upload)
  profileImage: { type: String, required: true },
  identityDocument: { type: String, required: true },
  medicalCouncilCertificate: { type: String, required: true },
  digitalSignatureCertificate: { type: String, required: true },

  // Hospital Information
  hospitalInfo: [{
    hospitalName: { type: String, required: true },
    hospitalAddress: { type: String, required: true },
    contactNumber: { type: String, required: true },
  }],

  // Banking Information
  bankingInfo: [{
    bankName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    ifscCode: { type: String, required: true },
    accountHolderName: { type: String, required: true },
    bankBranch: { type: String, required: true },
  }],

  verified: { type: Boolean, default: false },
}, {
  timestamps: true
});

module.exports = mongoose.model("DoctorVerification", DoctorVerificationSchema);