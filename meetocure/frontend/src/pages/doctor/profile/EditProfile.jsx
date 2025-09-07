import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPencilAlt, FaPlus, FaTrash } from "react-icons/fa";
import TopIcons from "../../../components/TopIcons";
import profileImg from "/assets/doc_profile.png";
import axios from "axios";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../../../lib/config";

const EditProfile = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    // Header
    profileImage: profileImg,
    fullName: "",
    primarySpecialization: "",
    verified: false,

    // Overview
    category: "",
    experienceYears: "",

    // Personal Information
    gender: "",
    dateOfBirth: "",
    medicalCouncilRegistrationNumber: "",
    medicalCouncilName: "",
    yearOfRegistration: "",
    additionalSpecializations: "",
    aadhaarNumber: "",
    panNumber: "",

    // Lists
    qualifications: [], // { degree, universityCollege, year }
    hospitalInfo: [], // { hospitalName, hospitalAddress, contactNumber }
    bankingInfo: [], // { bankName, bankBranch, accountHolderName, accountNumber, ifscCode }

    // Documents
    identityDocument: "",
    medicalCouncilCertificate: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("doctorToken");
        const res = await axios.get(`${API_BASE_URL}/api/doctor/profile`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        const data = res.data || {};
        setForm((prev) => ({
          ...prev,
          profileImage: data.profileImage || profileImg,
          fullName: data.fullName || "",
          primarySpecialization: data.primarySpecialization || "",
          verified: !!data.verified,
          category: data.category || "",
          experienceYears: data.experienceYears?.toString?.() || "",
          gender: data.gender || "",
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().slice(0, 10) : "",
          medicalCouncilRegistrationNumber: data.medicalCouncilRegistrationNumber || "",
          medicalCouncilName: data.medicalCouncilName || "",
          yearOfRegistration: data.yearOfRegistration?.toString?.() || "",
          additionalSpecializations: data.additionalSpecializations || "",
          aadhaarNumber: data.aadhaarNumber || "",
          panNumber: data.panNumber || "",
          qualifications: Array.isArray(data.qualifications) ? data.qualifications : [],
          hospitalInfo: Array.isArray(data.hospitalInfo) ? data.hospitalInfo : [],
          bankingInfo: Array.isArray(data.bankingInfo) ? data.bankingInfo : [],
          identityDocument: data.identityDocument || "",
          medicalCouncilCertificate: data.medicalCouncilCertificate || "",
        }));
      } catch (err) {
        const status = err?.response?.status;
        if (status === 401) {
          localStorage.removeItem("doctorToken");
          localStorage.removeItem("doctorInfo");
          window.location.href = "/doctor-verify";
          return;
        }
        if (status === 404) {
          // No existing profile yet – proceed with defaults silently
        } else {
          toast.error("Failed to fetch profile");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onImagePick = (name) => (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => updateField(name, reader.result);
    reader.readAsDataURL(file);
  };

  const addListItem = (listName, emptyItem) => {
    setForm((prev) => ({ ...prev, [listName]: [...(prev[listName] || []), emptyItem] }));
  };

  const updateListItem = (listName, index, key, value) => {
    setForm((prev) => {
      const copy = [...(prev[listName] || [])];
      copy[index] = { ...(copy[index] || {}), [key]: value };
      return { ...prev, [listName]: copy };
    });
  };

  const removeListItem = (listName, index) => {
    setForm((prev) => {
      const copy = [...(prev[listName] || [])];
      copy.splice(index, 1);
      return { ...prev, [listName]: copy };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("doctorToken");
      const payload = { ...form };

      await toast.promise(
        axios.put(`${API_BASE_URL}/api/doctor/profile/update`, payload, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }),
        {
          loading: "Updating profile...",
          success: "Profile updated successfully!",
          error: "Failed to update profile",
        }
      );

      navigate("/doctor/profile");
    } catch (_) {
      // handled by toast
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-gray-500">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFC] font-[Poppins] px-6 pt-6 pb-28">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <FaArrowLeft className="text-2xl text-[#1F2A37] cursor-pointer" onClick={() => navigate(-1)} />
          <h1 className="text-[22px] font-semibold text-[#1F2A37]">Edit Profile</h1>
        </div>
        <TopIcons />
      </div>

      {/* Header - Profile Image and basic info */}
      <div className="bg-white border rounded-2xl shadow-sm p-6 mb-8 max-w-4xl mx-auto">
        <div className="flex flex-col items-center">
          <div className="rounded-full p-1 bg-white shadow-xl relative">
            <img src={form.profileImage || profileImg} alt="Doctor" className="w-32 h-32 object-cover rounded-full border-4 border-white shadow-inner" />
            <label className="absolute -bottom-2 -right-2 bg-[#0A4D68] p-2 rounded-full cursor-pointer shadow-md">
              <FaPencilAlt className="text-white text-sm" />
              <input type="file" accept="image/*" onChange={onImagePick("profileImage")} className="hidden" />
            </label>
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" value={form.fullName} onChange={(e) => updateField("fullName", e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="Enter full name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Specialization</label>
              <input type="text" value={form.primarySpecialization} onChange={(e) => updateField("primarySpecialization", e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="e.g. Cardiology" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input type="text" value={form.category} onChange={(e) => updateField("category", e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="e.g. Doctor" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
              <input type="number" min="0" value={form.experienceYears} onChange={(e) => updateField("experienceYears", e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="e.g. 5" />
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto">
        <section className="bg-white border rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select value={form.gender} onChange={(e) => updateField("gender", e.target.value)} className="w-full border rounded-lg px-3 py-2">
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input type="date" value={form.dateOfBirth} onChange={(e) => updateField("dateOfBirth", e.target.value)} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Medical Council Reg. No</label>
              <input type="text" value={form.medicalCouncilRegistrationNumber} onChange={(e) => updateField("medicalCouncilRegistrationNumber", e.target.value)} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Medical Council Name</label>
              <input type="text" value={form.medicalCouncilName} onChange={(e) => updateField("medicalCouncilName", e.target.value)} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year of Registration</label>
              <input type="number" min="1900" max="2100" value={form.yearOfRegistration} onChange={(e) => updateField("yearOfRegistration", e.target.value)} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Specializations</label>
              <input type="text" value={form.additionalSpecializations} onChange={(e) => updateField("additionalSpecializations", e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="Comma-separated" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar</label>
              <input type="text" value={form.aadhaarNumber} onChange={(e) => updateField("aadhaarNumber", e.target.value)} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PAN</label>
              <input type="text" value={form.panNumber} onChange={(e) => updateField("panNumber", e.target.value)} className="w-full border rounded-lg px-3 py-2" />
            </div>
          </div>
        </section>

        {/* Qualifications */}
        <section className="bg-white border rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Education & Qualifications</h2>
            <button type="button" onClick={() => addListItem("qualifications", { degree: "", universityCollege: "", year: "" })} className="flex items-center gap-2 px-3 py-2 rounded-md bg-[#0A4D68] text-white text-sm">
              <FaPlus /> Add
            </button>
          </div>
          {form.qualifications?.length ? (
            <div className="space-y-4">
              {form.qualifications.map((q, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                  <div className="sm:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                    <input type="text" value={q.degree || ""} onChange={(e) => updateListItem("qualifications", idx, "degree", e.target.value)} className="w-full border rounded-lg px-3 py-2" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">University/College</label>
                    <input type="text" value={q.universityCollege || ""} onChange={(e) => updateListItem("qualifications", idx, "universityCollege", e.target.value)} className="w-full border rounded-lg px-3 py-2" />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                    <input type="number" value={q.year || ""} onChange={(e) => updateListItem("qualifications", idx, "year", e.target.value)} className="w-full border rounded-lg px-3 py-2" />
                  </div>
                  <button type="button" onClick={() => removeListItem("qualifications", idx)} className="justify-self-start sm:justify-self-end text-red-600 p-2">
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No qualifications added</p>
          )}
        </section>

        {/* Hospital Info */}
        <section className="bg-white border rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Hospital Information</h2>
            <button type="button" onClick={() => addListItem("hospitalInfo", { hospitalName: "", hospitalAddress: "", contactNumber: "" })} className="flex items-center gap-2 px-3 py-2 rounded-md bg-[#0A4D68] text-white text-sm">
              <FaPlus /> Add
            </button>
          </div>
          {form.hospitalInfo?.length ? (
            <div className="space-y-4">
              {form.hospitalInfo.map((h, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Name</label>
                    <input type="text" value={h.hospitalName || ""} onChange={(e) => updateListItem("hospitalInfo", idx, "hospitalName", e.target.value)} className="w-full border rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input type="text" value={h.hospitalAddress || ""} onChange={(e) => updateListItem("hospitalInfo", idx, "hospitalAddress", e.target.value)} className="w-full border rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                    <input type="text" value={h.contactNumber || ""} onChange={(e) => updateListItem("hospitalInfo", idx, "contactNumber", e.target.value)} className="w-full border rounded-lg px-3 py-2" />
                  </div>
                  <button type="button" onClick={() => removeListItem("hospitalInfo", idx)} className="justify-self-start sm:justify-self-end text-red-600 p-2">
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No hospital information</p>
          )}
        </section>

        {/* Banking Info */}
        <section className="bg-white border rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Banking Information</h2>
            <button type="button" onClick={() => addListItem("bankingInfo", { bankName: "", bankBranch: "", accountHolderName: "", accountNumber: "", ifscCode: "" })} className="flex items-center gap-2 px-3 py-2 rounded-md bg-[#0A4D68] text-white text-sm">
              <FaPlus /> Add
            </button>
          </div>
          {form.bankingInfo?.length ? (
            <div className="space-y-4">
              {form.bankingInfo.map((b, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                    <input type="text" value={b.bankName || ""} onChange={(e) => updateListItem("bankingInfo", idx, "bankName", e.target.value)} className="w-full border rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                    <input type="text" value={b.bankBranch || ""} onChange={(e) => updateListItem("bankingInfo", idx, "bankBranch", e.target.value)} className="w-full border rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder</label>
                    <input type="text" value={b.accountHolderName || ""} onChange={(e) => updateListItem("bankingInfo", idx, "accountHolderName", e.target.value)} className="w-full border rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                    <input type="text" value={b.accountNumber || ""} onChange={(e) => updateListItem("bankingInfo", idx, "accountNumber", e.target.value)} className="w-full border rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">IFSC</label>
                    <input type="text" value={b.ifscCode || ""} onChange={(e) => updateListItem("bankingInfo", idx, "ifscCode", e.target.value)} className="w-full border rounded-lg px-3 py-2" />
                  </div>
                  <button type="button" onClick={() => removeListItem("bankingInfo", idx)} className="justify-self-start sm:justify-self-end text-red-600 p-2">
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No banking details available</p>
          )}
        </section>

        {/* Documents */}
        <section className="bg-white border rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Documents</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="font-medium text-xs text-gray-600 mb-2">Identity Document</p>
              <div className="w-full aspect-[4/3] border rounded-lg overflow-hidden bg-gray-50 relative">
                <img src={form.identityDocument || profileImg} alt="Identity" className="w-full h-full object-cover" />
                <label className="absolute bottom-2 right-2 bg-[#0A4D68] text-white px-3 py-1 rounded cursor-pointer text-xs">
                  Change
                  <input type="file" accept="image/*" onChange={onImagePick("identityDocument")} className="hidden" />
                </label>
              </div>
            </div>
            <div>
              <p className="font-medium text-xs text-gray-600 mb-2">Medical Council Certificate</p>
              <div className="w-full aspect-[4/3] border rounded-lg overflow-hidden bg-gray-50 relative">
                <img src={form.medicalCouncilCertificate || profileImg} alt="Certificate" className="w-full h-full object-cover" />
                <label className="absolute bottom-2 right-2 bg-[#0A4D68] text-white px-3 py-1 rounded cursor-pointer text-xs">
                  Change
                  <input type="file" accept="image/*" onChange={onImagePick("medicalCouncilCertificate")} className="hidden" />
                </label>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-5xl mx-auto">
          <button type="submit" className="w-full mt-2 bg-[#0A4D68] text-white py-3 rounded-full font-semibold text-lg shadow-md hover:bg-[#083e54] transition">Save</button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
