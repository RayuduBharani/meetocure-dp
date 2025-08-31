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
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const loadingToast = toast.loading("Submitting verification...");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/doctor/verify-doctor/?doctorId=${doctorId}`,
        formData
      );

      toast.dismiss(loadingToast);

      if (res.data.success) {
        toast.success("Verification submitted successfully!");
        localStorage.setItem("doctorToken", res.data.token);
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

          {/* Registration Number */}
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

          {/* Council Name */}
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

          {/* Identity Doc */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Identity Document URL
            </label>
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

          {/* Council Certificate */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Medical Council Certificate URL
            </label>
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

          {/* Qualification Cert */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Qualification Certificate URL
            </label>
            <input
              type="url"
              name="qualificationCertificatesUrls"
              placeholder="https://example.com/degree.pdf"
              value={formData.qualificationCertificatesUrls[0]}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  qualificationCertificatesUrls: [e.target.value],
                }))
              }
              required
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
