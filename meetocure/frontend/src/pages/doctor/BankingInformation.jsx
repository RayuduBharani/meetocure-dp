import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../../lib/config';

const BankingInformation = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
      const fileFields = ['profileImage', 'identityDocument', 'medicalCouncilCertificate', 'digitalSignatureCertificate', 'qualificationCertificates'];
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
      actualFiles.digitalSignature && formDataToSend.append('digitalSignatureCertificate', actualFiles.digitalSignature);
      
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
        
        // Navigate to dashboard
        navigate('/doctor-dashboard');
      } else {
        throw new Error(data.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(error.message || 'Failed to submit verification data');
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-2xl bg-white p-10 sm:p-12 rounded-2xl shadow-xl">
        <header className="mb-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-primary">
            Banking Information
          </h1>
          <div className="mt-4 text-gray-600">Step 3 of 3</div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField
            id="bankName"
            name="bankName"
            label="Bank Name"
            type="text"
            placeholder="Enter bank name"
            value={formData.bankName}
            onChange={handleChange}
          />
          <FormField
            id="accountNumber"
            name="accountNumber"
            label="Account Number"
            type="text"
            placeholder="Enter account number"
            value={formData.accountNumber}
            onChange={handleChange}
          />
          <FormField
            id="ifscCode"
            name="ifscCode"
            label="IFSC Code"
            type="text"
            placeholder="Enter IFSC code"
            value={formData.ifscCode}
            onChange={handleChange}
          />
          <FormField
            id="accountHolderName"
            name="accountHolderName"
            label="Account Holder Name"
            type="text"
            placeholder="Enter account holder name"
            value={formData.accountHolderName}
            onChange={handleChange}
          />
          <FormField
            id="bankBranch"
            name="bankBranch"
            label="Bank Branch"
            type="text"
            placeholder="Enter bank branch"
            value={formData.bankBranch}
            onChange={handleChange}
          />
          <div className="pt-6 flex justify-center">
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Reusable Button Component
const Button = ({ children, onClick, type = 'button', disabled = false }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="bg-primary text-white font-bold text-lg py-3 px-32 rounded-full hover:bg-primary-hover focus:outline-none focus:ring-4 focus:ring-primary focus:ring-opacity-50 transition-all duration-300 ease-in-out disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
};

// Reusable FormField Component
const FormField = ({ id, name, label, type, placeholder, value, onChange }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-base font-bold text-gray-700 mb-2">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="block w-full px-4 py-3 bg-white border border-gray-400 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
        required
      />
    </div>
  );
};

export default BankingInformation;
