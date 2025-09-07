import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../lib/config";
import { FaArrowLeft, FaUser, FaPhoneAlt, FaVenusMars, FaTrash } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import TopIcons from "../../../components/PatientTopIcons";
import toast from "react-hot-toast";

const recordTypes = [
  { value: "prescription", label: "Prescription" },
  { value: "ct_scan", label: "CT Scan" },
  { value: "xray", label: "X-Ray" },
  { value: "other", label: "Other" },
];

const PatientDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { date, time, doctorId } = location.state || {};
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    age: "",
    gender: "",
    blood_group: "",
    allergies: "", // comma separated
    medical_history_summary: "",
    reason: "",
  });
  // files: { file: File, record_type: string, description: string, id: number }
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!date || !time || !doctorId) {
      toast.error("Missing appointment details. Please select again.");
      navigate("/patient/appointments/datetime");
    }
  }, [location.state, navigate, date, time, doctorId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "age" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const handleGenderSelect = (gender) => {
    setFormData((prev) => ({ ...prev, gender }));
  };

  const validatePhone = (phone) => /^\d{10}$/.test(phone);

  const handleFilesChange = (e) => {
    const selected = Array.from(e.target.files || []);
    // merge new files, assign defaults
    const mapped = selected.map((f, idx) => ({
      id: Date.now() + idx,
      file: f,
      record_type: "other",
      description: "",
    }));
    setFiles((prev) => [...prev, ...mapped]);
  };

  const updateFileMeta = (id, key, value) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, [key]: value } : f)));
  };

  const removeFile = (id) => setFiles((prev) => prev.filter((f) => f.id !== id));

  const handleContinue = async () => {
    const { name, phone, age, gender, blood_group, allergies, medical_history_summary, reason } = formData;

    if (!name || !phone || !age || !gender) {
      toast.error("Please fill all required fields");
      return;
    }
    if (!validatePhone(phone)) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (age <= 0 || age > 120) {
      toast.error("Please enter a valid age.");
      return;
    }
    if (!doctorId || !date || !time) {
      toast.error("Appointment details missing. Please try again.");
      navigate("/patient/appointments/datetime");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Booking appointment...");

    try {
      const token = localStorage.getItem("token");
      const storedPatient = localStorage.getItem("user");
      const patientId = storedPatient ? JSON.parse(storedPatient)._id : null;

      if (!patientId) {
        toast.error("Patient not found. Please log in again.");
        setLoading(false);
        navigate("/dual-patient");
        return;
      }

      const data = new FormData();
      data.append("patient", patientId);
      data.append("doctor", doctorId);
      data.append("date", date);
      data.append("time", time);
      data.append("reason", reason || "Routine Checkup");

      // patientInfo includes the snapshot fields
      const patientInfoObj = {
        name,
        phone,
        age,
        gender: gender.toLowerCase(),
        blood_group: blood_group || null,
        allergies: allergies ? allergies.split(",").map(a => a.trim()).filter(Boolean) : [],
        medical_history_summary: medical_history_summary || "",
      };
      data.append("patientInfo", JSON.stringify(patientInfoObj));

      // append files and build metadata array in same order
      const meta = [];
      files.forEach((fObj) => {
        data.append("medicalRecords", fObj.file);
        meta.push({
          originalname: fObj.file.name,
          record_type: fObj.record_type,
          description: fObj.description || fObj.file.name,
        });
      });
      if (meta.length) data.append("medicalRecordsMeta", JSON.stringify(meta));

      await axios.post(`${API_BASE_URL}/api/appointments/book`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.dismiss(loadingToast);
      toast.success("Appointment booked in progress!");
      // for testing flow (payment later)
      window.location.href = "https://rzp.io/rzp/8l24wgPo";
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.dismiss(loadingToast);
      const msg = error.response?.data?.message || "Something went wrong!";
      toast.error(msg); 
    }
  };

  return (
    <div className="min-h-screen bg-white px-6 py-6 lg:px-20 lg:py-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-black">
            <FaArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold">Appointment</h1>
        </div>
        <TopIcons />
      </div>

      {/* Step Progress (unchanged) */}
      <div className="flex justify-center mb-10">
        <div className="flex items-center gap-6 text-center">
          <div>
            <div className="w-10 h-10 rounded-full bg-[#0A4D68] text-white flex items-center justify-center font-semibold">✓</div>
            <p className="text-sm text-[#0A4D68] mt-2">Date & Time</p>
          </div>
          <div className="w-10 h-px bg-gray-300 mt-4"></div>
          <div>
            <div className="w-10 h-10 rounded-full bg-[#0A4D68] text-white flex items-center justify-center font-semibold">2</div>
            <p className="text-sm text-[#0A4D68] mt-2">Patient Detail</p>
          </div>
          <div className="w-10 h-px bg-gray-300 mt-4"></div>
          <div>
            <div className="w-10 h-10 rounded-full bg-[#f3f4f6] text-gray-500 flex items-center justify-center font-semibold">3</div>
            <p className="text-sm text-gray-400 mt-2">Payment</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto bg-gray-50 rounded-2xl p-8 shadow-md space-y-6">
        {/* Patient Name */}
        <div>
          <label className="block font-semibold mb-1">Patient Name</label>
          <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2 gap-2 bg-white">
            <FaUser className="text-gray-500" />
            <input
              type="text"
              name="name"
              placeholder="Enter Patient Name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full focus:outline-none"
            />
          </div>
        </div>

        {/* Mobile Number */}
        <div>
          <label className="block font-semibold mb-1">Mobile Number</label>
          <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2 gap-2 bg-white">
            <FaPhoneAlt className="text-gray-500" />
            <input
              type="tel"
              name="phone"
              placeholder="Enter Mobile Number"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full focus:outline-none"
              maxLength={10}
            />
          </div>
        </div>

        {/* Age */}
        <div>
          <label className="block font-semibold mb-1">Age</label>
          <input
            type="number"
            name="age"
            placeholder="Enter Age"
            value={formData.age}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none bg-white"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block font-semibold mb-2">Gender</label>
          <div className="flex gap-4">
            {["Male", "Female", "Other"].map((g) => (
              <button
                key={g}
                onClick={() => handleGenderSelect(g)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-medium transition ${
                  formData.gender === g
                    ? "bg-[#0A4D68] text-white border-[#0A4D68]"
                    : "bg-white text-gray-700 border-gray-300 hover:border-[#0A4D68]"
                }`}
              >
                <FaVenusMars />
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Blood Group */}
        <div>
          <label className="block font-semibold mb-1">Blood Group</label>
          <select
            name="blood_group"
            value={formData.blood_group}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
          >
            <option value="">Select blood group (optional)</option>
            {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
          </select>
        </div>

        {/* Allergies */}
        <div>
          <label className="block font-semibold mb-1">Allergies (comma separated)</label>
          <input
            type="text"
            name="allergies"
            placeholder="e.g. Penicillin, Pollen"
            value={formData.allergies}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
          />
        </div>

        {/* Medical History Summary */}
        <div>
          <label className="block font-semibold mb-1">Medical History Summary</label>
          <textarea
            name="medical_history_summary"
            value={formData.medical_history_summary}
            onChange={handleInputChange}
            rows={3}
            className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
            placeholder="Short summary of medical history (optional)"
          />
        </div>

        {/* Reason for Visit */}
        <div>
          <label className="block font-semibold mb-1">Reason for Visit</label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleInputChange}
            rows={2}
            className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
            placeholder="Reason (optional)"
          />
        </div>

        {/* Medical Records Upload */}
        <div>
          <label className="block font-semibold mb-1">Medical Records (optional)</label>
          <input
            type="file"
            name="medicalRecords"
            multiple
            accept="image/*,application/pdf"
            onChange={handleFilesChange}
            className="block w-full"
          />
          {files.length > 0 && (
            <div className="mt-3 space-y-2">
              {files.map((fObj) => (
                <div key={fObj.id} className="flex items-center gap-3 bg-white p-3 rounded-lg border">
                  <div className="flex-1">
                    <div className="font-medium">{fObj.file.name}</div>
                    <div className="flex gap-2 mt-2">
                      <select
                        value={fObj.record_type}
                        onChange={(e) => updateFileMeta(fObj.id, "record_type", e.target.value)}
                        className="border rounded px-2 py-1"
                      >
                        {recordTypes.map(rt => <option key={rt.value} value={rt.value}>{rt.label}</option>)}
                      </select>
                      <input
                        type="text"
                        placeholder="Description (optional)"
                        value={fObj.description}
                        onChange={(e) => updateFileMeta(fObj.id, "description", e.target.value)}
                        className="flex-1 border rounded px-2 py-1"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(fObj.id)}
                    className="text-red-500 p-2"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Continue Button */}
        <div className="pt-4 flex justify-center sm:justify-end">
          <button
            onClick={handleContinue}
            disabled={
              loading ||
              !formData.name ||
              !formData.phone ||
              !formData.age ||
              !formData.gender
            }
            className={`w-full sm:w-auto px-6 py-3 rounded-xl text-white font-semibold text-lg transition ${
              !loading &&
              formData.name &&
              formData.phone &&
              formData.age &&
              formData.gender
                ? "bg-[#0A4D68] hover:bg-[#083952]"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {loading ? "Booking..." : "Book Appointment"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;
