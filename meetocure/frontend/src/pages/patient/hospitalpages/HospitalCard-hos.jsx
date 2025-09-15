
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, HospitalIcon, LocationPinIcon, RouteIcon, StarIcon } from './Icons';


const StarRating = ({ rating }) => {
    const totalStars = 5;
    return (
        <div className="flex items-center">
            {Array.from({ length: totalStars }, (_, index) => (
                <StarIcon key={index} className={`w-4 h-4 ${index < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`} />
            ))}
        </div>
    );
};




import { useNavigate } from "react-router-dom";

const HospitalCard = ({ hospital, onClick }) => (
    <div className="bg-white rounded-xl shadow p-5 hover:shadow-md transition cursor-pointer" onClick={onClick}>
        <div className="w-full h-44 overflow-hidden rounded-lg mb-4">
            <img
                src={hospital.hospitalImage || "/assets/default-hospital.png"}
                alt={hospital.hospitalName || "Hospital"}
                className="w-full h-full object-cover object-top"
            />
        </div>
        <h3 className="text-lg font-semibold text-[#1F2A37]">
            {hospital.hospitalName || "Unnamed Hospital"}
        </h3>
        <p className="text-sm text-gray-500">
            {hospital.address || "No address"}
        </p>
        <p className="text-sm text-gray-500">
            {hospital.contact || "No contact"}
        </p>
    </div>
);

const HospitalCardList = ({ title = "Nearby Hospitals" }) => {
    const navigate = useNavigate();
    const initialVisibleCount = 4;
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [visibleCount, setVisibleCount] = useState(initialVisibleCount);
    // Remove selectedHospital, hospitalDoctors, loadingDoctors

    useEffect(() => {
        const fetchHospitals = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/hospitals/hospitallogins`);
                const data = await res.json();
                setHospitals(data);
                setError(null);
            } catch {
                setError("Failed to fetch hospitals");
            } finally {
                setLoading(false);
            }
        };
        fetchHospitals();
    }, []);

    const handleLoadMore = () => setVisibleCount((prev) => prev + 4);
    const itemsToShow = hospitals?.slice(0, visibleCount);

    // Remove useEffect for selectedHospital

    if (loading) return <div>Loading hospitals...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    // Remove conditional rendering for selectedHospital

    return (
        <div className="mb-10">
            <div className="mb-6">
                <h2 className="text-2xl font-semibold text-[#1F2A37]">{title}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {itemsToShow?.map((hospital) => (
                    <HospitalCard key={hospital._id} hospital={{ ...hospital, hospitalImage: "/assets/image.png" }} onClick={() => navigate(`/hospital/${hospital._id}`)} />
                ))}
            </div>
            {visibleCount < hospitals?.length && (
                <div className="flex justify-center mt-6">
                    <button
                        onClick={handleLoadMore}
                        className="px-4 py-2 bg-[#0A4D68] text-white rounded-md hover:bg-[#083c52]"
                    >
                        Load More
                    </button>
                </div>
            )}
        </div>
    );
};

export default HospitalCardList;
// export default HospitalCard;
