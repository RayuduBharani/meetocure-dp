import React from 'react';


const SOSButton = ({ onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="relative flex items-center justify-center w-48 h-48 md:w-56 md:h-56 bg-red-600 rounded-full text-white font-bold text-3xl md:text-4xl shadow-2xl transition-transform transform hover:scale-105 active:scale-100 focus:outline-none focus:ring-4 focus:ring-red-400 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping"></span>
      <span className="relative">SOS</span>
    </button>
  );
};

export default SOSButton;