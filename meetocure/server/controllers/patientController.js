const User = require("../models/User");

// GET patient profile
const getPatientProfile = async (req, res) => {
  try {
    const patient = await User.findById(req.user.id).select("-password");

    if (!patient || patient.role !== "patient") {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT update patient profile
const updatePatientProfile = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { name, phone, dob, gender, photo } = req.body;

    const updated = await User.findByIdAndUpdate(
      patientId,
      {
        name,
        phone,
        dob,
        gender,
        photo,
        isProfileComplete: !!(name && phone && dob && gender),
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json({
      message: "Profile updated",
      user: {
        _id: updated._id,
        name: updated.name,
        phone: updated.phone,
        dob: updated.dob,
        gender: updated.gender,
        photo: updated.photo,
        isProfileComplete: updated.isProfileComplete,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET filtered patients (example use case – optional, modify as per need)
const getFilteredPatients = async (req, res) => {
  try {
    const { name, gender } = req.query;

    const query = {
      role: "patient",
      isProfileComplete: true,
    };

    if (name) {
      query.name = { $regex: name, $options: "i" };
    }

    if (gender) {
      query.gender = gender;
    }

    const patients = await User.find(query).select("-password");
    res.status(200).json(patients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getPatientProfile,
  updatePatientProfile,
  getFilteredPatients,
};
