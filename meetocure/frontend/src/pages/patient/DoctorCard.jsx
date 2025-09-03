import React, { useState } from "react";
import { Link } from "react-router-dom";

const DoctorCard = ({ doctor }) => (
  <Link
    to={`/details/doctor/${doctor.id}`} // redirect to doctor details
    className="block"
  >
    <div className="bg-white rounded-xl shadow p-5 hover:shadow-md transition">
      <div className="w-full h-44 overflow-hidden rounded-lg mb-4">
        <img
          src={doctor.profileImage || "/assets/default-doctor.png"}
          alt={doctor.fullName || "Doctor"}
          className="w-full h-full object-cover object-top"
        />
      </div>
      <h3 className="text-lg font-semibold text-[#1F2A37]">
        {doctor.fullName || "Unnamed Doctor"}
      </h3>
      <p className="text-sm text-gray-500">
        { doctor.category ||
        doctor.primarySpecialization ||
          "General Practitioner"}
      </p>
    </div>
  </Link>
);

const DoctorCardList = ({ title, doctors }) => {
  const initialVisibleCount = 4;
  const [visibleCount, setVisibleCount] = useState(initialVisibleCount);

  const handleLoadMore = () => setVisibleCount((prev) => prev + 4);

  const itemsToShow = doctors?.slice(0, visibleCount);

  return (
    <div className="mb-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-[#1F2A37]">{title}</h2>
        <Link
          to="/doctorspages/Cards-data"
          className="text-sm text-[#0A4D68] hover:underline font-medium"
        >
          See All
        </Link>
      </div>

      {/* Grid of doctors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {itemsToShow?.map((doctor) => (
          <DoctorCard key={doctor.id} doctor={doctor} />
        ))}
      </div>

      {/* Load More button */}
      {visibleCount < doctors?.length && (
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

export default DoctorCardList;
