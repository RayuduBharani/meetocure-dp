import React from "react";
import { useNavigate } from "react-router-dom";
import { Phone, Clock, ChevronLeft } from "lucide-react";
import PatientTopIcons from "../../../components/PatientTopIcons";
import toast from "react-hot-toast";

export default function ContactUs() {
  const navigate = useNavigate();

  return (
    <>
      {/* Header */}
      <div className="bg-white shadow-sm w-full flex items-center justify-between px-4 py-3">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">Contact Us</h1>
          </div>
        </div>
        <div className="mr-6">
          <PatientTopIcons />
        </div>
      </div>

      <div className="bg-gray-50 w-full min-h-155 flex flex-col items-center px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-center w-full gap-8 mt-10">
          {/* Agent Card */}
          <div className="flex justify-center items-center p-4 md:p-5 w-full md:w-1/3">
            <div className="bg-[#0A4D68] text-white rounded-2xl shadow-xl p-8 max-w-md w-full flex-col justify-between h-65 border border-[#0A4D68]/30">
              <div>
                <div className="flex items-center gap-6 mb-6">
                  <img
                    src="https://randomuser.me/api/portraits/women/32.jpg"
                    alt="Neelima"
                    className="w-16 h-16 rounded-full border-2 border-white/30 object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h2 className="font-semibold text-white text-2xl">
                        Neelima
                      </h2>
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2.5 h-2.5 bg-white rounded-full" />
                      </div>
                    </div>
                    <p className="text-white/80 text-base mt-1">
                      Appointment Booking Agent
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => toast.success("Booking request sent to Neelima")}
                  className="w-full bg-white/20 text-white font-medium py-3 rounded-lg mb-6 hover:bg-white/30 transition"
                >
                  For Booking
                </button>
              </div>

              <div className="flex items-center gap-3 text-white/80 text-base font-medium">
                <Clock className="w-5 h-5" />
                <span>6:00 AM - 9:00 PM</span>
              </div>
            </div>
          </div>

          {/* Illustration */}
          {/* ...keeping your illustration code untouched... */}
        </div>

        {/* Call Now Button */}
        <div className="fixed bottom-6 left-0 right-0 px-6 max-w-lg mx-auto">
          <button className="w-full bg-[#0A4D68] hover:bg-[#083952] text-white py-4 rounded-full flex items-center justify-center gap-3 text-lg font-semibold transition-colors shadow-lg">
            Call Now
            <Phone className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  );
}
