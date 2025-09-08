import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { specializations } from "../../utils/category";

export const DoctorVerification = () => {
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const [hospitalData, setHospitalData] = useState(null);

  // Check for hospital data (single check)
  useEffect(() => {
    // If already logged in, redirect appropriately
    try {
      const stored = localStorage.getItem('doctorInfo');
      const doctor = stored ? JSON.parse(stored) : null;
      const token = localStorage.getItem('doctorToken');
      if (token && doctor && doctor.registrationStatus) {
        if (doctor.registrationStatus === 'verified') {
          navigate('/doctor-dashboard');
          return;
        } else {
          navigate('/doctor-verify');
          return;
        }
      }
    // eslint-disable-next-line no-unused-vars
    } catch (_) {
      console.log("err")
    }

    const storedHospitalData = localStorage.getItem("hospitalData");
    if (!storedHospitalData) {
      toast.error("Please fill hospital information first");
      navigate("/hospital-form");
      return;
    }
    setHospitalData(JSON.parse(storedHospitalData));
  }, [navigate]);

  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    dateOfBirth: "",
    medicalCouncilRegistrationNumber: "",
    medicalCouncilName: "",
    yearOfRegistration: "",
    primarySpecialization: "",
    additionalSpecializations: "",
    category: "General",
    qualifications: [{ degree: "", universityCollege: "", year: "" }],
    experienceYears: "",
    location: {
      city: "",
      state: "",
      pincode: "",
      address: "",
      landmark: ""
    },
    aadhaarNumber: "",
    panNumber: "",
    // these will be filled by backend after file upload
    identityDocument: "",
    medicalCouncilCertificate: "",
    qualificationCertificates: [],
    profileImage: "",
    consultationFee: "",
    about: "",
    languages: []
  });

  // Local file state (images only)
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [identityDocumentFile, setIdentityDocumentFile] = useState(null); // Aadhaar image
  const [medicalCouncilCertificateFile, setMedicalCouncilCertificateFile] =
    useState(null);
  const [qualificationCertificateFiles, setQualificationCertificateFiles] =
    useState([]);

  // Removed duplicate hospital data check to avoid repeated toasts/navigation

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, setter, multiple = false) => {
    if (multiple) {
      const files = Array.from(e.target.files);
      setQualificationCertificateFiles(files);
    } else {
      const file = e.target.files[0];
      setter(file);
    }
  };

  // qualifications handlers unchanged...
  const handleQualificationChange = (index, field, value) => {
    setFormData((prev) => {
      const quals = [...prev.qualifications];
      quals[index] = { ...quals[index], [field]: value };
      return { ...prev, qualifications: quals };
    });
  };
  const addQualification = () =>
    setFormData((prev) => ({
      ...prev,
      qualifications: [
        ...prev.qualifications,
        { degree: "", universityCollege: "", year: "" },
      ],
    }));
  const removeQualification = (index) =>
    setFormData((prev) => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index),
    }));

  // handle location changes
  const handleLocationChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value,
      },
    }));
  };

  // Submit and proceed to banking information
  const handleSubmit = (e) => {
    e.preventDefault();

    // Client-side checks for required files
    if (!profileImageFile) return toast.error("Profile image is required");
    if (!identityDocumentFile) return toast.error("Aadhaar image is required");
    if (!medicalCouncilCertificateFile)
      return toast.error("Medical council certificate image is required");
    if (qualificationCertificateFiles.length === 0)
      return toast.error(
        "At least one qualification certificate image is required"
      );
    
    // Check if consultation fee is provided
    if (!formData.consultationFee) {
      return toast.error("Consultation fee is required");
    }

    // Check if about section is filled
    if (!formData.about || formData.about.trim() === '') {
      return toast.error("Please provide information in the About section");
    }
    
    // Validate PAN number format if provided
    if (formData.panNumber && formData.panNumber.trim() !== '') {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
      if (!panRegex.test(formData.panNumber.trim())) {
        return toast.error("Invalid PAN number format. Should be like ABCDE1234F");
      }
    }

    // Validate Aadhaar number format if provided
    if (formData.aadhaarNumber && formData.aadhaarNumber.trim() !== '') {
      const aadhaarRegex = /^\d{12}$/;
      if (!aadhaarRegex.test(formData.aadhaarNumber.trim())) {
        return toast.error("Invalid Aadhaar number format. Should be 12 digits");
      }
    }

    // Remove empty PAN and Aadhaar numbers
    const dataToSubmit = { ...formData };
    if (!dataToSubmit.panNumber || dataToSubmit.panNumber.trim() === '') {
      delete dataToSubmit.panNumber;
    }
    if (!dataToSubmit.aadhaarNumber || dataToSubmit.aadhaarNumber.trim() === '') {
      delete dataToSubmit.aadhaarNumber;
    }

    // Convert consultation fee to number
    dataToSubmit.consultationFee = Number(formData.consultationFee);

    // Save doctor data and files to localStorage
    const doctorData = {
      ...dataToSubmit,
      files: {
        profileImage: profileImageFile,
        identityDocument: identityDocumentFile,
        medicalCouncilCertificate: medicalCouncilCertificateFile,
        qualificationCertificates: qualificationCertificateFiles,
      },
    };

    localStorage.setItem("doctorData", JSON.stringify(doctorData));

    // Navigate to banking information page with files in state
    navigate("/banking-information", {
      state: {
        files: {
          profileImage: profileImageFile,
          identityDocument: identityDocumentFile,
          medicalCouncilCertificate: medicalCouncilCertificateFile,
          qualificationCertificates: qualificationCertificateFiles,
        },
      },
    });
  };

  return (
    <div className="min-h-screen bg-white font-[Poppins] px-6 pt-6 pb-28">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-extrabold text-[#004B5C] text-center mb-6">
          Doctor Professional Verification
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              placeholder="Enter full name"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full border border-gray-400 px-4 py-2 rounded-xl"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-semibold mb-1">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className="w-full border border-gray-400 px-4 py-2 rounded-xl"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
              className="w-full border border-gray-400 px-4 py-2 rounded-xl"
            />
          </div>

          {/* Medical Council Registration Number */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Medical Council Registration Number
            </label>
            <input
              type="text"
              name="medicalCouncilRegistrationNumber"
              placeholder="Enter registration number"
              value={formData.medicalCouncilRegistrationNumber}
              onChange={handleChange}
              required
              className="w-full border border-gray-400 px-4 py-2 rounded-xl"
            />
          </div>

          {/* Medical Council Name */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Medical Council Name
            </label>
            <input
              type="text"
              name="medicalCouncilName"
              placeholder="e.g., Andhra Pradesh Medical Council"
              value={formData.medicalCouncilName}
              onChange={handleChange}
              required
              className="w-full border border-gray-400 px-4 py-2 rounded-xl"
            />
          </div>

          {/* Year of Registration */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Year of Registration
            </label>
            <input
              type="number"
              name="yearOfRegistration"
              value={formData.yearOfRegistration}
              onChange={handleChange}
              required
              className="w-full border border-gray-400 px-4 py-2 rounded-xl"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold mb-1">Category</label>

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border border-gray-400 px-4 py-2 rounded-xl"
            >
              <option value="">-- Select Category --</option>
              {specializations?.map((item, index) => (
                <option key={index} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* Primary Specialization */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Primary Specialization
            </label>
            <input
              type="text"
              name="primarySpecialization"
              placeholder="e.g., General Physician"
              value={formData.primarySpecialization}
              onChange={handleChange}
              required
              className="w-full border border-gray-400 px-4 py-2 rounded-xl"
            />
          </div>

          {/* Additional Specializations */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Additional Specializations (comma separated)
            </label>
            <input
              type="text"
              name="additionalSpecializations"
              placeholder="e.g., Diabetes, Hypertension"
              value={formData.additionalSpecializations}
              onChange={handleChange}
              className="w-full border border-gray-400 px-4 py-2 rounded-xl"
            />
          </div>

          {/* Experience */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Experience (Years)
            </label>
            <input
              type="number"
              name="experienceYears"
              value={formData.experienceYears}
              onChange={handleChange}
              required
              className="w-full border border-gray-400 px-4 py-2 rounded-xl"
            />
          </div>

          {/* Qualifications (dynamic) */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Qualifications
            </label>
            {formData.qualifications.map((q, idx) => (
              <div key={idx} className="mb-3 p-3 border rounded-xl">
                <input
                  type="text"
                  placeholder="Degree"
                  value={q.degree}
                  onChange={(e) =>
                    handleQualificationChange(idx, "degree", e.target.value)
                  }
                  required
                  className="w-full mb-2 border border-gray-300 px-3 py-2 rounded"
                />
                <input
                  type="text"
                  placeholder="University / College"
                  value={q.universityCollege}
                  onChange={(e) =>
                    handleQualificationChange(
                      idx,
                      "universityCollege",
                      e.target.value
                    )
                  }
                  className="w-full mb-2 border border-gray-300 px-3 py-2 rounded"
                />
                <input
                  type="text"
                  placeholder="Year"
                  value={q.year}
                  onChange={(e) =>
                    handleQualificationChange(idx, "year", e.target.value)
                  }
                  className="w-full mb-2 border border-gray-300 px-3 py-2 rounded"
                />
                <div className="flex gap-2">
                  {formData.qualifications.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQualification(idx)}
                      className="text-red-600"
                    >
                      Remove
                    </button>
                  )}
                  {idx === formData.qualifications.length - 1 && (
                    <button
                      type="button"
                      onClick={addQualification}
                      className="text-green-600"
                    >
                      Add
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Aadhaar */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Aadhaar Number (Optional)
            </label>
            <input
              type="text"
              name="aadhaarNumber"
              placeholder="Enter Aadhaar"
              value={formData.aadhaarNumber}
              onChange={handleChange}
              className="w-full border border-gray-400 px-4 py-2 rounded-xl"
            />
          </div>

          {/* PAN */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              PAN Number (Optional)
            </label>
            <input
              type="text"
              name="panNumber"
              placeholder="Enter PAN"
              value={formData.panNumber}
              onChange={handleChange}
              className="w-full border border-gray-400 px-4 py-2 rounded-xl"
            />
          </div>

          {/* Aadhaar Image (identity document) */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Aadhaar Image (Required)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, setIdentityDocumentFile)}
              required
              className="w-full border border-gray-300 px-3 py-2 rounded"
            />
            <small className="text-gray-500">
              Upload Aadhaar as an image (jpg/png/gif).
            </small>
          </div>

          {/* Medical Council Certificate (image) */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Medical Council Certificate (Image)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleFileChange(e, setMedicalCouncilCertificateFile)
              }
              required
              className="w-full border border-gray-300 px-3 py-2 rounded"
            />
          </div>

          {/* Qualification Certificate Images (multiple) */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Qualification Certificate Images (you can select multiple)
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileChange(e, null, true)}
              required
              className="w-full border border-gray-300 px-3 py-2 rounded"
            />
            <small className="text-gray-500">
              Upload images (jpg/png/gif) of degree certificates.
            </small>
          </div>

          {/* Profile Image */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Profile Image (Required)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, setProfileImageFile)}
              required
              className="w-full border border-gray-300 px-3 py-2 rounded"
            />
          </div>

          {/* Additional Location Fields */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Location Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Address"
                value={formData.location.address}
                onChange={(e) => handleLocationChange('address', e.target.value)}
                className="w-full border border-gray-400 px-4 py-2 rounded-xl"
              />
              <input
                type="text"
                placeholder="Landmark"
                value={formData.location.landmark}
                onChange={(e) => handleLocationChange('landmark', e.target.value)}
                className="w-full border border-gray-400 px-4 py-2 rounded-xl"
              />
              <input
                type="text"
                placeholder="Pincode"
                value={formData.location.pincode}
                onChange={(e) => handleLocationChange('pincode', e.target.value)}
                className="w-full border border-gray-400 px-4 py-2 rounded-xl"
              />
            </div>
          </div>

          {/* Consultation Fee */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Consultation Fee (₹)
            </label>
            <input
              type="number"
              name="consultationFee"
              placeholder="Enter consultation fee"
              value={formData.consultationFee}
              onChange={handleChange}
              required
              min="0"
              className="w-full border border-gray-400 px-4 py-2 rounded-xl"
            />
          </div>

          {/* About */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              About
            </label>
            <textarea
              name="about"
              placeholder="Write about your practice and experience"
              value={formData.about}
              onChange={handleChange}
              rows="4"
              className="w-full border border-gray-400 px-4 py-2 rounded-xl resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full font-semibold bg-[#004B5C] text-white hover:bg-[#003246] transition"
          >
            Submit for Verification
          </button>
        </form>
      </div>
    </div>
  );
};
