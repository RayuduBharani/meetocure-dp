// controllers/DoctorVerificationForm.js
const Doctor = require("../models/DoctorShema");
const DoctorVerification = require("../models/DoctorVerificationShema");
const jwt = require("jsonwebtoken");
const { cloudinary, uploadBufferToCloudinary: cloudinaryUpload } = require('../utils/cloudinary');

// helper to upload a buffer to Cloudinary
const uploadBufferToCloudinary = async (buffer, folder, filename) => {
  try {
    // Check if cloudinary is properly configured
    if (!cloudinary.config().cloud_name || !cloudinary.config().api_key || !cloudinary.config().api_secret) {
      console.error('Cloudinary configuration missing:', {
        cloud_name: !!cloudinary.config().cloud_name,
        api_key: !!cloudinary.config().api_key,
        api_secret: !!cloudinary.config().api_secret
      });
      throw new Error('Cloudinary configuration is incomplete');
    }

    return new Promise((resolve, reject) => {
      const uploadOptions = { 
        folder, 
        public_id: filename, 
        resource_type: 'image'
      };
           
      const stream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return reject(error);
          }
          resolve(result.secure_url);
        }
      );
      
      stream.end(buffer);
    });
  } catch (error) {
    console.error('Error in uploadBufferToCloudinary:', error);
    throw error;
  }
};

const verifyDoctor = async (req, res) => {
  try {
    const { doctorId } = req.query; // from frontend query param
    if (!doctorId) {
      return res.status(400).json({ message: "Doctor ID is required" });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Build data from body
    const data = { ...req.body };
    
    // Clean up empty strings for unique fields
    if (data.panNumber === '') {
      delete data.panNumber;
    }
    if (data.aadhaarNumber === '') {
      delete data.aadhaarNumber;
    }
    
    // Extract hospital and banking information
    const hospitalInfo = {};
    const bankingInfo = {};
    
    // Extract hospital data (prefixed with hospital_)
    Object.keys(req.body).forEach(key => {
      if (key.startsWith('hospital_')) {
        const fieldName = key.replace('hospital_', '');
        hospitalInfo[fieldName] = req.body[key];
      }
    });
    
    // Extract banking data (prefixed with bank_)
    Object.keys(req.body).forEach(key => {
      if (key.startsWith('bank_')) {
        const fieldName = key.replace('bank_', '');
        bankingInfo[fieldName] = req.body[key];
      }
    });
    try {
      if (typeof data.qualifications === 'string') data.qualifications = JSON.parse(data.qualifications);
      if (typeof data.qualificationCertificates === 'string') data.qualificationCertificates = JSON.parse(data.qualificationCertificates);
      if (typeof data.location === 'string') data.location = JSON.parse(data.location);
    } catch (parseErr) {
      console.warn('Failed to parse some JSON fields:', parseErr.message);
    }

    // If files were uploaded, upload them to Cloudinary and set URLs
    if (req.files) {
      try {

        // profileImage
        if (req.files.profileImage && req.files.profileImage[0]) {
          const file = req.files.profileImage[0];
          const url = await cloudinaryUpload(file.buffer, 'doctor_verifications', `profile_${doctorId}`);
          data.profileImage = url;
        }

        // identityDocument (Aadhaar image)
        if (req.files.identityDocument && req.files.identityDocument[0]) {
          const file = req.files.identityDocument[0];
          console.log('Uploading identity document:', { size: file.size, mimetype: file.mimetype });
          const url = await cloudinaryUpload(file.buffer, 'doctor_verifications', `identity_${doctorId}`);
          data.identityDocument = url;
        }

        // medicalCouncilCertificate
        if (req.files.medicalCouncilCertificate && req.files.medicalCouncilCertificate[0]) {
          const file = req.files.medicalCouncilCertificate[0];
          const url = await cloudinaryUpload(file.buffer, 'doctor_verifications', `council_${doctorId}`);
          data.medicalCouncilCertificate = url;
        }

        // qualificationCertificates (multiple)
        if (req.files.qualificationCertificates && req.files.qualificationCertificates.length) {
          const certUrls = [];
          for (const [idx, file] of req.files.qualificationCertificates.entries()) {
            const url = await cloudinaryUpload(file.buffer, 'doctor_verifications', `qual_${doctorId}_${idx}`);
            certUrls.push(url);
          }
          data.qualificationCertificates = certUrls;
        }

      } catch (uploadError) {
        return res.status(500).json({ 
          message: 'Failed to upload files',
          error: uploadError.message
        });
      }
    }

    // Clean up any array fields that might have been sent incorrectly
    const fileFields = ['profileImage', 'identityDocument', 'medicalCouncilCertificate'];
    fileFields.forEach(field => {
      if (Array.isArray(data[field])) {
        data[field] = ''; // Clear the field, it will be set by file upload
      }
    });

    // Server-side required field checks (ensure required image URLs present)
    if (!data.profileImage) return res.status(400).json({ message: "Profile image is required" });
    if (!data.identityDocument) return res.status(400).json({ message: "Aadhaar image (identityDocument) is required" });
    if (!data.medicalCouncilCertificate) return res.status(400).json({ message: "Medical council certificate image is required" });
    if (!Array.isArray(data.qualificationCertificates) || data.qualificationCertificates.length === 0) {
      return res.status(400).json({ message: "At least one qualification certificate image is required" });
    }
    // Generate a default medical council registration number if not provided
    if (!data.medicalCouncilRegistrationNumber) {
      // Generate a unique registration number based on doctor ID and timestamp
      const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
      const doctorIdShort = doctor._id.toString().slice(-4); // Last 4 characters of doctor ID
      data.medicalCouncilRegistrationNumber = `MCR${doctorIdShort}${timestamp}`;
    }
    if (data.medicalCouncilRegistrationNumber) {
      const existing = await DoctorVerification.findOne({ 
        medicalCouncilRegistrationNumber: data.medicalCouncilRegistrationNumber 
      });
      
      
      if (existing) {
        // Use the doctor ID from the database (more reliable)
        const actualDoctorId = doctor._id.toString();
        const existingDoctorId = existing.doctorId?.toString();
        
        // Allow the same doctor to update their verification
        if (existingDoctorId && existingDoctorId !== actualDoctorId) {
          
          // Check if the existing verification belongs to a doctor that no longer exists
          const existingDoctor = await Doctor.findById(existingDoctorId);
          if (!existingDoctor) {
            console.log("Existing doctor not found - allowing update");
            // Delete the orphaned verification
            await DoctorVerification.findByIdAndDelete(existing._id);
          } else {
            console.log("Different active doctor - blocking");
            return res.status(400).json({ 
              message: "This medical council registration number is already used by another doctor" 
            });
          }
        } else {
          console.log("Same doctor updating verification - allowed");
        }
      } else {
        console.log("No existing verification found - creating new one");
      }
    } else {
      console.log("No medicalCouncilRegistrationNumber provided");
    }

    // Check if verification already exists for this doctor
    const existingVerification = await DoctorVerification.findOne({ doctorId: doctor._id });
    
    // Only include hospital and banking info if they have data
    const verificationData = {
      doctorId: doctor._id,
      ...data
    };

    // Only add hospitalInfo if it has data
    if (Object.keys(hospitalInfo).length > 0) {
      verificationData.hospitalInfo = [hospitalInfo];
    }

    // Only add bankingInfo if it has data
    if (Object.keys(bankingInfo).length > 0) {
      verificationData.bankingInfo = [bankingInfo];
    }

    console.log("Final verification data:", verificationData);

    let verification;
    if (existingVerification) {
      // Update existing verification
      verification = await DoctorVerification.findByIdAndUpdate(
        existingVerification._id,
        verificationData,
        { new: true, runValidators: true }
      );
    } else {
      // Create new verification
      verification = new DoctorVerification(verificationData);
      await verification.save();
    }

    // Update doctor with verification details
    doctor.verificationDetails = verification._id;
    
    // Only update hospital and banking info if they have data
    if (Object.keys(hospitalInfo).length > 0) {
      doctor.hospitalInfo = hospitalInfo;
    }
    if (Object.keys(bankingInfo).length > 0) {
      doctor.bankingInfo = bankingInfo;
    }
    
    // Keep registration status under review until manual approval
    doctor.registrationStatus = "under review by hospital";
    await doctor.save();

    return res.json({
      success: true,
      message: "Verification submitted successfully. Awaiting approval.",
      doctor: {
        _id: doctor._id,
        email: doctor.email,
        registrationStatus: doctor.registrationStatus,
        verificationDetails: doctor.verificationDetails
      }
    });
  } catch (err) {
    console.error("Doctor Verification Error:", err);
    res.status(500).json({ message: err.message || "Verification failed" });
  }
};

const getVerificationStatus = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    if (!doctorId) {
      return res.status(400).json({ message: "Doctor ID is required" });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const verification = await DoctorVerification.findOne({ doctorId: doctorId });
    
    return res.json({
      success: true,
      doctor: {
        _id: doctor._id,
        email: doctor.email,
        registrationStatus: doctor.registrationStatus,
        verificationDetails: doctor.verificationDetails
      },
      verification: verification || null
    });
  } catch (err) {
    console.error("Get Verification Status Error:", err);
    res.status(500).json({ message: err.message || "Failed to get verification status" });
  }
};

const deleteVerification = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    if (!doctorId) {
      return res.status(400).json({ message: "Doctor ID is required" });
    }

    const verification = await DoctorVerification.findOneAndDelete({ doctorId: doctorId });
    
    if (!verification) {
      return res.status(404).json({ message: "No verification found for this doctor" });
    }

    // Update doctor status
    const doctor = await Doctor.findById(doctorId);
    if (doctor) {
      doctor.verificationDetails = undefined;
      doctor.registrationStatus = "under review by hospital";
      await doctor.save();
    }

    return res.json({
      success: true,
      message: "Verification deleted successfully"
    });
  } catch (err) {
    console.error("Delete Verification Error:", err);
    res.status(500).json({ message: err.message || "Failed to delete verification" });
  }
};

module.exports = { verifyDoctor, getVerificationStatus, deleteVerification };