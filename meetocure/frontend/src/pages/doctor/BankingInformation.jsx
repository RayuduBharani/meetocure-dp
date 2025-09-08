import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../../lib/config';

const BankingInformation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    accountHolderName: '',
    bankBranch: '',
  });

  // Check for previous steps data and verification status
  useEffect(() => {
    const hospitalData = localStorage.getItem('hospitalData');
    const doctorData = localStorage.getItem('doctorData');
    
    if (!hospitalData || !doctorData) {
      // If previous steps data is missing, redirect to appropriate step
      if (!hospitalData) {
        navigate('/hospital-form');
      } else {
        navigate('/doctor-verification');
      }
    } else {
      // Check if doctor is already verified
      checkVerificationStatus();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const checkVerificationStatus = async () => {
    try {
      const doctorId = localStorage.getItem('doctorId') || 
                      JSON.parse(localStorage.getItem('doctorInfo'))?._id ||
                      JSON.parse(localStorage.getItem('user'))?._id;
      
      if (doctorId) {
        const response = await fetch(`${API_BASE_URL}/api/doctor/verification-status/${doctorId}`);
        const data = await response.json();
        
        if (data.success && data.doctor?.registrationStatus === 'verified') {
          // Doctor is already verified, redirect to dashboard
          navigate('/doctor-dashboard');
        }
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Get all data from localStorage
      const hospitalData = JSON.parse(localStorage.getItem('hospitalData'));
      const doctorData = JSON.parse(localStorage.getItem('doctorData'));
      
      // Get doctorId from various possible sources
      let doctorId = null;
      
      // Try to get from directly stored doctorId first
      if (localStorage.getItem('doctorId')) {
        doctorId = localStorage.getItem('doctorId');
      }
      // Try to get from doctorData
      else if (doctorData?.doctorId) {
        doctorId = doctorData.doctorId;
      }
      // Try to get from doctorInfo (stored after login)
      else if (localStorage.getItem('doctorInfo')) {
        const doctorInfo = JSON.parse(localStorage.getItem('doctorInfo'));
        doctorId = doctorInfo._id || doctorInfo.doctorId;
      }
      // Try to get from user data
      else if (localStorage.getItem('user')) {
        const user = JSON.parse(localStorage.getItem('user'));
        doctorId = user._id || user.doctorId;
      }
      
      // Debug logging (remove in production)
      console.log('Extracted doctorId:', doctorId);
      console.log('Doctor data being sent:', doctorData);
      
      if (!doctorId) {
        throw new Error('Doctor ID not found. Please login again.');
      }
      
      // Create FormData instance
      const formDataToSend = new FormData();

      // Append hospital data
      Object.entries(hospitalData).forEach(([key, value]) => {
        formDataToSend.append(`hospital_${key}`, value);
      });

      // Get files from navigation state (passed from DoctorVerification component)
      const filesFromState = location.state?.files;
      
      // Append doctor data (excluding files and file-related fields)
      const { files: doctorFiles, ...doctorInfo } = doctorData;
      
      // Use files from navigation state if available, otherwise fall back to localStorage
      const actualFiles = filesFromState || doctorFiles;
      
      // Check if files are available
      if (!actualFiles || !actualFiles.qualificationCertificates || actualFiles.qualificationCertificates.length === 0) {
        throw new Error('Qualification certificate files are missing. Please go back and re-upload your files.');
      }
      
      // Filter out file-related fields that shouldn't be sent as form data
      const fileFields = ['profileImage', 'identityDocument', 'medicalCouncilCertificate', 'qualificationCertificates'];
      const filteredDoctorInfo = Object.fromEntries(
        Object.entries(doctorInfo).filter(([key]) => !fileFields.includes(key))
      );
      
      Object.entries(filteredDoctorInfo).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
          formDataToSend.append(key, JSON.stringify(value));
        } else {
          formDataToSend.append(key, value);
        }
      });

      // Append banking data
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(`bank_${key}`, value);
      });

      // Append doctor files
      console.log('actualFiles structure:', actualFiles);
      console.log('qualificationCertificates:', actualFiles.qualificationCertificates);
      
      actualFiles.profileImage && formDataToSend.append('profileImage', actualFiles.profileImage);
      actualFiles.identityDocument && formDataToSend.append('identityDocument', actualFiles.identityDocument);
      actualFiles.medicalCouncilCertificate && formDataToSend.append('medicalCouncilCertificate', actualFiles.medicalCouncilCertificate);
      
      if (actualFiles.qualificationCertificates && actualFiles.qualificationCertificates.length > 0) {
        console.log('Adding qualification certificates:', actualFiles.qualificationCertificates.length);
        actualFiles.qualificationCertificates.forEach((file, index) => {
          console.log(`Adding qualification certificate ${index}:`, file);
          formDataToSend.append('qualificationCertificates', file);
        });
      } else {
        console.log('No qualification certificates found!');
        console.log('actualFiles.qualificationCertificates:', actualFiles.qualificationCertificates);
      }

      const url = `${API_BASE_URL}/api/doctor/verify-doctor?doctorId=${doctorId}`;
      const response = await fetch(url, {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Server error response:', errorData);
        throw new Error(errorData.message || 'Failed to submit verification data');
      }

      const data = await response.json();
      
      if (data.success) {
        // Store token and user data if provided
        if (data.token) {
          localStorage.setItem("doctorToken", data.token);
          console.log('Doctor token stored:', data.token);
        }
        if (data.doctor) {
          localStorage.setItem("doctorInfo", JSON.stringify(data.doctor));
          console.log('Doctor info stored:', data.doctor);
        }
        
        // Clear form data from localStorage
        localStorage.removeItem('hospitalData');
        localStorage.removeItem('doctorData');
        
        // Show success message
        alert('Verification submitted successfully!');
        
        // Redirect to verification pending screen
        navigate('/doctor-verify');
      } else {
        throw new Error(data.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(error.message || 'Failed to submit verification data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-[Poppins] px-6 pt-6 pb-28">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-extrabold text-[#004B5C] text-center mb-6">
          Banking Information
        </h1>
        <div className="text-center text-gray-600 mb-8">Step 3 of 3</div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-1">
              Bank Name
            </label>
            <input
              type="text"
              name="bankName"
              placeholder="Enter bank name"
              value={formData.bankName}
              onChange={handleChange}
              required
              className="w-full border border-gray-400 px-4 py-2 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              Account Number
            </label>
            <input
              type="text"
              name="accountNumber"
              placeholder="Enter account number"
              value={formData.accountNumber}
              onChange={handleChange}
              required
              className="w-full border border-gray-400 px-4 py-2 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              IFSC Code
            </label>
            <input
              type="text"
              name="ifscCode"
              placeholder="Enter IFSC code"
              value={formData.ifscCode}
              onChange={handleChange}
              required
              className="w-full border border-gray-400 px-4 py-2 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              Account Holder Name
            </label>
            <input
              type="text"
              name="accountHolderName"
              placeholder="Enter account holder name"
              value={formData.accountHolderName}
              onChange={handleChange}
              required
              className="w-full border border-gray-400 px-4 py-2 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              Bank Branch
            </label>
            <input
              type="text"
              name="bankBranch"
              placeholder="Enter bank branch"
              value={formData.bankBranch}
              onChange={handleChange}
              required
              className="w-full border border-gray-400 px-4 py-2 rounded-xl"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-full font-semibold bg-[#004B5C] text-white hover:bg-[#003246] transition mt-6 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              'Submit'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};



export default BankingInformation;
