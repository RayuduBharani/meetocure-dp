import React from "react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import TopIcons from "../../../components/TopIcons";

const chartData = [
  { name: "Mon", value: 30 },
  { name: "Tue", value: 45 },
  { name: "Wed", value: 25 },
  { name: "Thu", value: 50 },
  { name: "Fri", value: 35 },
  { name: "Sat", value: 60 },
  { name: "Sun", value: 20 },
];

const quickStats = [
  { title: "Appointments", count: 30, chartType: "bar" },
  { title: "Pending Appt", count: 5, chartType: "area" },
  { title: "Earnings", count: 3000, chartType: "area", prefix: "Earn : " },
  { title: "Patients", count: 30, chartType: "bar" },
];

const QuickStatsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1F2A37] font-[Poppins] px-5 pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-[#F8FAFC] z-10 pt-6 pb-4 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="text-2xl font-bold text-[#0A4D68]"
          >
            ←
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0A4D68]">
            Stats Overview
          </h1>
        </div>

        {/* ✅ Replaced custom icons with TopIcons component */}
        <TopIcons />
      </div>

      {/* Quick Stats */}
      <section className="mt-8 mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl md:text-2xl font-semibold tracking-wide">
            Quick Stats
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {quickStats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-[#E0E7FF] p-6 shadow-sm hover:shadow-lg transition duration-200"
            >
              <p className="text-sm text-gray-400 mb-1">Today</p>
              <h3 className="text-lg font-semibold mb-1 border-b border-gray-200 pb-2">
                {stat.title}
              </h3>
              <p className="text-[#0A4D68] text-2xl font-bold mb-4">
                {stat.prefix || "Count : "}
                {stat.count}
              </p>

              <div className="h-20">
                <ResponsiveContainer width="100%" height="100%">
                  {stat.chartType === "area" ? (
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="fillColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#074E5C" stopOpacity={0.7} />
                          <stop offset="95%" stopColor="#074E5C" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <Tooltip contentStyle={{ fontSize: "13px", borderRadius: "8px" }} />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#4DB38C"
                        strokeWidth={3}
                        fill="url(#fillColor)"
                        dot={{ r: 2 }}
                        activeDot={{ r: 5 }}
                      />
                    </AreaChart>
                  ) : (
                    <BarChart data={chartData}>
                      <Bar dataKey="value" fill="#9AD0C6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Weekly Trends */}
      <section className="mt-14">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl md:text-2xl font-semibold tracking-wide">
            Weekly Stats
          </h2>
          <span className="text-base text-gray-400">Default ↑↓</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {["Patients", "Appointments", "Earnings", "Cancel/Reschedule Appt"].map(
            (title, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-[#E0E7FF] p-6 shadow-sm hover:shadow-lg transition duration-200"
              >
                <p className="text-sm text-gray-500">{title}</p>
                <h3 className="text-lg font-bold mb-4">Total {title}</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#9AD0C6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )
          )}
        </div>
      </section>
    </div>
  );
};

export default QuickStatsPage;
