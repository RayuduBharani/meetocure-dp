import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const splashImages = [
  "/assets/splash1.png",
  "/assets/splash2.png",
  "/assets/splash3.png",
  "/assets/splash4.png",
  "/assets/splash5.png",
];

const SplashScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) =>
        prev === splashImages.length - 1 ? prev : prev + 1
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (currentIndex === splashImages.length - 1) {
      const redirect = setTimeout(() => {
        navigate("/choose-role");
      }, 1000); 
      return () => clearTimeout(redirect);
    }
  }, [currentIndex, navigate]);

  const handleSkip = () => {
    navigate("/choose-role");
  };

  return (
    <div className="min-h-screen flex font-[Poppins] bg-gradient-to-br from-[#F9FCFF] to-[#E6F1F9] relative">
      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="absolute bottom-4 right-4 px-4 py-2 bg-[#0A4D68] text-white text-sm rounded-full shadow-md hover:bg-[#08374f] transition"
      >
        Skip
      </button>

      {/* Left Panel: Branding */}
      <div className="hidden md:flex w-1/2 flex-col justify-center items-center px-10 bg-[#0A4D68] text-white relative">
        <div className="w-36 h-36 rounded-full bg-white flex items-center justify-center shadow-2xl mb-6">
          <img
            src="/assets/logo.png"
            alt="Logo"
            className="w-24 h-24 object-contain"
          />
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight mb-4 text-white">
          MeetoCure
        </h1>
        <p className="text-lg text-[#E0F7FA] max-w-md text-center">
          Your Digital Healthcare Companion.
        </p>
        <div className="mt-6 w-24 h-1 bg-[#4FBDBA] rounded-full animate-pulse" />
      </div>

      {/* Right Panel: Splash Screens */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-[320px] h-[640px] overflow-hidden">
          <img
            src={splashImages[currentIndex]}
            alt={`Splash ${currentIndex + 1}`}
            className="object-contain w-full h-full"
          />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
