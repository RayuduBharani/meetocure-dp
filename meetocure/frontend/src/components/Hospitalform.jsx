import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


const App = () => {
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalAddress, setHospitalAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  const navigate = useNavigate();

  // If already logged in as doctor, skip hospital form
  useEffect(() => {
    try {
      const stored = localStorage.getItem('doctorInfo');
      const doctor = stored ? JSON.parse(stored) : null;
      const token = localStorage.getItem('doctorToken');
      if (token && doctor && doctor.registrationStatus) {
        console.log(doctor , token , doctor.registrationStatus)
        if (doctor.registrationStatus === 'verified') {
          navigate('/doctor-dashboard');
        } 
        else if (doctor.registrationStatus === "under review by hospital") {
          navigate('/doctor-verify');
        }
        else {
          navigate('/doctor-verify');
        }
      }
    } catch (err) {
      console.log(err)
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Store the hospital data (you might want to send this to an API)
    const hospitalData = {
      hospitalName,
      hospitalAddress,
      contactNumber,
    };
    
    // You can store this data in localStorage if needed
    localStorage.setItem('hospitalData', JSON.stringify(hospitalData));
    
    // Navigate to doctor verification page
    navigate('/doctor-verification');
  };

  return (
    <div className="min-h-screen bg-white font-[Poppins] px-6 pt-6 pb-28">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-extrabold text-[#004B5C] text-center mb-6">
          Hospital Information
        </h1>
        <div className="text-center text-gray-600 mb-8">Step 1 of 3</div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-1">
              Hospital Name
            </label>
            <input
              type="text"
              name="hospitalName"
              placeholder="e.g., City General Hospital"
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
              required
              className="w-full border border-gray-400 px-4 py-2 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              Full Hospital Address
            </label>
            <input
              type="text"
              name="hospitalAddress"
              placeholder="Enter the complete address"
              value={hospitalAddress}
              onChange={(e) => setHospitalAddress(e.target.value)}
              required
              className="w-full border border-gray-400 px-4 py-2 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              Contact Number (Landline or Mobile)
            </label>
            <input
              type="tel"
              name="contactNumber"
              placeholder="Enter phone number"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              required
              className="w-full border border-gray-400 px-4 py-2 rounded-xl"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full font-semibold bg-[#004B5C] text-white hover:bg-[#003246] transition mt-6"
          >
            Next
          </button>
        </form>
      </div>
    </div>
  );
};



export default App;
