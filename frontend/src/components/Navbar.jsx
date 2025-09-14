import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="bg-white shadow-md w-full px-6 py-3 flex justify-between items-center fixed top-0 left-0 z-50">
      <h1 className="text-[#6D5DD3] font-bold text-2xl">Meet o Cure</h1>
      <nav className="space-x-6 text-gray-700 text-sm font-medium">
        <Link to="/patient/login" className="hover:text-[#6D5DD3]">Patient</Link>
        <Link to="/doctor/login" className="hover:text-[#6D5DD3]">Doctor</Link>
      </nav>
    </header>
  );
};

export default Navbar;
