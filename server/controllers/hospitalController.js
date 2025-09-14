// Add doctors to a hospital login document
const addDoctorsToHospitalLogin = async (req, res) => {
  try {
    const { doctorIds } = req.body; // array of doctor ObjectIds
    if (!Array.isArray(doctorIds) || doctorIds.length === 0) {
      return res.status(400).json({ message: "doctorIds must be a non-empty array" });
    }
    const hospital = await HospitalLogin.findById(req.params.id);
    if (!hospital) return res.status(404).json({ message: "Hospital not found" });
    hospital.docters = doctorIds;
    await hospital.save();
    res.json({ message: "Doctors linked to hospital", docters: hospital.docters });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Get doctors for a hospital login by hospital id
const getDoctorsForHospitalLogin = async (req, res) => {
  try {
    const hospital = await HospitalLogin.findById(req.params.id).populate({ path: "docters", model: "Doctor" });
    if (!hospital) return res.status(404).json({ message: "Hospital not found" });
    res.json(hospital.docters);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const HospitalLogin = require("../models/HospitalLogin");

// Get all hospitals from HospitalLogin collection
const getAllHospitalLogins = async (req, res) => {
  try {
    const hospitals = await HospitalLogin.find();
    res.json(hospitals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const Hospital = require("../models/Hospital");

const createHospital = async (req, res) => {
  try {

    const {
      name,
      location,
      distance,
      timeFromDevice,
      category,
      rating,
      reviews,
      address,
      contactNumber,
    } = req.body;

    const hospital = new Hospital({
      name,
      city: location?.city || "",
      location,
      distance,
      timeFromDevice,
      category,
      rating,
      reviews,
      address,
      contactNumber,
      doctors: [req.user.id], // The logged-in doctor is added
    });

    await hospital.save();
    res.status(201).json({ message: "Hospital added Successfully in DB", hospital });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find().populate("doctors", "name specialization");
    res.json(hospitals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getHospitalById = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id).populate("doctors", "name email specialization experience");
    if (!hospital) return res.status(404).json({ message: "Hospital not found in DB" });
    res.json(hospital);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const filterHospitals = async (req, res) => {
  try {
    const
      {
        city,
        department
      } = req.query;

    const query = {};
    // Hospital schema stores city as top-level `city`
    if (city) query["city"] = new RegExp(city, "i");
    if (department) query["departments"] = department;

    const hospitals = await Hospital.find(query).populate("doctors", "name specialization");

    res.status(200).json(hospitals);
  }

  catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getNearbyHospitals = async (req, res) => {
  try {
    const { lat, lng, maxDistance = 5000 } = req.query;

    if (!lat || !lng)
      return res.status(400).json({ message: "lat & lng required" });

    const hospitals = await Hospital.find({
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(maxDistance), // meters
        }
      }
    });

    res.status(200).json(hospitals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createHospital,
  getAllHospitals,
  getHospitalById,
  filterHospitals,
  getNearbyHospitals,
  getAllHospitalLogins,
  getDoctorsForHospitalLogin,
  addDoctorsToHospitalLogin,
};
