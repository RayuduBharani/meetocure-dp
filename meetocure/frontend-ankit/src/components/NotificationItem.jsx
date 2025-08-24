import React from "react";
import {
  FaCalendarCheck,
  FaCalendarTimes,
  FaPenFancy,
} from "react-icons/fa";

const iconMap = {
  success: <FaCalendarCheck className="text-green-600 text-lg" />,
  cancel: <FaCalendarTimes className="text-red-600 text-lg" />,
  reschedule: <FaPenFancy className="text-blue-500 text-lg" />,
};

const bgMap = {
  success: "bg-green-100",
  cancel: "bg-red-100",
  reschedule: "bg-gray-100",
};

const NotificationItem = ({ type, title, message, time }) => {
  return (
    <div className="flex items-start gap-4 py-4">
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center ${bgMap[type]} shadow`}
      >
        {iconMap[type]}
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-[#1F2A37]">{title}</h4>
        <p className="text-sm text-gray-500">{message}</p>
      </div>
      <span className="text-sm text-gray-400 whitespace-nowrap">{time}</span>
    </div>
  );
};

export default NotificationItem;
