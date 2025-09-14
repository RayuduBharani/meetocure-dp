const User = require("../models/User");
const Hospital = require("../models/Hospital");

const searchDoctors = async (req, res) => {
  try {
    const { specialization, minExperience, name } = req.query;

    const query = { role: "doctor" };

    if (specialization) query.specialization = specialization;
    if (name) query.name = { $regex: name, $options: "i" };
    if (minExperience) query.experience = { $gte: Number(minExperience) };

    const doctors = await User.find(query).select("-password");

    res.status(200).json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const searchHospitals = async (req, res) => {
  try {
    const { category, city } = req.query;

    const query = {};

    if (category) query.category = category;
    if (city) query["city"] = { $regex: city, $options: "i" };

    const hospitals = await Hospital.find(query);

    res.status(200).json(hospitals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { searchDoctors, searchHospitals };
