const User = require("../models/User");
const Hospital = require("../models/Hospital");

const searchAll = async (req, res) => {
  try {
    const { keyword, category, location, minExperience } = req.query;

    // Construct Doctor Query
    const doctorQuery = { role: "doctor" };

    if (keyword) {
      doctorQuery.$or = [
        { name: { $regex: keyword, $options: "i" } },
        { specialization: { $regex: keyword, $options: "i" } },
      ];
    }

    if (minExperience && !isNaN(minExperience)) {
      doctorQuery.experience = { $gte: parseInt(minExperience) };
    }

    // Construct Hospital Query
    const hospitalQuery = {};

    if (keyword) {
      hospitalQuery.name = { $regex: keyword, $options: "i" };
    }

    if (category) {
      hospitalQuery.category = category;
    }

    if (location) {
      // Hospital schema stores city as top-level `city`
      hospitalQuery["city"] = { $regex: location, $options: "i" };
    }

    // Execute both queries in parallel
    const [doctors, hospitals] = await Promise.all([
      User.find(doctorQuery).select("-password"),
      Hospital.find(hospitalQuery),
    ]);

    res.status(200).json({ doctors, hospitals });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Search failed" });
  }
};

module.exports = { searchAll };
