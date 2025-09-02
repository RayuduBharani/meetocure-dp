const jwt = require("jsonwebtoken");
const User = require("../models/User");
const doctor=require("../models/DoctorShema");
const DoctorVerificationShema = require("../models/DoctorVerificationShema");
const protect = (roles = []) => {
  console.log("Roles in protect middleware:", roles);
  if (typeof roles === "string") roles = [roles];
  
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token, authorization denied" });
      }
      const token = authHeader.split(" ")[1];
      console.log("Token from header:", token);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decoded);
      const user = await DoctorVerificationShema.findById({doctorId:decoded.doctorId});
      console.log(user);
      if (!user) return res.status(401).json({ message: "User not found" });

      req.user = user;

      if (roles.length && !roles.includes(user.role)) {
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
