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
    'Anesthesiology',
    'Cardiology',
    'Dermatology',
    'Dentistry',
    'Emergency Medicine',
    'Endocrinology',
    'Family Medicine',
    'Gastroenterology',
    'General Surgery',
    'Geriatrics',
    'Gynecology',
    'Hematology',
    'Infectious Disease',
    'Internal Medicine',
    'Laboratory',
    'Nephrology',
    'Neurology',
    'Neurosurgery',
    'Obstetrics',
    'Oncology',
    'Ophthalmology',
    'Orthopedics',
    'Otolaryngology (ENT)',
    'Pathology',
    'Pediatrics',
    'Physical Medicine & Rehabilitation',
    'Plastic Surgery',
    'Psychiatry',
    'Pulmonology',
    'Radiology',
    'Rheumatology',
    'Sports Medicine',
    'Thoracic Surgery',
    'Urology',
    'Vaccination',
    'Vascular Surgery',
    'General',
    'Other'
  ],
  default: 'General'
},
  consultationFee: { type: Number, required: true },
  about: String,
  earnings: { type: Number, default: 0 },
  patientsConsulted: { type: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Patient" }
  ], default: [] },


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


  // Government IDs
  aadhaarNumber: { 
    type: String, 
    unique: true, 
    sparse: true,
    validate: {
      validator: function(v) {
        return v === undefined || v === null || v === '' || /^\d{12}$/.test(v);
      },
      message: props => `${props.value} is not a valid Aadhaar number! Must be 12 digits.`
    }
  },
  panNumber: { 
    type: String, 
    unique: true, 
    sparse: true,
    validate: {
      validator: function(v) {
        return v === undefined || v === null || v === '' || /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(v);
      },
      message: props => `${props.value} is not a valid PAN number! Format should be ABCDE1234F`
    }
  },

  // Files (store paths/filenames after multer/cloud upload)
  profileImage: { type: String, required: true },
  identityDocument: { type: String, required: true },
  medicalCouncilCertificate: { type: String, required: true },

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

  verified: {type: Boolean, default: false},
}, {
  timestamps: true
});

module.exports = mongoose.model("DoctorVerification", DoctorVerificationSchema);