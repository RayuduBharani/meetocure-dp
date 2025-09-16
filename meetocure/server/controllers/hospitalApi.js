// routes/hospitalsAPI.js
const express = require('express');
const HospitalLogin = require('../models/HospitalLogin');
const router = express.Router();

// GET all hospitals for dropdown selection
router.get('/hospitals/list', async (req, res) => {
    console.log('🔍 Fetching hospitals list...');
  try {
    
    // Check if the model is properly imported
    console.log('📋 HospitalLogin model:', HospitalLogin);
    
    // Fetch only necessary fields for dropdown
    const hospitals = await HospitalLogin.find({}, {
      hospitalName: 1,
      address: 1,
      contact: 1,
      email: 1,
      _id: 1
    }).sort({ hospitalName: 1 });

    console.log(`✅ Found ${hospitals.length} hospitals`);
    console.log('📊 Sample hospital:', hospitals[0]);

    res.status(200).json({
      success: true,
      data: hospitals,
      count: hospitals.length
    });
  } catch (error) {
    console.error('❌ Error in /hospitals/list route:', error);
    console.error('📍 Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hospitals list',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// GET hospital by ID
router.get('/hospitals/:id', async (req, res) => {
  try {
    console.log(`🔍 Fetching hospital by ID: ${req.params.id}`);
    
    const hospital = await HospitalLogin.findById(req.params.id, {
      hospitalName: 1,
      address: 1,
      contact: 1,
      email: 1,
      _id: 1
    });

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    console.log('✅ Hospital found:', hospital.hospitalName);

    res.status(200).json({
      success: true,
      data: hospital
    });
  } catch (error) {
    console.error('❌ Error fetching hospital by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hospital details',
      error: error.message
    });
  }
});

module.exports = router;
