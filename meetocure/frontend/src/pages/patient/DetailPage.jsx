import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaUserFriends, FaRegCommentDots } from "react-icons/fa";
import { BsAwardFill, BsStarFill } from "react-icons/bs";
import { ChevronLeft } from "lucide-react";
import PatientTopIcons from "../../components/PatientTopIcons";

const DetailPage = () => {
  const { id } = useParams(); // doctorId from URL
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/doctor/${id}`);
        if (!res.ok) throw new Error("Failed to fetch doctor");

        const data = await res.json();
        setDoctor(data);
      } catch (error) {
        console.error("Error fetching doctor:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading doctor details...</p>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Doctor not found</h2>
          <p className="text-gray-600 mb-6">
            The doctor you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="bg-[#0c4d6b] text-white px-6 py-2 rounded-lg hover:bg-[#0a3d5a]"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Small reusable stat component
  const StatItem = ({ icon, value, label }) => (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-[#0c4d6b] text-2xl">
        {icon}
      </div>
      <p className="font-bold text-gray-800 text-lg">{value}</p>
      <p className="text-gray-500 text-sm">{label}</p>
    </div>
  );

  return (
    <div className="pb-28 flex-auto bg-white">
      {/* Header */}
      <header className="p-8 flex justify-between bg-gray-50 shadow-sm">
        <div className="flex-row">
          <button onClick={() => navigate(-1)} className="text-2xl text-gray-700">
            <ChevronLeft />
          </button>
          <h1 className="text-xl ml-10 -mt-8 font-bold text-gray-800">
            Doctor Details
          </h1>
        </div>
        <div className="gap-2 ml-200 mr-8">
          <PatientTopIcons />
        </div>
      </header>

      <main className="p-4 max-w-8xl mx-auto">
        {/* Main Info */}
        <div className="bg-white rounded-xl shadow-lg p-4 flex gap-4 items-center mb-8">
          <img
            src={doctor.profileImage || "/assets/default-doctor.png"}
            alt={doctor.fullName}
            className="w-24 h-24 rounded-full object-cover"
          />
          <div className="flex-grow">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">
              {doctor.fullName}
            </h2>
            <div className="flex items-center gap-4 text-gray-600 mb-1">
              <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                {doctor.category || "General Practitioner"}
              </span>
            </div>
            <p className="text-gray-500 flex items-center gap-1">
              {doctor.location.city || "Location not available"}
            </p>
          </div>
          <i className="far fa-heart text-2xl text-gray-400 cursor-pointer"></i>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center py-8 mb-8">
          <StatItem icon={<FaUserFriends />} value={doctor.patients || 0} label="patients" />
          <StatItem icon={<BsAwardFill />} value={doctor.experience || 0} label="experience" />
          <StatItem icon={<BsStarFill />} value={doctor.rating || "N/A"} label="rating" />
          <StatItem icon={<FaRegCommentDots />} value={doctor.reviews || 0} label="reviews" />
        </div>

        {/* Contact & About */}
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">
              Contact Details
            </h3>
            <p className="text-gray-700">Contact: {doctor.contact || "N/A"}</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">
              About Doctor
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {doctor.about || `${doctor.fullName} is a specialist doctor with ${doctor.experience || 0} years of experience.`}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DetailPage;
