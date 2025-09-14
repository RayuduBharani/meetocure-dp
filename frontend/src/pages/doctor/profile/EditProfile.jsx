import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPencilAlt, FaPlus, FaTrash } from "react-icons/fa";
import TopIcons from "../../../components/TopIcons";
import axios from "axios";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../../../lib/config";

const EditProfile = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    primarySpecialization: "",
    category: "",
    experienceYears: "",
    gender: "",
    dateOfBirth: "",
    profileImage: "",
    consultationFee: "",
    about: "",
    hospitalInfo: [], // { hospitalName, hospitalAddress, contactNumber }
    bankingInfo: [], // { bankName, bankBranch, accountHolderName, accountNumber, ifscCode }
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
          fullName: data.fullName || "",
          primarySpecialization: data.primarySpecialization || "",
          category: data.category || "",
          experienceYears: data.experienceYears?.toString?.() || "",
          gender: data.gender || "",
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().slice(0, 10) : "",
          profileImage: data.profileImage || "",
          consultationFee: data.consultationFee?.toString?.() || "",
          about: data.about || "",
          hospitalInfo: Array.isArray(data.hospitalInfo) ? data.hospitalInfo : [],
          bankingInfo: Array.isArray(data.bankingInfo) ? data.bankingInfo : [],
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
      
      // Prepare form data for file upload
      const payload = {
        fullName: form.fullName,
        primarySpecialization: form.primarySpecialization,
        category: form.category,
        experienceYears: form.experienceYears,
        gender: form.gender,
        dateOfBirth: form.dateOfBirth,
        consultationFee: Number(form.consultationFee) || 0,
        about: form.about,
        hospitalInfo: form.hospitalInfo,
        bankingInfo: form.bankingInfo,
      };

      // Add profile image if it exists and is changed
      if (form.profileImage && form.profileImage.startsWith('data:image')) {
        payload.profileImage = form.profileImage.data;
      }


      try {
        await toast.promise(
          axios.put(`${API_BASE_URL}/api/doctor/profile`, payload, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }),
          {
            loading: "Updating profile...",
            success: "Profile updated successfully!",
            error: "Failed to update profile"
          }
        );

        navigate("/doctor/profile");
      } catch (err) {
       
        const errorMessage = err.response?.data?.message || "Failed to update profile";
        toast.error(errorMessage);
      }
    } catch (err) {
      console.error("Profile update error:", err);
      toast.error("Failed to update profile");
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

      <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
        {/* Profile Image */}
        <section className="bg-white border rounded-2xl shadow-sm p-6">
          <div className="flex flex-col items-center">
            <div className="rounded-full p-1 bg-white shadow-xl relative w-32 h-32">
              <img 
                src={form.profileImage || "/assets/doc_profile.png"} 
                alt="Profile" 
                className="w-full h-full object-cover rounded-full border-4 border-white shadow-inner" 
              />
              
            </div>
          </div>
        </section>

        {/* Basic Information */}
        <section className="bg-white border rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input 
                type="text" 
                value={form.fullName} 
                onChange={(e) => updateField("fullName", e.target.value)} 
                className="w-full border rounded-lg px-3 py-2" 
                placeholder="Enter full name" 
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Specialization</label>
              <input 
                type="text" 
                value={form.primarySpecialization} 
                onChange={(e) => updateField("primarySpecialization", e.target.value)} 
                className="w-full border rounded-lg px-3 py-2" 
                placeholder="e.g. Cardiology" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select 
                value={form.category} 
                onChange={(e) => updateField("category", e.target.value)} 
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Select Category</option>
                <option value="General">General</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Dentistry">Dentistry</option>
                <option value="Pulmonology">Pulmonology</option>
                <option value="Neurology">Neurology</option>
                <option value="Gastroenterology">Gastroenterology</option>
                <option value="Laboratory">Laboratory</option>
                <option value="Vaccination">Vaccination</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
              <input 
                type="number" 
                min="0" 
                value={form.experienceYears} 
                onChange={(e) => updateField("experienceYears", e.target.value)} 
                className="w-full border rounded-lg px-3 py-2" 
                placeholder="e.g. 5" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee (₹)</label>
              <input 
                type="number" 
                value={form.consultationFee} 
                onChange={(e) => updateField("consultationFee", e.target.value)} 
                className="w-full border rounded-lg px-3 py-2" 
                placeholder="Enter consultation fee" 
                min="0"
                required
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">About</label>
            <textarea 
              value={form.about} 
              onChange={(e) => updateField("about", e.target.value)} 
              className="w-full border rounded-lg px-3 py-2" 
              placeholder="Write about your practice and experience" 
              rows="4"
              required
            />
          </div>
        </section>

        {/* Personal Information */}
        <section className="bg-white border rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select 
                value={form.gender} 
                onChange={(e) => updateField("gender", e.target.value)} 
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input 
                type="date" 
                value={form.dateOfBirth} 
                onChange={(e) => updateField("dateOfBirth", e.target.value)} 
                className="w-full border rounded-lg px-3 py-2" 
              />
            </div>
          </div>
        </section>

        {/* Hospital Info */}
        <section className="bg-white border rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Hospital Information</h2>
            <button 
              type="button" 
              onClick={() => addListItem("hospitalInfo", { hospitalName: "", hospitalAddress: "", contactNumber: "" })} 
              className="flex items-center gap-2 px-3 py-2 rounded-md bg-[#0A4D68] text-white text-sm"
            >
              <FaPlus /> Add Hospital
            </button>
          </div>
          {form.hospitalInfo?.length ? (
            <div className="space-y-4">
              {form.hospitalInfo.map((h, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end border rounded-lg p-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Name</label>
                    <input 
                      type="text" 
                      value={h.hospitalName || ""} 
                      onChange={(e) => updateListItem("hospitalInfo", idx, "hospitalName", e.target.value)} 
                      className="w-full border rounded-lg px-3 py-2" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input 
                      type="text" 
                      value={h.hospitalAddress || ""} 
                      onChange={(e) => updateListItem("hospitalInfo", idx, "hospitalAddress", e.target.value)} 
                      className="w-full border rounded-lg px-3 py-2" 
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                      <input 
                        type="text" 
                        value={h.contactNumber || ""} 
                        onChange={(e) => updateListItem("hospitalInfo", idx, "contactNumber", e.target.value)} 
                        className="w-full border rounded-lg px-3 py-2" 
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeListItem("hospitalInfo", idx)} 
                      className="text-red-600 p-2 hover:bg-red-50 rounded-lg"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No hospital information added</p>
          )}
        </section>

        {/* Banking Info */}
        <section className="bg-white border rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Banking Information</h2>
            <button 
              type="button" 
              onClick={() => addListItem("bankingInfo", { 
                bankName: "", 
                bankBranch: "", 
                accountHolderName: "", 
                accountNumber: "", 
                ifscCode: "" 
              })} 
              className="flex items-center gap-2 px-3 py-2 rounded-md bg-[#0A4D68] text-white text-sm"
            >
              <FaPlus /> Add Bank Account
            </button>
          </div>
          {form.bankingInfo?.length ? (
            <div className="space-y-4">
              {form.bankingInfo.map((b, idx) => (
                <div key={idx} className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                      <input 
                        type="text" 
                        value={b.bankName || ""} 
                        onChange={(e) => updateListItem("bankingInfo", idx, "bankName", e.target.value)} 
                        className="w-full border rounded-lg px-3 py-2" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                      <input 
                        type="text" 
                        value={b.bankBranch || ""} 
                        onChange={(e) => updateListItem("bankingInfo", idx, "bankBranch", e.target.value)} 
                        className="w-full border rounded-lg px-3 py-2" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder</label>
                      <input 
                        type="text" 
                        value={b.accountHolderName || ""} 
                        onChange={(e) => updateListItem("bankingInfo", idx, "accountHolderName", e.target.value)} 
                        className="w-full border rounded-lg px-3 py-2" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                      <input 
                        type="text" 
                        value={b.accountNumber || ""} 
                        onChange={(e) => updateListItem("bankingInfo", idx, "accountNumber", e.target.value)} 
                        className="w-full border rounded-lg px-3 py-2" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                      <input 
                        type="text" 
                        value={b.ifscCode || ""} 
                        onChange={(e) => updateListItem("bankingInfo", idx, "ifscCode", e.target.value)} 
                        className="w-full border rounded-lg px-3 py-2" 
                      />
                    </div>
                    <div className="flex items-center">
                      <button 
                        type="button" 
                        onClick={() => removeListItem("bankingInfo", idx)} 
                        className="text-red-600 p-2 hover:bg-red-50 rounded-lg"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No banking details added</p>
          )}
        </section>

        {/* Submit Button */}
        <div>
          <button 
            type="submit" 
            className="w-full bg-[#0A4D68] text-white py-3 rounded-full font-semibold text-lg shadow-md hover:bg-[#083e54] transition"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
