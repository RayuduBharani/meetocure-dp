import React, { useEffect, useState } from "react";

const banners = [
  {
    text: "Looking for Specialist Doctors?",
    subtext: "Schedule an appointment with our top doctors.",
    bgColor: "bg-[#5CB8B2]",
    image: "/assets/doctor1.png",
  },
  {
    text: "Looking for Specialist Doctors?",
    subtext: "Schedule an appointment with our top doctors.",
    bgColor: "bg-[#F4B9C1]",
    image: "/assets/doctor2.png",
  },
  {
    text: "Looking for Specialist Doctors?",
    subtext: "Schedule an appointment with our top doctors.",
    bgColor: "bg-[#F9A26C]",
    image: "/assets/doctor3.png",
  },
  {
    text: "Looking for Specialist Doctors?",
    subtext: "Schedule an appointment with our top doctors.",
    bgColor: "bg-[#F4B9C1]",
    image: "/assets/doctor4.png",
  },
];

const HeroBanners = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[300px] sm:h-[320px] overflow-hidden rounded-xl shadow-md">
      {/* Banners */}
      {banners.map((banner, index) => (
        <div
          key={index}
          className={`absolute inset-0 px-4 sm:px-8 pt-4 sm:pt-6 flex flex-col sm:flex-row items-center justify-between transition-opacity duration-700 ${
            index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          } ${banner.bgColor}`}
        >
          {/* Text Section */}
          <div className="flex-1 text-white mb-4 sm:mb-0 sm:pr-6 text-center sm:text-left z-20">
            <h2 className="text-2xl sm:text-4xl font-bold mb-2">{banner.text}</h2>
            <p className="text-base sm:text-lg">{banner.subtext}</p>
          </div>

          {/* Image Section */}
          <div className="h-full flex justify-center sm:justify-end items-end">
            <img
              src={banner.image}
              alt={`Doctor ${index + 1}`}
              className="h-full max-h-full object-contain select-none drop-shadow-xl"
              draggable={false}
            />
          </div>
        </div>
      ))}

      {/* Pagination Dots */}
      <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex gap-2 z-30">
        {banners.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentIndex === index ? "bg-white scale-110" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroBanners;
