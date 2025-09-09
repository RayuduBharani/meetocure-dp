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

    // Get doctor profile for consultation fee
    const doctorProfile = await DoctorVerification.findOne({ doctorId: doctorId });
    const consultationFee = doctorProfile?.consultationFee || 500;

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Get current month start and end dates
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    
    // Get last month dates for comparison
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];

    // Get current year start and end dates
    const yearStart = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
    const yearEnd = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];

    // Fetch comprehensive statistics
    const [
      todayAppointments,
      pendingAppointments,
      acceptedAppointments,
      monthlyAppointments,
      lastMonthAppointments,
      yearlyAppointments,
      uniquePatients,
      completedAppointments,
      cancelledAppointments,
      monthlyCompletedAppointments,
      lastMonthCompletedAppointments,
      yearlyCompletedAppointments,
      monthlyCancelledAppointments,
      lastMonthCancelledAppointments,
      yearlyCancelledAppointments,
      totalEarnings,
      monthlyEarnings,
      lastMonthEarnings,
      yearlyEarnings,
      todayEarnings,
      weeklyEarnings,
      appointmentTypes,
      monthlyAppointmentTrend,
      patientAgeGroups,
      genderDistribution
    ] = await Promise.all([
      // Today's appointments
      Appointment.countDocuments({ 
        doctor: doctorId, 
        appointment_date: { $gte: new Date(today), $lt: new Date(today + 'T23:59:59.999Z') }
      }),
      
      // Pending appointments (today and future)
      Appointment.countDocuments({ 
        doctor: doctorId, 
        appointment_date: { $gte: today },
        status: 'pending'
      }),
      
      // Accepted appointments (today and future)
      Appointment.countDocuments({ 
        doctor: doctorId, 
        appointment_date: { $gte: today },
        status: 'accepted'
      }),
      
      // Monthly appointments
      Appointment.countDocuments({ 
        doctor: doctorId, 
        appointment_date: { $gte: monthStart, $lte: monthEnd }
      }),
      
      // Last month appointments
      Appointment.countDocuments({ 
        doctor: doctorId, 
        appointment_date: { $gte: lastMonthStart, $lte: lastMonthEnd }
      }),
      
      // Yearly appointments
      Appointment.countDocuments({ 
        doctor: doctorId, 
        appointment_date: { $gte: yearStart, $lte: yearEnd }
      }),
      
      // Unique patients count
      Appointment.distinct('patient', { doctor: doctorId }),
      
      // Total completed appointments
      Appointment.countDocuments({ 
        doctor: doctorId, 
        status: 'completed'
      }),
      
      // Total cancelled appointments
      Appointment.countDocuments({ 
        doctor: doctorId, 
        status: 'cancelled'
      }),
      
      // Completed appointments this month
      Appointment.countDocuments({ 
        doctor: doctorId, 
        appointment_date: { $gte: monthStart, $lte: monthEnd },
        status: 'completed'
      }),
      
      // Completed appointments last month
      Appointment.countDocuments({ 
        doctor: doctorId, 
        appointment_date: { $gte: lastMonthStart, $lte: lastMonthEnd },
        status: 'completed'
      }),
      
      // Completed appointments this year
      Appointment.countDocuments({ 
        doctor: doctorId, 
        appointment_date: { $gte: yearStart, $lte: yearEnd },
        status: 'completed'
      }),
      
      // Cancelled appointments this month
      Appointment.countDocuments({ 
        doctor: doctorId, 
        appointment_date: { $gte: monthStart, $lte: monthEnd },
        status: 'cancelled'
      }),
      
      // Cancelled appointments last month
      Appointment.countDocuments({ 
        doctor: doctorId, 
        appointment_date: { $gte: lastMonthStart, $lte: lastMonthEnd },
        status: 'cancelled'
      }),
      
      // Cancelled appointments this year
      Appointment.countDocuments({ 
        doctor: doctorId, 
        appointment_date: { $gte: yearStart, $lte: yearEnd },
        status: 'cancelled'
      }),
      
      // Total earnings (all time)
      Appointment.aggregate([
        { $match: { doctor: doctorId, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$payment.amount' } } }
      ]),
      
      // Monthly earnings
      Appointment.aggregate([
        { $match: { doctor: doctorId, appointment_date: { $gte: new Date(monthStart), $lte: new Date(monthEnd) }, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$payment.amount' } } }
      ]),
      
      // Last month earnings
      Appointment.aggregate([
        { $match: { doctor: doctorId, appointment_date: { $gte: new Date(lastMonthStart), $lte: new Date(lastMonthEnd) }, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$payment.amount' } } }
      ]),
      
      // Yearly earnings
      Appointment.aggregate([
        { $match: { doctor: doctorId, appointment_date: { $gte: new Date(yearStart), $lte: new Date(yearEnd) }, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$payment.amount' } } }
      ]),
      
      // Today's earnings
      Appointment.aggregate([
        { $match: { doctor: doctorId, appointment_date: { $gte: new Date(today), $lt: new Date(today + 'T23:59:59.999Z') }, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$payment.amount' } } }
      ]),
      
      // Weekly earnings (last 7 days)
      Appointment.aggregate([
        { $match: { 
          doctor: doctorId, 
          appointment_date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, 
          status: 'completed' 
        }},
        { $group: { _id: null, total: { $sum: '$payment.amount' } } }
      ]),
      
      // Appointment types distribution
      Appointment.aggregate([
        { $match: { doctor: doctorId } },
        { $group: { _id: '$appointment_type', count: { $sum: 1 } } }
      ]),
      
      // Monthly appointment trend (last 6 months)
      Appointment.aggregate([
        { $match: { 
          doctor: doctorId, 
          appointment_date: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) } 
        }},
        { $group: { 
          _id: { 
            year: { $year: '$appointment_date' }, 
            month: { $month: '$appointment_date' } 
          }, 
          count: { $sum: 1 } 
        }},
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      
      // Patient age groups
      Appointment.aggregate([
        { $match: { doctor: doctorId } },
        { $group: { 
          _id: { 
            $switch: {
              branches: [
                { case: { $lt: ['$patientInfo.age', 18] }, then: '0-17' },
                { case: { $lt: ['$patientInfo.age', 30] }, then: '18-29' },
                { case: { $lt: ['$patientInfo.age', 45] }, then: '30-44' },
                { case: { $lt: ['$patientInfo.age', 60] }, then: '45-59' },
                { case: { $gte: ['$patientInfo.age', 60] }, then: '60+' }
              ],
              default: 'Unknown'
            }
          }, 
          count: { $sum: 1 } 
        }}
      ]),
      
      // Gender distribution
      Appointment.aggregate([
        { $match: { doctor: doctorId } },
        { $group: { _id: '$patientInfo.gender', count: { $sum: 1 } } }
      ])
    ]);

    // Calculate earnings with fallback to consultation fee
    const totalEarningsAmount = totalEarnings[0]?.total || (completedAppointments * consultationFee);
    const monthlyEarningsAmount = monthlyEarnings[0]?.total || (monthlyCompletedAppointments * consultationFee);
    const lastMonthEarningsAmount = lastMonthEarnings[0]?.total || (lastMonthCompletedAppointments * consultationFee);
    const yearlyEarningsAmount = yearlyEarnings[0]?.total || (yearlyCompletedAppointments * consultationFee);
    const todayEarningsAmount = todayEarnings[0]?.total || 0;
    const weeklyEarningsAmount = weeklyEarnings[0]?.total || 0;

    // Calculate growth percentages
    const monthlyGrowth = lastMonthEarningsAmount > 0 
      ? ((monthlyEarningsAmount - lastMonthEarningsAmount) / lastMonthEarningsAmount * 100).toFixed(1)
      : 0;
    
    const appointmentGrowth = lastMonthAppointments > 0 
      ? ((monthlyAppointments - lastMonthAppointments) / lastMonthAppointments * 100).toFixed(1)
      : 0;

    // Calculate average earnings per patient
    const avgEarningsPerPatient = uniquePatients.length > 0 
      ? (totalEarningsAmount / uniquePatients.length).toFixed(2)
      : 0;

    // Calculate completion rate
    const totalAppointments = completedAppointments + cancelledAppointments;
    const completionRate = totalAppointments > 0 
      ? ((completedAppointments / totalAppointments) * 100).toFixed(1)
      : 0;

    const stats = {
      // Basic stats
      todayAppointments,
      pendingAppointments,
      acceptedAppointments,
      monthlyAppointments,
      yearlyAppointments,
      uniquePatients: uniquePatients.length,
      completedAppointments,
      cancelledAppointments,
      
      // Earnings
      totalEarnings: totalEarningsAmount,
      monthlyEarnings: monthlyEarningsAmount,
      yearlyEarnings: yearlyEarningsAmount,
      todayEarnings: todayEarningsAmount,
      weeklyEarnings: weeklyEarningsAmount,
      avgEarningsPerPatient: parseFloat(avgEarningsPerPatient),
      
      // Growth metrics
      monthlyGrowth: parseFloat(monthlyGrowth),
      appointmentGrowth: parseFloat(appointmentGrowth),
      completionRate: parseFloat(completionRate),
      
      // Detailed analytics
      appointmentTypes: appointmentTypes.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      
      monthlyTrend: monthlyAppointmentTrend.map(item => ({
        month: item._id.month,
        year: item._id.year,
        count: item.count
      })),
      
      patientAgeGroups: patientAgeGroups.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      
      genderDistribution: genderDistribution.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      
      // Additional metrics
      consultationFee,
      monthlyCompletedAppointments,
      monthlyCancelledAppointments,
      lastMonthCompletedAppointments,
      lastMonthCancelledAppointments,
      yearlyCompletedAppointments,
      yearlyCancelledAppointments
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
      consultationFee: req.body.consultationFee,
      about: req.body.about,

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
    if (updatePayload.consultationFee !== undefined) {
      const fee = Number(updatePayload.consultationFee);
      if (isNaN(fee) || fee < 0) {
        delete updatePayload.consultationFee;
      } else {
        updatePayload.consultationFee = fee;
      }
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