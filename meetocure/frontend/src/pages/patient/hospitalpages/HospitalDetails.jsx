import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DoctorCardList from "../DoctorCard";
import { FaArrowLeft } from "react-icons/fa";

const HospitalDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [hospital, setHospital] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingDoctors, setLoadingDoctors] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHospital = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/hospitals/hospitallogins`);
                const data = await res.json();
                const found = data.find(h => h._id === id);
                setHospital(found);
                setError(null);
            } catch {
                setError("Failed to fetch hospital details");
            } finally {
                setLoading(false);
            }
        };
        fetchHospital();
    }, [id]);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                setLoadingDoctors(true);
                // Fetch all doctors from DoctorVerificationShema
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/doctor`);
                const data = await res.json();
                // Filter doctors whose hospitalInfo[].hospitalName matches current hospital
                if (hospital && hospital.hospitalName) {
                    const filtered = data.filter(doc =>
                        Array.isArray(doc.hospitalInfo) &&
                        doc.hospitalInfo.some(h => h.hospitalName === hospital.hospitalName)
                    );
                    setDoctors(filtered);
                } else {
                    setDoctors([]);
                }
            } catch {
                setDoctors([]);
            } finally {
                setLoadingDoctors(false);
            }
        };
        fetchDoctors();
    }, [id, hospital]);

    if (loading) return <div className="min-h-screen flex items-center justify-center text-lg text-gray-500">Loading hospital details...</div>;
    if (error || !hospital) return <div className="min-h-screen flex items-center justify-center text-red-500">{error || "Hospital not found"}</div>;

    return (
        <div className="flex font-[Poppins] bg-[#F8FAFC] min-h-screen">
            <div className="flex-1 min-h-screen px-6 py-6 pb-20 md:pb-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div className="p-3 flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center justify-center w-6 h-2 rounded-full bg-transparent hover:bg-gray-100 text-3xl text-gray-600"
                            aria-label="Go back"
                        >
                        <FaArrowLeft />
                            {/* <span style={{ fontSize: '2rem', fontWeight: 600 }}>&larr;</span> */}
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-[#0A4D68]">{hospital.hospitalName}</h1>
                            <div className="flex items-center gap-2 text-[#0A4D68] text-sm">
                                {/* <span>{hospital.address}</span> */}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-8 mb-10 w-full">
                    <div className="flex flex-col md:flex-row gap-10 items-center w-full">
                        <img
                            src={hospital.hospitalImage || "/assets/image.png"}
                            alt={hospital.hospitalName || "Hospital"}
                            className="w-56 h-56 object-cover rounded-2xl border-4 border-[#0A4D68] shadow"
                        />
                        <div className="flex-1">
                            <h2 className="text-3xl font-bold text-[#0A4D68] mb-3">{hospital.hospitalName}</h2>
                            <p className="text-gray-700 mb-2 text-lg">{hospital.address}</p>
                            <p className="text-gray-700 mb-2 text-lg">Contact: {hospital.contact}</p>
                            <p className="text-gray-700 text-lg">Email: {hospital.email}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-8 w-full">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-semibold text-[#0A4D68]">Doctors in this Hospital</h3>
                        <div className="text-sm text-gray-600">{doctors.length} doctor{doctors.length !== 1 ? 's' : ''}</div>
                    </div>
                    {loadingDoctors ? (
                        <div className="text-center text-lg text-gray-500">Loading doctors...</div>
                    ) : doctors.length === 0 ? (
                        <div className="text-center text-gray-500 text-lg py-12">No doctors found for this hospital.</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
                            {doctors.map(doc => (
                                <div
                                    key={doc._id}
                                    className="cursor-pointer"
                                    onClick={() => navigate(`/details/doctor/${doc.doctorId}`)}
                                >
                                    <div className="bg-[#f0f8ff] rounded-xl shadow p-5 hover:shadow-md transition h-full flex flex-col items-center">
                                        <img
                                            src={doc.profileImage || "/assets/default-doctor.png"}
                                            alt={doc.fullName || doc.name || "Doctor"}
                                            className="w-24 h-24 object-cover rounded-full mb-4 border-2 border-[#0A4D68]"
                                        />
                                        <h3 className="text-lg font-semibold text-[#1F2A37] text-center mb-1">
                                            {doc.fullName || doc.name || "Unnamed Doctor"}
                                        </h3>
                                        <p className="text-sm text-gray-500 text-center">
                                            {doc.category || doc.primarySpecialization || "General Practitioner"}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HospitalDetails;
