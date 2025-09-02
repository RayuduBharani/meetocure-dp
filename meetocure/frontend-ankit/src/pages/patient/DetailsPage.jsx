import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaStar, FaMapMarkerAlt, FaClock, FaPhone, FaUser, FaCalendarAlt, FaHeart } from 'react-icons/fa';
import PatientTopIcons from '../../components/PatientTopIcons';
import axios from 'axios';

const DetailsPage = () => {
  const { id } = useParams(); // doctor id
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  // ✅ Fetch doctor details using ID from backend
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/doctor/${id}`);
        setDoctor(res.data);
        console.log("Fetched doctor data:", res.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching doctor:", err);
        setError(err.response?.data?.message || "Failed to fetch doctor details");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading doctor details...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-gray-500">Doctor not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white p-5 shadow-sm border-b sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-800">
            <FaArrowLeft />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">Doctor Details</h1>
          <div className="w-28">
            <PatientTopIcons />
          </div>
        </div>
      </div>

      {/* Doctor Info */}
      <div className="px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-start gap-4">
            <img
              src={doctor.profileImage || "/assets/default-doctor.png"}
              alt={doctor.fullName}
              className="w-20 h-20 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-xl font-bold text-gray-800 mb-1">{doctor.fullName}</h1>
                  <p className="text-gray-600 mb-2">{doctor.primarySpecialization || doctor.specialization}</p>
                  <div className="flex items-center gap-1 text-gray-500 text-sm">
                    <FaMapMarkerAlt className="w-3 h-3" />
                    <span>{doctor.clinicHospitalAffiliations[0].city || "Location not available"}</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`p-2 rounded-full transition-colors ${isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                >
                  
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <FaUser className="mx-auto text-cyan-800 mb-2" />
              <div className="font-bold text-gray-800">{doctor.patients || 0}</div>
              <div className="text-xs text-gray-500">patients</div>
            </div>
            <div>
              <FaCalendarAlt className="mx-auto text-cyan-800 mb-2" />
              <div className="font-bold text-gray-800">{doctor.experienceYears || 0}</div>
              <div className="text-xs text-gray-500">experience</div>
            </div>
            <div>
              <FaStar className="mx-auto text-cyan-800 mb-2" />
              <div className="font-bold text-gray-800">{doctor.rating || 0}</div>
              <div className="text-xs text-gray-500">rating</div>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">About me</h2>
          <p className="text-gray-600 leading-relaxed">
            {doctor.about || "No additional details provided."}
          </p>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Contact Information</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <FaPhone className="text-cyan-800 w-4 h-4" />
              <span>{doctor.contact || "N/A"}</span>
            </div>
            <div className="flex items-center gap-3">
              <FaMapMarkerAlt className="text-cyan-800 w-4 h-4" />
              <span>{doctor.location || "N/A"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Booking */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-700 text-white p-4 flex justify-between items-center">
        <div>
          <div className="text-sm text-gray-300">Consultation Fee</div>
          <div className="text-xl font-bold">₹ 250</div>
        </div>
        <button
          onClick={() => navigate(`/patient/appointments/datetime?doctorId=${doctor._id}`)}
          className="bg-cyan-800 px-6 py-3 rounded-lg font-medium hover:bg-cyan-700 transition"
        >
          <FaCalendarAlt className="inline-block mr-2" />
          Book Now
        </button>
      </div>
    </div>
  );
};

export default DetailsPage;
