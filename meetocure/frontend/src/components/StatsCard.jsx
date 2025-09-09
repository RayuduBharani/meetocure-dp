import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatsCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color = "text-blue-600", 
  bg = "bg-blue-100",
  trend = null,
  trendLabel = "",
  period = "",
  onClick = null
}) => {
  return (
    <div 
      className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 ${
        onClick ? 'cursor-pointer hover:scale-105' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-full ${bg} flex items-center justify-center`}>
          <span className={`${color}`}>{icon}</span>
        </div>
        {trend !== null && (
          <div className={`flex items-center gap-1 text-sm ${
            trend >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <h2 className={`text-2xl font-bold ${color} mb-1`}>
          {value}
        </h2>
        {subtitle && <p className="text-gray-400 text-xs">{subtitle}</p>}
        {period && <p className="text-gray-300 text-xs mt-1">{period}</p>}
        {trendLabel && <p className="text-gray-400 text-xs mt-1">{trendLabel}</p>}
      </div>
    </div>
  );
};

export default StatsCard;
