const Appointment = require("../models/Appointment");
const User = require("../models/User");
const Slot = require("../models/Slot");
const { createNotification } = require("./notificationController");
const DoctorVerificationShema = require("../models/DoctorVerificationShema");
const { uploadBufferToCloudinary } = require("../utils/cloudinary");

// Book appointment
const bookAppointment = async (req, res) => {
  try {
    let { patient, doctor, patientInfo, date, time, reason, payment } = req.body;

    // parse patientInfo when sent as JSON string (form-data)
    if (patientInfo && typeof patientInfo === "string") {
      try {
        patientInfo = JSON.parse(patientInfo);
      } catch (e) {
        console.warn("Failed to parse patientInfo JSON string:", e.message);
      }
    }

    // If individual fields were sent outside patientInfo (compat), merge them
    if (!patientInfo) patientInfo = {};
    if (req.body.blood_group) patientInfo.blood_group = req.body.blood_group;
    if (req.body.allergies && !Array.isArray(patientInfo.allergies)) {
      try {
        patientInfo.allergies = JSON.parse(req.body.allergies);
      } catch {
        patientInfo.allergies = req.body.allergies ? req.body.allergies.split(",").map(a => a.trim()).filter(Boolean) : [];
      }
    }
    if (req.body.medical_history_summary && !patientInfo.medical_history_summary) {
      patientInfo.medical_history_summary = req.body.medical_history_summary;
    }

    if (!patient || !doctor || !date || !time || !patientInfo || !patientInfo.name) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // normalize date to day range to avoid timezone mismatches
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    // Check for existing booking for the same doctor, same date and same time (excluding cancelled)
    const existing = await Appointment.findOne({
      doctor,
      appointment_date: { $gte: dayStart, $lt: dayEnd },
      appointment_time: time,
      status: { $ne: "cancelled" },
    });

    if (existing) {
      // If the existing booking belongs to the same patient allow (optional), otherwise block
      if (existing.patient.toString() !== patient.toString()) {
        return res.status(409).json({
          success: false,
          message: "Selected time is already booked for this doctor. Please choose a different slot.",
          existingAppointmentId: existing._id,
        });
      }
      // if same patient rebooking same slot, allow to continue (or return conflict based on policy)
    }

    // parse medicalRecordsMeta if provided
    let metas = [];
    if (req.body.medicalRecordsMeta) {
      try {
        metas = JSON.parse(req.body.medicalRecordsMeta);
      } catch (e) {
        console.warn("Failed to parse medicalRecordsMeta:", e.message);
      }
    }

    // Handle file uploads
    let medicalRecords = [];
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const filename = `record_${patient}_${Date.now()}_${file.originalname.replace(/\s+/g, "_")}`;
        const file_url = await uploadBufferToCloudinary(file.buffer, "medical_records", filename);

        // pick meta by index or originalname fallback
        const meta = metas[i] || metas.find(m => m.originalname === file.originalname) || {};
        medicalRecords.push({
          record_type: meta.record_type || "other",
          file_url,
          description: meta.description || file.originalname,
        });
      }
    }

    const appointmentDate = new Date(date);

    const appointment = new Appointment({
      patient,
      doctor,
      patientInfo,
      appointment_date: appointmentDate,
      appointment_time: time,
      reason: reason || req.body.reason || "",
      medicalRecords,
      payment: payment || {
        amount: 0,
        currency: "USD",
        status: "pending",
      },
    });

    await appointment.save();

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      data: appointment,
    });
  } catch (error) {
     if (error.code === 11000) {
    // Duplicate appointment
    return res.status(400).json({
      success: false,
      message: `This time slot (${req.body.time}) is already booked. Please choose another.`,
    });
  }
  return res.status(500).json({
    success: false,
    message: "Something went wrong. Please try again later.",
  });
  }
};

// Doctor views all appointment requests
const getDoctorAppointments = async (req, res) => {
  try {
    // Resolve doctorId from token/user
    let doctorId = req.user?.doctorId || req.user?._id || req.user?.id;
    // console.log(doctorId.toString());
    if (!doctorId) return res.status(400).json({ message: "Doctor ID not found" });

    // Fetch appointments for this doctor
    const appointments = await Appointment.find({ doctor: doctorId.toString() })
      .populate("patient", "name")
      .sort({ appointment_date: 1, appointment_time: 1 });
    
      // console.log(appointments);

    // Map to shape required by frontend with full patient info
    const minimal = appointments.map((a) => ({
      _id: a._id,
      time: a.appointment_time,
      status: a.status,
      name: a.patient?.name || (a.patientInfo && a.patientInfo.name) || "—",
      reason: a.reason || a.patientInfo?.reason || "",
      date: a.appointment_date, // keep date if frontend needs it for calendar
      patientInfo: a.patientInfo || {}, // Include full patient info
      patient: a.patient || {} // Include patient data for fallback
    }));
    // console.log(minimal);

    return res.json({ appointments: minimal });
  } catch (err) {
    console.error("Error fetching doctor appointments:", err);
    return res.status(500).json({ message: err.message });
  }
};

// Patient views their appointments
const getPatientAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user.id })
   .populate({
    path: "doctor", // Appointment → Doctor
    select: "verificationDetails fullName", 
    populate: {
      path: "verificationDetails", 
      select: "fullName" 
    }
  })
  console.log(appointments);
    // Map to minimal shape required by frontend
    const minimal = appointments.map((a) => ({
      _id: a._id,
      time: a.appointment_time,
      status: a.status,
      doctorName: a.doctor?.verificationDetails?.fullName || a.doctor?.fullName || "—",
      name: a.doctor?.name || (a.patientInfo && a.patientInfo.name) || "—",
      reason: a.reason || a.patientInfo?.reason || "",
      date: a.appointment_date, // keep date if frontend needs it for calendar
    }));

    return res.status(200).json({ appointments: minimal });
  } catch (err) {
    console.error("Error fetching patient appointments:", err);
    return res.status(500).json({ message: err.message });
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

// Cancel appointment (specific function for cancellation)
const cancelAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    
    // Get doctor ID using the same logic as getDoctorAppointments
    let doctorId;
    if (req.user.doctorId) {
      doctorId = req.user.doctorId;
    } else if (req.user._id) {
      doctorId = req.user._id;
    } else {
      return res.status(400).json({ 
        success: false, 
        message: "Doctor ID not found" 
      });
    }

    console.log('Cancel appointment request:', {
      appointmentId,
      doctorId,
      userObject: req.user,
      userRole: req.user.role
    });

    // Find the appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: "Appointment not found" 
      });
    }
    // Check if the doctor is authorized to cancel this appointment
    // Handle both ObjectId and string comparisons
    const appointmentDoctorId = appointment.doctor.toString();
    const currentDoctorId = doctorId.toString();
    
    console.log('Authorization check:', {
      appointmentDoctorId,
      currentDoctorId,
      match: appointmentDoctorId === currentDoctorId,
      appointmentDoctorType: typeof appointment.doctor,
      doctorIdType: typeof doctorId
    });
    
    if (appointmentDoctorId !== currentDoctorId) {
      console.log('Authorization failed:', {
        appointmentDoctorId,
        currentDoctorId,
        match: appointmentDoctorId === currentDoctorId
      });
      
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized to cancel this appointment" 
      });
    }

    // Check if appointment can be cancelled (not already completed)
    if (appointment.status === "completed") {
      return res.status(400).json({ 
        success: false, 
        message: "Cannot cancel a completed appointment" 
      });
    }

    if (appointment.status === "cancelled") {
      return res.status(400).json({ 
        success: false, 
        message: "Appointment is already cancelled" 
      });
    }

    // Update appointment status to cancelled
    appointment.status = "cancelled";
    await appointment.save();

    // Create notification for patient about cancellation
    try {
      await createNotification({
        user: appointment.patient,
        title: "Appointment Cancelled",
        message: `Your appointment on ${appointment.date} at ${appointment.time} has been cancelled by the doctor`,
        type: "warning",
        targetPath: "/patient/calendar",
        metadata: { appointmentId: appointment._id, role: "patient" },
      });
    } catch (notificationError) {
      console.warn("Failed to create cancellation notification:", notificationError?.message);
    }

    res.json({ 
      success: true, 
      message: "Appointment cancelled successfully", 
      appointment 
    });
  } catch (err) {
    console.error("Error cancelling appointment:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};
 
module.exports = {
  bookAppointment,
  getDoctorAppointments,
  updateAppointmentStatus,
  cancelAppointment,
  getPatientAppointments,
  
};
