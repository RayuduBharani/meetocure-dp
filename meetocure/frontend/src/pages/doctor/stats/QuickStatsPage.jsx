import React from "react";
import TopIcons from "../../../components/TopIcons";
import {
  DollarSign,
  Users,
  CalendarCheck,
  CalendarX2,
  RotateCcw,
  Star,
  TrendingUp,
} from "lucide-react"; // icons

const dummyStats = [
  {
    title: "Total Earnings",
    value: "₹12,500",
    color: "text-green-600",
    bg: "bg-green-100",
    icon: <DollarSign className="w-6 h-6" />,
  },
  {
    title: "Patients Booked",
    value: 48,
    color: "text-blue-600",
    bg: "bg-blue-100",
    icon: <Users className="w-6 h-6" />,
  },
  {
    title: "Today’s Appointments",
    value: 6,
    color: "text-indigo-600",
    bg: "bg-indigo-100",
    icon: <CalendarCheck className="w-6 h-6" />,
  },
  {
    title: "Cancelled Appointments",
    value: 7,
    color: "text-red-600",
    bg: "bg-red-100",
    icon: <CalendarX2 className="w-6 h-6" />,
  },
  {
    title: "Refunds Issued",
    value: 5,
    color: "text-amber-600",
    bg: "bg-amber-100",
    icon: <RotateCcw className="w-6 h-6" />,
  },
  {
    title: "Avg. Earning / Patient",
    value: "₹260",
    color: "text-purple-600",
    bg: "bg-purple-100",
    icon: <TrendingUp className="w-6 h-6" />,
  },
  {
    title: "Feedbacks Received",
    value: 18,
    color: "text-pink-600",
    bg: "bg-pink-100",
    icon: <Star className="w-6 h-6" />,
  },
];

const QuickStatsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 font-poppins p-6">
      <TopIcons />
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-[#0A4D68] to-[#1e6b8a] bg-clip-text text-transparent">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {dummyStats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow hover:shadow-lg transition p-6 flex items-center gap-4"
          >
            <div
              className={`p-3 rounded-full ${stat.bg} flex items-center justify-center`}
            >
              <span className={`${stat.color}`}>{stat.icon}</span>
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
              <h2 className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickStatsPage;
