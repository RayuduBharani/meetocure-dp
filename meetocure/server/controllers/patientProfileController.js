const Patient = require("../models/Patient");
const PatientDetails = require("../models/PatientDetails");
const { uploadBufferToCloudinary } = require('../utils/cloudinary');
/**
 * GET /api/patient/profile/get
 */
exports.getProfile = async (req, res) => {
  try {
    const patientId = req.user?.id || req.patientId || req.patient?._id;
    const patient = await Patient.findById(patientId).lean();
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const details = await PatientDetails.findOne({ patient: patientId }).lean();

    return res.json({
      phone: patient.phone,
      name: details?.name || "",
      dob: details?.dob || "",
      gender: details?.gender || "",
      photo: details?.photo || "",
      detailsId: details?._id || null,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * PUT /api/patient/profile/add
 * Accepts multipart/form-data with optional file field "photo"
 * If req.file present it uploads to Cloudinary and uses secure_url.
 * If no file, accepts "photo" string in form-data body (URL or base64).
 */
exports.createOrUpdateProfile = async (req, res) => {
  try {
    const patientId = req.user?.id || req.patientId || req.patient?._id;
    const { name, phone, dob, gender } = req.body;

    const patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    // If provided phone in body, ensure it matches login phone
    if (phone && phone !== patient.phone) {
      return res.status(400).json({
        message:
          "Provided phone does not match the phone used for login. To change login phone update authentication phone first.",
      });
    }

    // Handle image upload if file uploaded
    let photoUrl;
    if (req.file && req.file.buffer) {
      try {
        // optional: use patientId + timestamp as filename to avoid collisions
        const filename = `patient_${patientId}_${Date.now()}`;
        photoUrl = await uploadBufferToCloudinary(req.file.buffer, "patient_profiles", filename);
      } catch (uploadErr) {
        console.error("Cloudinary upload error:", uploadErr);
        return res.status(500).json({ message: "Failed to upload image", error: uploadErr.message, stack: uploadErr.stack });
      }
    } else if (req.body.photo) {
      // Accept photo string (URL or dataURL) from form-data
      photoUrl = req.body.photo;
    }

    const payload = {
      ...(name ? { name } : {}),
      phone: patient.phone, // authoritative phone
      ...(dob ? { dob: new Date(dob) } : {}),
      ...(gender ? { gender } : {}),
      ...(photoUrl ? { photo: photoUrl } : {}),
    };

    try {
      const updated = await PatientDetails.findOneAndUpdate(
        { patient: patientId },
        { $set: payload, $setOnInsert: { patient: patientId } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      return res.json(updated);
    } catch (dbErr) {
      console.error("MongoDB update error:", dbErr);
      return res.status(500).json({ message: "Failed to update patient details", error: dbErr.message, stack: dbErr.stack });
    }
  } catch (err) {
    console.error("General error in createOrUpdateProfile:", err);
    return res.status(500).json({ message: "Server error", error: err.message, stack: err.stack });
  }
};



