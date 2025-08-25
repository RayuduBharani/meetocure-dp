import React from 'react';



const Timer = ({ seconds, hospitalName, maxTime }) => {
  const percentage = (seconds / maxTime) * 100;
  const circumference = 2 * Math.PI * 45; // 2 * pi * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-black/30 backdrop-blur-md rounded-lg">
      <p className="text-lg text-gray-200 mb-2">Attempting to contact:</p>
      <h3 className="text-2xl font-bold text-white mb-4 text-center">{hospitalName}</h3>
      <div className="relative w-32 h-32">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            className="text-gray-600"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
            r="45"
            cx="50"
            cy="50"
          />
          {/* Progress circle */}
          <circle
            className="text-blue-500 transition-all duration-1000"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="45"
            cx="50"
            cy="50"
            transform="rotate(-90 50 50)"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-white">
          {seconds}
        </span>
      </div>
      <p className="text-md text-gray-300 mt-4">Time remaining...</p>
    </div>
  );
};

export default Timer;