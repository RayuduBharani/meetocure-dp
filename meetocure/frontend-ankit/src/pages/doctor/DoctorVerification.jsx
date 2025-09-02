import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

export const DoctorVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const doctorId = queryParams.get("doctorId");

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
    clinicHospitalAffiliations: [
      {
        name: "",
        city: "",
        state: "",
        startDate: "",
        endDate: "",
        designation: "",
      },
    ],
    aadhaarNumber: "",
    panNumber: "",
    identityDocumentUrl: "",
    medicalCouncilCertificateUrl: "",
    qualificationCertificatesUrls: [""],
  digitalSignatureCertificateId: "",
  // profileImage will be uploaded via file input and sent as multipart/form-data
  });

  // Local file state
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [identityDocumentFile, setIdentityDocumentFile] = useState(null);
  const [medicalCouncilCertificateFile, setMedicalCouncilCertificateFile] = useState(null);
  const [qualificationCertificateFiles, setQualificationCertificateFiles] = useState([]);

  useEffect(() => {
    if (!doctorId) {
      toast.error("Doctor ID not found. Please try again.");
      navigate("/dual-doctor");
    }
  }, [doctorId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, setter, multiple = false, index = null) => {
    if (multiple) {
      const files = Array.from(e.target.files);
      setQualificationCertificateFiles(files);
    } else {
      const file = e.target.files[0];
      setter(file);
    }
  };

  // Qualifications handlers
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
      qualifications: [...prev.qualifications, { degree: "", universityCollege: "", year: "" }],
    }));
  const removeQualification = (index) =>
    setFormData((prev) => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index),
    }));

  // Clinic/Hospital affiliations handlers
  const handleAffiliationChange = (index, field, value) => {
    setFormData((prev) => {
      const affs = [...prev.clinicHospitalAffiliations];
      affs[index] = { ...affs[index], [field]: value };
      return { ...prev, clinicHospitalAffiliations: affs };
    });
  };
  const addAffiliation = () =>
    setFormData((prev) => ({
      ...prev,
      clinicHospitalAffiliations: [
        ...prev.clinicHospitalAffiliations,
        { name: "", city: "", state: "", startDate: "", endDate: "", designation: "" },
      ],
    }));
  const removeAffiliation = (index) =>
    setFormData((prev) => ({
      ...prev,
      clinicHospitalAffiliations: prev.clinicHospitalAffiliations.filter((_, i) => i !== index),
    }));

  // Qualification certificate URLs handlers
  const handleCertChange = (index, value) => {
    setFormData((prev) => {
      const certs = [...prev.qualificationCertificatesUrls];
      certs[index] = value;
      return { ...prev, qualificationCertificatesUrls: certs };
    });
  };
  const addCert = () =>
    setFormData((prev) => ({ ...prev, qualificationCertificatesUrls: [...prev.qualificationCertificatesUrls, ""] }));
  const removeCert = (index) =>
    setFormData((prev) => ({ ...prev, qualificationCertificatesUrls: prev.qualificationCertificatesUrls.filter((_, i) => i !== index) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Submitting verification...");

    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/doctor/verify-doctor/?doctorId=${doctorId}`;
      const fd = new FormData();

      // Append scalar fields
      Object.keys(formData).forEach((key) => {
        const val = formData[key];
        // For arrays/objects, stringify them so backend can parse
        if (Array.isArray(val) || typeof val === 'object') {
          fd.append(key, JSON.stringify(val));
        } else if (val !== undefined && val !== null) {
          fd.append(key, val);
        }
      });

      // Append files
      if (profileImageFile) fd.append('profileImage', profileImageFile);
      if (identityDocumentFile) fd.append('identityDocument', identityDocumentFile);
      if (medicalCouncilCertificateFile) fd.append('medicalCouncilCertificate', medicalCouncilCertificateFile);
      qualificationCertificateFiles.forEach((f) => fd.append('qualificationCertificates', f));

      const res = await axios.post(url, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.dismiss(loadingToast);
      const { token, doctor } = res.data;
      if (res.data.success) {
        toast.success("Verification submitted successfully!");
        if (token) localStorage.setItem("doctorToken", token);
        if (doctor) localStorage.setItem("user", JSON.stringify(doctor));
        navigate("/doctor-dashboard");
      } else {
        toast.error("Verification failed. Please try again.");
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err.response?.data?.message || "Verification submission failed");
    }
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
            <label className="block text-sm font-semibold mb-1">Full Name</label>
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
            <label className="block text-sm font-semibold mb-1">Date of Birth</label>
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
            <label className="block text-sm font-semibold mb-1">Medical Council Registration Number</label>
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
            <label className="block text-sm font-semibold mb-1">Medical Council Name</label>
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
            <label className="block text-sm font-semibold mb-1">Year of Registration</label>
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
              <option value="Cardiology">Cardiology</option>
              <option value="Dentistry">Dentistry</option>
              <option value="Pulmonology">Pulmonology</option>
              <option value="Neurology">Neurology</option>
              <option value="Gastroenterology">Gastroenterology</option>
              <option value="Laboratory">Laboratory</option>
              <option value="Vaccination">Vaccination</option>
              <option value="General">General</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Primary Specialization */}
          <div>
            <label className="block text-sm font-semibold mb-1">Primary Specialization</label>
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
            <label className="block text-sm font-semibold mb-1">Additional Specializations (comma separated)</label>
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
            <label className="block text-sm font-semibold mb-1">Experience (Years)</label>
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
            <label className="block text-sm font-semibold mb-1">Qualifications</label>
            {formData.qualifications.map((q, idx) => (
              <div key={idx} className="mb-3 p-3 border rounded-xl">
                <input
                  type="text"
                  placeholder="Degree"
                  value={q.degree}
                  onChange={(e) => handleQualificationChange(idx, "degree", e.target.value)}
                  required
                  className="w-full mb-2 border border-gray-300 px-3 py-2 rounded"
                />
                <input
                  type="text"
                  placeholder="University / College"
                  value={q.universityCollege}
                  onChange={(e) => handleQualificationChange(idx, "universityCollege", e.target.value)}
                  className="w-full mb-2 border border-gray-300 px-3 py-2 rounded"
                />
                <input
                  type="text"
                  placeholder="Year"
                  value={q.year}
                  onChange={(e) => handleQualificationChange(idx, "year", e.target.value)}
                  className="w-full mb-2 border border-gray-300 px-3 py-2 rounded"
                />
                <div className="flex gap-2">
                  {formData.qualifications.length > 1 && (
                    <button type="button" onClick={() => removeQualification(idx)} className="text-red-600">Remove</button>
                  )}
                  {idx === formData.qualifications.length - 1 && (
                    <button type="button" onClick={addQualification} className="text-green-600">Add</button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Clinic / Hospital Affiliations (dynamic) */}
          <div>
            <label className="block text-sm font-semibold mb-1">Clinic / Hospital Affiliations</label>
            {formData.clinicHospitalAffiliations.map((a, idx) => (
              <div key={idx} className="mb-3 p-3 border rounded-xl">
                <input
                  type="text"
                  placeholder="Name"
                  value={a.name}
                  onChange={(e) => handleAffiliationChange(idx, "name", e.target.value)}
                  className="w-full mb-2 border border-gray-300 px-3 py-2 rounded"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="City"
                    value={a.city}
                    onChange={(e) => handleAffiliationChange(idx, "city", e.target.value)}
                    className="w-full mb-2 border border-gray-300 px-3 py-2 rounded"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={a.state}
                    onChange={(e) => handleAffiliationChange(idx, "state", e.target.value)}
                    className="w-full mb-2 border border-gray-300 px-3 py-2 rounded"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    placeholder="Start Date"
                    value={a.startDate}
                    onChange={(e) => handleAffiliationChange(idx, "startDate", e.target.value)}
                    className="w-full mb-2 border border-gray-300 px-3 py-2 rounded"
                  />
                  <input
                    type="date"
                    placeholder="End Date"
                    value={a.endDate}
                    onChange={(e) => handleAffiliationChange(idx, "endDate", e.target.value)}
                    className="w-full mb-2 border border-gray-300 px-3 py-2 rounded"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Designation"
                  value={a.designation}
                  onChange={(e) => handleAffiliationChange(idx, "designation", e.target.value)}
                  className="w-full mb-2 border border-gray-300 px-3 py-2 rounded"
                />
                <div className="flex gap-2">
                  {formData.clinicHospitalAffiliations.length > 1 && (
                    <button type="button" onClick={() => removeAffiliation(idx)} className="text-red-600">Remove</button>
                  )}
                  {idx === formData.clinicHospitalAffiliations.length - 1 && (
                    <button type="button" onClick={addAffiliation} className="text-green-600">Add</button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Aadhaar */}
          <div>
            <label className="block text-sm font-semibold mb-1">Aadhaar Number (Optional)</label>
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
            <label className="block text-sm font-semibold mb-1">PAN Number (Optional)</label>
            <input
              type="text"
              name="panNumber"
              placeholder="Enter PAN"
              value={formData.panNumber}
              onChange={handleChange}
              className="w-full border border-gray-400 px-4 py-2 rounded-xl"
            />
          </div>

          {/* Profile Image (required) */}
          <div>
            <label className="block text-sm font-semibold mb-1">Profile Image (Required)</label>
            <input
              type="file"
              name="profileImage"
              accept="image/*"
              onChange={(e) => handleFileChange(e, setProfileImageFile)}
              required
              className="w-full border border-gray-300 px-3 py-2 rounded"
            />
            <small className="text-gray-500">Upload a clear professional headshot (JPEG/PNG).</small>
          </div>

          {/* Identity Document URL */}
          <div>
            <label className="block text-sm font-semibold mb-1">Identity Document URL</label>
            <input
              type="url"
              name="identityDocumentUrl"
              placeholder="https://example.com/id-proof.pdf"
              value={formData.identityDocumentUrl}
              onChange={handleChange}
              required
              className="w-full border border-gray-400 px-4 py-2 rounded-xl"
            />
          </div>

          {/* Medical Council Certificate URL */}
          <div>
            <label className="block text-sm font-semibold mb-1">Medical Council Certificate URL</label>
            <input
              type="url"
              name="medicalCouncilCertificateUrl"
              placeholder="https://example.com/council-cert.pdf"
              value={formData.medicalCouncilCertificateUrl}
              onChange={handleChange}
              required
              className="w-full border border-gray-400 px-4 py-2 rounded-xl"
            />
          </div>

          {/* Qualification Certificate URLs (dynamic) */}
          <div>
            <label className="block text-sm font-semibold mb-1">Qualification Certificate Files (you can select multiple)</label>
            <input
              type="file"
              multiple
              accept="application/pdf,image/*"
              onChange={(e) => handleFileChange(e, null, true)}
              className="w-full border border-gray-300 px-3 py-2 rounded"
            />
            <small className="text-gray-500">You can upload PDFs or images for your degree certificates. URLs are optional now.</small>
          </div>

          {/* Digital Signature Certificate ID (optional) */}
          <div>
            <label className="block text-sm font-semibold mb-1">Digital Signature Certificate ID (Optional)</label>
            <input
              type="text"
              name="digitalSignatureCertificateId"
              placeholder="Enter certificate ID"
              value={formData.digitalSignatureCertificateId}
              onChange={handleChange}
              className="w-full border border-gray-400 px-4 py-2 rounded-xl"
            />
          </div>

          {/* Submit */}
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
