/* eslint-disable no-undef */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const App = () => {
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalAddress, setHospitalAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isManualEntry, setIsManualEntry] = useState(false);

  const navigate = useNavigate();

  // Check if doctor already logged in
  useEffect(() => {
    try {
      const stored = localStorage.getItem('doctorInfo');
      const doctor = stored ? JSON.parse(stored) : null;
      const token = localStorage.getItem('doctorToken');
      
      if (token && doctor && doctor.registrationStatus) {
        if (doctor.registrationStatus === 'verified') {
          navigate('/doctor-dashboard');
        } else if (doctor.registrationStatus === "under review by hospital") {
          navigate('/doctor-verify');
        } else {
          navigate('/doctor-verify');
        }
      }
    } catch (err) {
      console.log('Error checking doctor status:', err);
    }
  }, [navigate]);

  // Fetch hospitals list on component mount
  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching hospitals from: http://localhost:5000/api1/hospitals/list');
      
      const response = await fetch('http://localhost:5000/api1/hospitals/list', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      
      if (data.success) {
        setHospitals(data.data);
        console.log(`Loaded ${data.data.length} hospitals`);
      } else {
        setError(data.message || 'Failed to fetch hospitals');
      }
    } catch (err) {
      console.error('Error fetching hospitals:', err);
      
      if (err.message.includes('Failed to fetch') || err.name === 'TypeError') {
        setError('Cannot connect to server. Please ensure the backend is running on localhost:5000');
      } else {
        setError('Failed to load hospitals: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle hospital selection from dropdown
  const handleHospitalSelect = async (hospitalId) => {
    setSelectedHospitalId(hospitalId);
    setError('');
    
    if (!hospitalId) {
      setHospitalName('');
      setHospitalAddress('');
      setContactNumber('');
      return;
    }

    const selectedHospital = hospitals.find(h => h._id === hospitalId);
    if (selectedHospital) {
      setHospitalName(selectedHospital.hospitalName);
      setHospitalAddress(selectedHospital.address);
      setContactNumber(selectedHospital.contact);
      
      // Log hospital selection for debugging
      console.log('🏥 Hospital selected:', {
        id: selectedHospital._id,
        name: selectedHospital.hospitalName,
        address: selectedHospital.address
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!hospitalName.trim() || !hospitalAddress.trim() || !contactNumber.trim()) {
      setError('Please fill in all hospital details');
      return;
    }

    // **ENHANCED: More comprehensive hospital data for backend integration**
    const hospitalData = {
      // Primary hospital identification
      hospitalId: selectedHospitalId, // MongoDB ObjectId for selected hospital
      hospitalName: hospitalName.trim(),
      hospitalAddress: hospitalAddress.trim(),
      contactNumber: contactNumber.trim(),
      
      // **NEW: Additional fields for backend processing**
      isManualEntry: isManualEntry, // Flag to indicate if manually entered
      
      // **NEW: Multiple field names for backend flexibility**
      hospital_hospitalName: hospitalName.trim(), // For backend hospitalInfo extraction
      hospital_address: hospitalAddress.trim(),
      hospital_contact: contactNumber.trim(),
      
      // **NEW: Alternative field names (matching backend expectations)**
      hospital_name: hospitalName.trim(), // Alternative field name
      
      // **NEW: Timestamp and validation**
      selectedAt: new Date().toISOString(),
      validated: true
    };
    
    // **ENHANCED: Store hospital data with validation**
    try {
      localStorage.setItem('hospitalData', JSON.stringify(hospitalData));
      
      // **NEW: Also store for easy backend access**
      localStorage.setItem('selectedHospitalId', selectedHospitalId || '');
      localStorage.setItem('selectedHospitalName', hospitalName.trim());
      
      console.log('🏥 Hospital data stored for verification:', hospitalData);
      
      // **NEW: Validate storage was successful**
      const stored = localStorage.getItem('hospitalData');
      if (!stored) {
        throw new Error('Failed to store hospital data');
      }
      
      // Navigate to doctor verification page
      navigate('/doctor-verification');
      
    } catch (storageError) {
      console.error('Error storing hospital data:', storageError);
      setError('Failed to save hospital selection. Please try again.');
    }
  };

  const toggleManualEntry = () => {
    setIsManualEntry(!isManualEntry);
    if (!isManualEntry) {
      setSelectedHospitalId('');
      setHospitalName('');
      setHospitalAddress('');
      setContactNumber('');
    }
    setError('');
    
    console.log('🔄 Manual entry mode:', !isManualEntry);
  };

  // **NEW: Helper function to get current hospital data**
  const getCurrentHospitalData = () => {
    return {
      hospitalId: selectedHospitalId,
      hospitalName: hospitalName.trim(),
      hospitalAddress: hospitalAddress.trim(),
      contactNumber: contactNumber.trim(),
      isManualEntry: isManualEntry
    };
  };

  // **NEW: Validation helper**
  const isFormValid = () => {
    return hospitalName.trim() && hospitalAddress.trim() && contactNumber.trim();
  };

  return (
    <div className="min-h-screen bg-white font-[Poppins] px-6 pt-6 pb-28">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-extrabold text-[#004B5C] text-center mb-6">
          Hospital Information
        </h1>
        <div className="text-center text-gray-600 mb-8">Step 1 of 3</div>

        {/* **ENHANCED: Better error display** */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-semibold">Error</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* **NEW: Success message for hospital loaded** */}
        {hospitals.length > 0 && !error && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">
                ✅ {hospitals.length} hospitals loaded successfully
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Toggle between dropdown and manual entry */}
          <div className="flex justify-center mb-6">
            <button
              type="button"
              onClick={toggleManualEntry}
              className="text-sm text-[#004B5C] hover:underline flex items-center transition-colors duration-200"
            >
              {isManualEntry ? (
                <>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  Select from existing hospitals
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Enter hospital details manually
                </>
              )}
            </button>
          </div>

          {!isManualEntry && (
            <div>
              <label className="block text-sm font-semibold mb-1">
                Select Hospital *
              </label>
              {loading ? (
                <div className="w-full border border-gray-400 px-4 py-2 rounded-xl bg-gray-100 flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#004B5C] mr-2"></div>
                  Loading hospitals...
                </div>
              ) : (
                <select
                  value={selectedHospitalId}
                  onChange={(e) => handleHospitalSelect(e.target.value)}
                  required={!isManualEntry}
                  className="w-full border border-gray-400 px-4 py-2 rounded-xl bg-white focus:border-[#004B5C] focus:outline-none transition-colors duration-200"
                >
                  <option value="">Choose a hospital...</option>
                  {hospitals.map((hospital) => (
                    <option key={hospital._id} value={hospital._id}>
                      {hospital.hospitalName} - {hospital.address}
                    </option>
                  ))}
                </select>
              )}
              
              {hospitals.length === 0 && !loading && (
                <p className="text-sm text-gray-500 mt-1">
                  No hospitals available. 
                  <button 
                    type="button" 
                    onClick={fetchHospitals}
                    className="text-[#004B5C] hover:underline ml-1 transition-colors duration-200"
                  >
                    Retry
                  </button>
                </p>
              )}
            </div>
          )}

          {/* Hospital Name Field */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Hospital Name *
            </label>
            <input
              type="text"
              name="hospitalName"
              placeholder="e.g., City General Hospital"
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
              required
              readOnly={!isManualEntry && selectedHospitalId}
              className={`w-full border border-gray-400 px-4 py-2 rounded-xl focus:border-[#004B5C] focus:outline-none transition-colors duration-200 ${
                !isManualEntry && selectedHospitalId ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
              }`}
            />
          </div>

          {/* Hospital Address Field */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Full Hospital Address *
            </label>
            <input
              type="text"
              name="hospitalAddress"
              placeholder="Enter the complete address"
              value={hospitalAddress}
              onChange={(e) => setHospitalAddress(e.target.value)}
              required
              readOnly={!isManualEntry && selectedHospitalId}
              className={`w-full border border-gray-400 px-4 py-2 rounded-xl focus:border-[#004B5C] focus:outline-none transition-colors duration-200 ${
                !isManualEntry && selectedHospitalId ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
              }`}
            />
          </div>

          {/* Contact Number Field */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Contact Number (Landline or Mobile) *
            </label>
            <input
              type="tel"
              name="contactNumber"
              placeholder="Enter phone number"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              required
              readOnly={!isManualEntry && selectedHospitalId}
              className={`w-full border border-gray-400 px-4 py-2 rounded-xl focus:border-[#004B5C] focus:outline-none transition-colors duration-200 ${
                !isManualEntry && selectedHospitalId ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
              }`}
            />
          </div>

          {/* **ENHANCED: Selected hospital display with more details** */}
          {!isManualEntry && selectedHospitalId && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Selected Hospital
              </h3>
              <div className="text-sm text-green-700 space-y-1">
                <p><strong>Hospital ID:</strong> {selectedHospitalId}</p>
                <p><strong>Name:</strong> {hospitalName}</p>
                <p><strong>Address:</strong> {hospitalAddress}</p>
                <p><strong>Contact:</strong> {contactNumber}</p>
              </div>
              <p className="text-xs text-green-600 mt-2 italic">
                This hospital will be linked to your doctor profile during verification.
              </p>
            </div>
          )}

          {/* **NEW: Manual entry indication** */}
          {isManualEntry && isFormValid() && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Manual Entry Mode
              </h3>
              <p className="text-sm text-blue-700">
                You're entering hospital details manually. Please ensure the information is accurate.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !isFormValid()}
            className={`w-full py-3 rounded-full font-semibold transition-all duration-200 mt-6 ${
              loading || !isFormValid()
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50'
                : 'bg-[#004B5C] text-white hover:bg-[#003246] hover:shadow-lg'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Next → Doctor Verification'
            )}
          </button>
        </form>

        {/* Server Status Check */}
        <div className="text-center mt-6">
          <button
            type="button"
            onClick={fetchHospitals}
            className="text-sm text-gray-600 hover:text-[#004B5C] transition-colors duration-200 flex items-center mx-auto"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh hospitals list ({hospitals.length} loaded)
          </button>
        </div>

        {/* **NEW: Debug info (remove in production)** */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Debug Info:</h4>
            <pre className="text-xs text-gray-600 overflow-x-auto">
              {JSON.stringify(getCurrentHospitalData(), null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
