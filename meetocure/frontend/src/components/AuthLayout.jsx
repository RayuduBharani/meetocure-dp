import React from "react";
import Navbar from "./Navbar";

const AuthLayout = ({ children, title }) => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-24 flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-white px-4 font-[Poppins]">
        <div className="w-full max-w-xl bg-white shadow-xl rounded-2xl p-10">
          <h2 className="text-2xl font-bold text-center text-[#6D5DD3] mb-6">{title}</h2>
          {children}
        </div>
      </div>
    </>
  );
};

export default AuthLayout;
