const Appointment = require("../models/Appointment");
const User = require("../models/User");
const Slot = require("../models/Slot");
const { createNotification } = require("./notificationController");
const DoctorVerificationShema = require("../models/DoctorVerificationShema");
//Book an appointment main
// const bookAppointment = async (req, res) => {
//   console.log("bookAppointment called with user:");
//   try {
//     const { doctorId, date, time, reason, patientInfo: incomingPatientInfo } = req.body;
//     console.log("Incoming appointment data:", req.body);
//     // Validate doctor slot availability
//     // const slot = await Slot.findOne({ doctor: doctorId, date });
//     // if (!slot || !slot.availableSlots.includes(time)) {
//     //   return res.status(400).json({ message: "Selected slot not available" });
//     // }

//     // Fetch patient from DB to get DOB (to calculate age)
//     const patientDoc = await DoctorVerificationShema.findById(req.user.id).select("name gender dob phone");
//     if (!patientDoc) {
//       return res.status(404).json({ message: "Patient not found" });
//     }

//     // Calculate age
//     const age = Math.floor(
//       (Date.now() - new Date(patientDoc.dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
//     );

//     // Normalize gender to lowercase (to match enum)
//     const genderNormalized = patientDoc.gender.toLowerCase();

//     // Build patientInfo for Appointment, using incoming mobile if provided or from DB
//     const patientInfo = {
//       name: patientDoc.name,
//       gender: genderNormalized,
//       age,
//       phone: patientDoc.phone || (incomingPatientInfo && incomingPatientInfo.phone), // fallback to request data if phone missing in DB
//       note: incomingPatientInfo?.note || "", // optionally take note from request
//     };

//     if (!patientInfo.phone) {
//       return res.status(400).json({ message: "Patient phone number is required" });
//     }

//     // Create new appointment
//     const appointment = new Appointment({
//       patient: req.user.id,
//       doctor: doctorId,
//       date,
//       time,
//       reason,
//       status: "Upcoming",
//       patientInfo,
//     });

//     await appointment.save();

//     // Remove booked slot from availableSlots and save
//     slot.availableSlots = slot.availableSlots.filter((t) => t !== time);
//     await slot.save();

//     // Create notifications for patient and doctor
//     try {
//       await createNotification({
//         user: req.user.id,
//         title: "Appointment Booked",
//         message: `Your appointment on ${date} at ${time} is confirmed`,
//         type: "success",
//         targetPath: "/patient/calendar", // frontend route for 'Your Appointments'
//         metadata: { appointmentId: appointment._id, role: "patient" },
//       });
//       if (doctorId) {
//         await createNotification({
//           user: doctorId,
//           title: "New Appointment",
//           message: `${patientInfo.name} booked an appointment on ${date} at ${time}`,
//           type: "info",
//           targetPath: "/doctor/appointments",
//           metadata: { appointmentId: appointment._id, role: "doctor" },
//         });
//       }
//     } catch (e) {
//       console.warn("Failed to create notifications:", e?.message);
//     }

//     res.status(201).json({ message: "Appointment booked successfully", appointment });
//   } catch (err) {
//     console.error("bookAppointment error:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

//testing 
const bookAppointment = async (req, res) => {
  try {
    console.log("Incoming Body:", req.body);

    const {
      patient,       // ObjectId of patient
      doctor,        // ObjectId of doctor
      patientInfo,   // { name, gender, age, phone, note }
      date,
      time,
      reason,
    } = req.body;

    // ✅ Validation for required fields
    if (!patient || !patientInfo || !date || !time) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields (patient, patientInfo, date, time)",
      });
    }

    if (!patientInfo.name || !patientInfo.gender || !patientInfo.age || !patientInfo.phone) {
      return res.status(400).json({
        success: false,
        message: "Patient info is incomplete",
      });
    }

    // ✅ Create new appointment
    const appointment = new Appointment({
      patient,
      doctor: doctor || null, // doctor is optional
      patientInfo,
      date,
      time,
      reason: reason || "",
    });

    // ✅ Save to DB
    await appointment.save();

    console.log("Appointment booked:", appointment);
    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      data: appointment,
    });
  } catch (error) {
    console.error("Error booking appointment:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};




// Doctor views all appointment requests
const getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.user.id; // Use authenticated doctor's ID
    const appointments = await Appointment.find({ doctor: doctorId })
      .populate("patient", "name gender dob phone")
      .sort({ date: 1 });

    res.json(appointments); // No need to wrap in { appointments } unless you're consistent
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Doctor updates appointment status
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.status = status;
    await appointment.save();

    res.json({ message: "Status updated", appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
 
// Patient views their appointments
const getPatientAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user.id })
      .populate("doctor", "name specialization")
      .sort({ date: -1 });

    res.status(200).json({ appointments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  bookAppointment,
  getDoctorAppointments,
  updateAppointmentStatus,
  getPatientAppointments,
};
