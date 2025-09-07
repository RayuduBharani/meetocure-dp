const jwt = require("jsonwebtoken");
const DoctorVerificationShema = require("../models/DoctorVerificationShema");
const Doctor = require("../models/DoctorShema");
const Patient = require("../models/Patient");

const protect = (roles = []) => {
  console.log("working");;
  if (typeof roles === "string") roles = [roles];
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token, authorization denied" });
      }
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      let user = null;
      let role = decoded.role;

      if (role === "doctor") {
        user = await DoctorVerificationShema.findOne({ doctorId: decoded.id });
        if (!user) {
          user = await Doctor.findById(decoded.id);
        }
        // Set the doctorId for easy access in controllers
        if (user) {
          user.doctorId = decoded.id;
        }
      } else if (role === "patient") {
        user = await Patient.findById(decoded.id);
      }

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      req.user = user;
      req.user.role = role;
      req.user.id = decoded.id; // Ensure req.user.id is set for consistency

      if (roles.length && !roles.includes(role)) {
        return res.status(403).json({ message: "Access forbidden: insufficient rights" });
      }

  
      next();
    } catch (error) {
      return res.status(401).json({ message: "Token is not valid or expired" });
    }
  };
};

module.exports = protect;




// const jwt = require('jsonwebtoken');
// const Doctor = require('../models/DoctorShema');
// const Patient = require('../models/Patient');
// const dotenv = require('dotenv');
// dotenv.config();

// const protect = async (req, res, next) => {
//   let token;
//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith('Bearer')
//   ) {
//     try {
//       token = req.headers.authorization.split(' ')[1];
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);

//       // Attach user info to request
//       req.user = decoded;
//       next();
//     } catch (error) {
//       return res.status(401).json({ message: 'Not authorized, token failed' });
//     }
//   } else {
//     return res.status(401).json({ message: 'Not authorized, no token' });
//   }
// };

// // Doctor-only middleware
// const doctorProtect = async (req, res, next) => {
//   await protect(req, res, async () => {
//     const doctor = await Doctor.findById(req.user.id);
//     if (!doctor) {
//       return res.status(403).json({ message: 'Access denied: Doctor only' });
//     }
//     req.doctor = doctor;
//     next();
//   });
// };

// // Patient-only middleware
// const patientProtect = async (req, res, next) => {
//   await protect(req, res, async () => {
//     const patient = await Patient.findById(req.user.id);
//     if (!patient) {
//       return res.status(403).json({ message: 'Access denied: Patient only' });
//     }
//     req.patient = patient;
//     next();
//   });
// };

// module.exports = { protect, doctorProtect, patientProtect };
