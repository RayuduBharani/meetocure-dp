import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const EarningsChart = ({ 
  title = "Earnings Trend", 
  data = [],
  height = 200 
}) => {
  // Sample data for demonstration
  const sampleData = [
    { month: 'Jan', earnings: 8500, appointments: 17 },
    { month: 'Feb', earnings: 9200, appointments: 18 },
    { month: 'Mar', earnings: 10800, appointments: 22 },
    { month: 'Apr', earnings: 12500, appointments: 25 },
    { month: 'May', earnings: 11800, appointments: 24 },
    { month: 'Jun', earnings: 13200, appointments: 26 }
  ];

  const chartData = data.length > 0 ? data : sampleData;
  const maxEarnings = Math.max(...chartData.map(d => d.earnings));
  const maxAppointments = Math.max(...chartData.map(d => d.appointments));

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">Earnings</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">Appointments</span>
          </div>
        </div>
      </div>

      <div className="relative" style={{ height: `${height}px` }}>
        {/* Chart Area */}
        <div className="absolute inset-0 flex items-end justify-between px-4 pb-8">
          {chartData.map((item, index) => (
            <div key={index} className="flex flex-col items-center gap-2 flex-1">
              {/* Earnings Bar */}
              <div className="relative w-full flex justify-center">
                <div 
                  className="w-6 bg-blue-500 rounded-t"
                  style={{ 
                    height: `${(item.earnings / maxEarnings) * (height - 60)}px`,
                    minHeight: '4px'
                  }}
                ></div>
              </div>
              
              {/* Appointments Bar */}
              <div className="relative w-full flex justify-center">
                <div 
                  className="w-4 bg-green-500 rounded-t"
                  style={{ 
                    height: `${(item.appointments / maxAppointments) * (height - 60)}px`,
                    minHeight: '4px'
                  }}
                ></div>
              </div>
              
              {/* Month Label */}
              <span className="text-xs text-gray-500 mt-2">{item.month}</span>
            </div>
          ))}
        </div>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between py-4">
          <span className="text-xs text-gray-400">₹{maxEarnings.toLocaleString()}</span>
          <span className="text-xs text-gray-400">₹{(maxEarnings / 2).toLocaleString()}</span>
          <span className="text-xs text-gray-400">₹0</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">
              ₹{chartData[chartData.length - 1]?.earnings?.toLocaleString() || '0'}
            </p>
            <p className="text-xs text-gray-500">Current Month</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {chartData[chartData.length - 1]?.appointments || 0}
            </p>
            <p className="text-xs text-gray-500">Appointments</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600">
              {chartData.length > 1 ? 
                ((chartData[chartData.length - 1]?.earnings - chartData[chartData.length - 2]?.earnings) / chartData[chartData.length - 2]?.earnings * 100).toFixed(1) : 0
              }%
            </p>
            <p className="text-xs text-gray-500">Growth</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarningsChart;
