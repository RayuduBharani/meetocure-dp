import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { specializations } from "../../utils/category";

export const DoctorVerification = () => {
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const [hospitalData, setHospitalData] = useState(null);

  // Check for hospital data
  useEffect(() => {
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
    },
    aadhaarNumber: "",
    panNumber: "",
    // these will be filled by backend after file upload
    identityDocument: "",
    medicalCouncilCertificate: "",
    qualificationCertificates: [],
    profileImage: "",
  });

  // Local file state (images only)
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [identityDocumentFile, setIdentityDocumentFile] = useState(null); // Aadhaar image
  const [medicalCouncilCertificateFile, setMedicalCouncilCertificateFile] =
    useState(null);
  const [qualificationCertificateFiles, setQualificationCertificateFiles] =
    useState([]);

  // Check for hospital data on initial load
  useEffect(() => {
    const storedHospitalData = localStorage.getItem("hospitalData");
    if (!storedHospitalData) {
      toast.error(
        "Hospital information not found. Please fill in hospital details first."
      );
      navigate("/");
      return;
    }
    setHospitalData(JSON.parse(storedHospitalData));
  }, [navigate]);

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
  // eslint-disable-next-line no-unused-vars
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

    // Save doctor data and files to localStorage
    const doctorData = {
      ...formData,
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
