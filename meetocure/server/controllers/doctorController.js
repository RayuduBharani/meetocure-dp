const User = require("../models/User");
const Appointment = require("../models/Appointment");
const DoctorVerification = require("../models/DoctorVerificationShema");

// ........... Get doctor dashboard statistics
const getDoctorStats = async (req, res) => {
  try {
    // Get doctor ID from the user object
    let doctorId;
    if (req.user.doctorId) {
      doctorId = req.user.doctorId;
    } else if (req.user._id) {
      doctorId = req.user._id;
    } else {
      return res.status(400).json({ message: "Doctor ID not found" });
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Get current month start and end dates
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    // Fetch statistics
    const [
      todayAppointments,
      pendingAppointments,
      monthlyAppointments,
      uniquePatients,
      completedAppointments
    ] = await Promise.all([
      // Today's appointments
      Appointment.countDocuments({ 
        doctor: doctorId, 
        date: today 
      }),
      
      // Pending appointments (today and future)
      Appointment.countDocuments({ 
        doctor: doctorId, 
        date: { $gte: today },
        status: { $in: ['Upcoming', 'Pending'] }
      }),
      
      // Monthly appointments
      Appointment.countDocuments({ 
        doctor: doctorId, 
        date: { $gte: monthStart, $lte: monthEnd }
      }),
      
      // Unique patients count
      Appointment.distinct('patient', { doctor: doctorId }),
      
      // Completed appointments this month
      Appointment.countDocuments({ 
        doctor: doctorId, 
        date: { $gte: monthStart, $lte: monthEnd },
        status: 'Completed'
      })
    ]);

    // Calculate earnings (assuming ₹500 per completed appointment)
    const earnings = completedAppointments * 500;

    const stats = {
      todayAppointments,
      pendingAppointments,
      monthlyAppointments,
      uniquePatients: uniquePatients.length,
      earnings,
      completedAppointments
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching doctor stats:", error);
    res.status(500).json({ message: error.message });
  }
};

// ...........
const getDoctorProfile = async (req, res) =>
{
    try
    {
        const targetDoctorId = req.user?.doctorId || req.user?.id;
        const doctor = await DoctorVerification.findOne({ doctorId: targetDoctorId });
        if (!doctor)
        {
            return res.status(404).json({ message: "Doctor not found" });
        }
        res.json(doctor);
    }
    catch (error)
    {
        res.status(500).json({ message: error.message });
    }
};

// ........... Update doctor profile
const updateDoctorProfile = async (req, res) => {
  try {
    const doctorId = req.user?.id || req.user?.doctorId;

    // First verify the doctor exists in User collection
    const userDoc = await DoctorVerification.findOne({ _id: doctorId });
    
    if (!userDoc) {
      console.log("No user found for this doctorId");
      return res.status(404).json({
        message: "Doctor not found in user records",
        doctorId: doctorId
      });
    }
    
    // Only allow editing of specific fields
    const updatePayload = {
      // Header/basic - editable
      fullName: req.body.fullName,
      primarySpecialization: req.body.primarySpecialization,
      category: req.body.category,
      experienceYears: req.body.experienceYears,

      // Personal information - editable
      gender: req.body.gender,
      dateOfBirth: req.body.dateOfBirth,
      
      // Lists - editable
      hospitalInfo: Array.isArray(req.body.hospitalInfo) ? req.body.hospitalInfo : [],
      bankingInfo: Array.isArray(req.body.bankingInfo) ? req.body.bankingInfo : [],
    };

    // Remove empty strings/nulls to avoid unique index and validation issues
    Object.keys(updatePayload).forEach((key) => {
      const value = updatePayload[key];
      const isEmptyString = typeof value === "string" && value.trim() === "";
      const isEmptyArray = Array.isArray(value) && value.length === 0;
      if (value === undefined || value === null || isEmptyString || isEmptyArray) {
        delete updatePayload[key];
      }
    });

    // Normalize primitives to expected types
    if (updatePayload.experienceYears !== undefined) {
      updatePayload.experienceYears = String(updatePayload.experienceYears);
    }
    if (updatePayload.yearOfRegistration !== undefined) {
      updatePayload.yearOfRegistration = String(updatePayload.yearOfRegistration);
    }

    // Sanitize list items: keep only fully filled entries
    if (Array.isArray(req.body.hospitalInfo)) {
      const cleanedHospital = req.body.hospitalInfo.filter((h) =>
        h && h.hospitalName && h.hospitalAddress && h.contactNumber
      );
      if (cleanedHospital.length) updatePayload.hospitalInfo = cleanedHospital;
      else delete updatePayload.hospitalInfo;
    }
    if (Array.isArray(req.body.bankingInfo)) {
      const cleanedBank = req.body.bankingInfo.filter((b) =>
        b && b.bankName && b.accountNumber && b.ifscCode && b.accountHolderName && b.bankBranch
      );
      if (cleanedBank.length) updatePayload.bankingInfo = cleanedBank;
      else delete updatePayload.bankingInfo;
    }
    // Guard category against invalid enum values
    const allowedCategories = [
      'Cardiology',
      'Dentistry',
      'Pulmonology',
      'Neurology',
      'Gastroenterology',
      'Laboratory',
      'Vaccination',
      'General',
      'Other'
    ];
    if (updatePayload.category && !allowedCategories.includes(updatePayload.category)) {
      delete updatePayload.category;
    }

    // Don't modify the isProfileComplete status during updates
    delete updatePayload.isProfileComplete;

    // Now update the DoctorVerification document    
    console.log("Updating doctorId:", doctorId);
    const existingDoctor = await DoctorVerification.findOne({_id: doctorId });
    // console.log("existingDoctor:", existingDoctor);
    
    if (!existingDoctor) {
      console.log("No doctor verification found for doctorId:", doctorId);
      // Let's check what documents exist in the collection
      const allDocs = await DoctorVerification.find({}).select('doctorId _id');
      
      return res.status(404).json({ 
        message: "Profile verification not found. Make sure you've completed the verification process first.",
        doctorId: doctorId,
        tip: "Please complete the doctor verification process before updating your profile."
      });
    }

    const updated = await DoctorVerification.updateOne(
      { _id: doctorId },
      { $set: updatePayload },
      { new: true, runValidators: true }
    );

    if (!updated) {
      console.log("Update failed for doctorId:", doctorId);
      return res.status(404).json({ message: "Failed to update profile" });
    }

    return res.json(updated);
  } catch (err) {
    if (err && err.name === 'ValidationError') {
      const details = Object.values(err.errors || {}).map(e => e.message);
      return res.status(400).json({ message: 'Validation failed', details });
    }
    // Handle duplicate key errors for unique fields
    if (err && err.code === 11000) {
      const keys = Object.keys(err.keyPattern || {});
      return res.status(409).json({ message: `Duplicate value for: ${keys.join(', ')}` });
    }
    console.error("Error updating doctor profile:", err);
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};


const getFilteredDoctors = async (req, res) =>
{
    try
    {
        const { specialization, minExperience } = req.query;

        const query = {
            role: "doctor",
            isProfileComplete: true,
        };

        if (specialization)
        {
            query.specialization = { $regex: specialization, $options: "i" };
        }

        if (minExperience)
        {
            const minExp = parseInt(minExperience, 10);
            if (!Number.isNaN(minExp)) {
                query.experience = { $gte: minExp };
            }
        }

        const doctors = await User.find(query).select("-password");
        res.status(200).json(doctors);
    }

    catch(err)
    {
        res.status(500).json({ message: err.message});
    }
};

module.exports = {
  getDoctorProfile,
  updateDoctorProfile,
  getFilteredDoctors,
  getDoctorStats,
};