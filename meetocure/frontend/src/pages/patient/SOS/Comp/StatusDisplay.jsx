import React from 'react';
import { SOSState } from "./types.js";


const statusMessages = {
  [SOSState.GETTING_LOCATION]: {
    message: "Detecting your location...",
    icon: (
      <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    ),
  },
  [SOSState.FINDING_HOSPITALS]: {
    message: "Finding nearest hospitals...",
    icon: (
      <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    ),
  },
  // Other states are handled in App.tsx
  [SOSState.IDLE]: { message: "", icon: null },
  [SOSState.CONTACTING]: { message: "", icon: null },
  [SOSState.COMPLETED]: { message: "", icon: null },
  [SOSState.ERROR]: { message: "", icon: null },
};

const StatusDisplay = ({ status }) => {
  const { message, icon } = statusMessages[status] || { message: 'Processing...', icon: null };
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-black/30 backdrop-blur-md rounded-lg">
      <div className="mb-4">{icon}</div>
      <p className="text-xl md:text-2xl font-semibold text-white">{message}</p>
    </div>
  );
};

export default StatusDisplay;