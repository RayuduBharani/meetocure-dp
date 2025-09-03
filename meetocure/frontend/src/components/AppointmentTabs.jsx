import React from "react";

const tabs = ["Upcoming", "Completed", "Cancelled"];

const AppointmentTabs = ({ active, onChange }) => {
  return (
    <div className="flex gap-8 border-b border-gray-200 mb-6 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`pb-3 px-2 text-lg font-semibold transition-all duration-200 ${
            active === tab
              ? "text-[#0A4D68] border-b-4 border-[#0A4D68]"
              : "text-gray-400 hover:text-[#0A4D68]"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default AppointmentTabs;
