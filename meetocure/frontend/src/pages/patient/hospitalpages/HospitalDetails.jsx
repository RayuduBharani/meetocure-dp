import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPhoneAlt, FaMapMarkedAlt } from "react-icons/fa";
import DoctorCardList from "../DoctorCard";

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
        setHospital(found || null);
        setError(null);
      } catch (e) {
        console.error(e);
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
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/doctor`);
        const data = await res.json();
        if (hospital && hospital.hospitalName) {
          const filtered = data.filter(doc =>
            Array.isArray(doc.hospitalInfo) &&
            doc.hospitalInfo.some(h => h.hospitalName === hospital.hospitalName)
          );
          setDoctors(filtered);
        } else {
          setDoctors([]);
        }
      } catch (e) {
        console.error(e);
        setDoctors([]);
      } finally {
        setLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, [hospital, id]);

  const mapsQuery = useMemo(() => {
    const q = hospital?.address || hospital?.hospitalName || "hospital";
    return `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
  }, [hospital]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-gray-500">
        Loading hospital details...
      </div>
    );
  }

  if (error || !hospital) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 px-6 text-center">
        {error || "Hospital not found"}
      </div>
    );
  }

  const phoneHref = hospital.contact ? `tel:${hospital.contact.replace(/\s+/g, "")}` : null;
  const directionsHref = hospital.address
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(hospital.address)}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.hospitalName)}`;

  // pick image field with sensible fallbacks
  const imageUrl = hospital?.image || hospital?.photo || hospital?.coverImage || hospital?.logo || "/assets/image.png";

  return (
    <div className="flex font-[Poppins] bg-[#F8FAFC] min-h-screen">
      <div className="flex-1 px-4 py-6 md:px-10 md:py-8 max-w-7xl mx-auto w-full">
        {/* Header with small avatar */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="p-2 rounded-md bg-white shadow text-[#0A4D68] hover:bg-gray-50"
          >
            <FaArrowLeft />
          </button>
          <div className="flex items-center gap-4">
            <img
              src={imageUrl}
              alt={hospital.hospitalName + " image"}
              className="w-14 h-14 rounded-lg object-cover border shadow-sm"
              loading="lazy"
            />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#0A4D68]">{hospital.hospitalName}</h1>
              <p className="text-sm text-gray-500 mt-1">{hospital.city || hospital.address}</p>
            </div>
          </div>
        </div>

        {/* Responsive layout: map + details (stack on mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left / Top: Image banner + Map (mobile first) */}
          <div className="md:col-span-2 order-1 md:order-1">
            <div className="bg-white rounded-2xl shadow overflow-hidden">
              {/* Large banner image */}
              <div className="w-full h-44 md:h-56 lg:h-72 relative">
                <img
                  src={imageUrl}
                  alt={`${hospital.hospitalName} banner`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h2 className="text-xl md:text-2xl font-semibold text-[#0A4D68]">{hospital.hospitalName}</h2>
                    <p className="text-gray-700 mt-2">{hospital.address}</p>
                    {hospital.email && <p className="text-gray-700 mt-1">Email: {hospital.email}</p>}
                    {hospital.contact && <p className="text-gray-700 mt-1">Contact: {hospital.contact}</p>}
                  </div>

                  <div className="flex gap-3 md:flex-col">
                    <a
                      href={phoneHref || "#"}
                      onClick={(e) => !phoneHref && e.preventDefault()}
                      className="inline-flex items-center gap-2 bg-[#0A4D68] text-white px-4 py-2 rounded-lg shadow"
                      title="Call hospital"
                    >
                      <FaPhoneAlt /> Call
                    </a>

                    <a
                      href={directionsHref}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 bg-[#0A4D68] text-white px-4 py-2 rounded-lg shadow"
                      title="Open directions"
                    >
                      <FaMapMarkedAlt /> Directions
                    </a>
                  </div>
                </div>

                {/* Details / description */}
                {hospital.description && (
                  <div className="mt-4 text-gray-700">
                    <h3 className="font-semibold text-[#0A4D68] mb-2">About</h3>
                    <p className="text-sm">{hospital.description}</p>
                  </div>
                )}

                {/* Embedded map */}
                <div className="mt-4 w-full h-56 rounded-lg overflow-hidden">
                  <iframe
                    title="hospital-map"
                    src={mapsQuery}
                    width="100%"
                    height="100%"
                    className="border-0"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Doctors list (desktop) */}
          <aside className="order-2 md:order-2">
            <div className="bg-white rounded-2xl shadow p-6 sticky top-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-[#0A4D68] mb-3">Doctors</h3>
                <span className="text-sm text-gray-600">{doctors?.length}</span>
              </div>

              {loadingDoctors ? (
                <div className="space-y-3">
                  <div className="h-12 bg-gray-100 rounded animate-pulse" />
                  <div className="h-12 bg-gray-100 rounded animate-pulse" />
                  <div className="h-12 bg-gray-100 rounded animate-pulse" />
                </div>
              ) : doctors.length === 0 ? (
                <div className="text-gray-500">No doctors listed for this hospital.</div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {doctors.map((doc) => (
                    <div
                      key={doc._id}
                      onClick={() => navigate(`/details/doctor/${doc.doctorId}`)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <img
                        src={doc.profileImage || "/assets/default-doctor.png"}
                        alt={doc.fullName || doc.name}
                        className="w-12 h-12 rounded-full object-cover border"
                      />
                      <div>
                        <div className="text-sm font-medium text-[#1F2A37]">{doc.fullName || doc.name}</div>
                        <div className="text-xs text-gray-500">{doc.category || doc.primarySpecialization || "General"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default HospitalDetails;
