// import React, { useState } from "react";
// import { FaMapMarkerAlt, FaCrosshairs } from "react-icons/fa";
// import toast from "react-hot-toast";
// import { useNavigate } from "react-router-dom";

// const Location = () => {
//   const [location, setLocation] = useState("Vijayawada");
//   const [search, setSearch] = useState("");
//   const [searchResults, setSearchResults] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   const handleCurrentLocation = () => {
//     if (!navigator.geolocation) {
//       toast.error("Geolocation is not supported by your browser.");
//       return;
//     }

//     setLoading(true);
//     const loadingToast = toast.loading("Detecting your location...");

//     navigator.geolocation.getCurrentPosition(
//       async (position) => {
//         const { latitude, longitude } = position.coords;

//         try {
//           const res = await fetch(
//             `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
//           );
//           const data = await res.json();

//           const city =
//             data.locality || data.city || data.principalSubdivision || data.countryName;

//           if (city) {
//             setLocation(city);
//             localStorage.setItem("selectedCity", city);
//             toast.success(`Location set to ${city}`);
//             navigate("/patient-dashboard");
//           } else {
//             toast.error("City not detected from location.");
//           }
//         } catch (err) {
//           console.error("Reverse geocoding error:", err);
//           toast.error("Something went wrong while detecting your city.");
//         } finally {
//           setLoading(false);
//           toast.dismiss(loadingToast);
//         }
//       },
//       (error) => {
//         console.error("Geolocation error:", error);
//         if (error.code === 1) {
//           toast.error("Location permission denied");
//         } else if (error.code === 2) {
//           toast.error("Location unavailable.");
//         } else if (error.code === 3) {
//           toast.error("Location request timed out.");
//         } else {
//           toast.error("Failed to retrieve your location.");
//         }
//         setLoading(false);
//         toast.dismiss(loadingToast);
//       },
//       {
//         timeout: 10000,
//         enableHighAccuracy: true,
//       }
//     );
//   };

//   const handleCitySearch = async (query) => {
//     setSearch(query);
//     if (!query || query.length < 2) {
//       setSearchResults([]);
//       return;
//     }

//     try {
//       const res = await fetch(
//         `https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=5`
//       );
//       const data = await res.json();

//       if (data?.results) {
//         setSearchResults(data.results.map((city) => city.name));
//       }
//     } catch (err) {
//       console.error("City search failed", err);
//     }
//   };

//   const handleSelectCity = (city) => {
//     setLocation(city);
//     localStorage.setItem("selectedCity", city);
//     setSearch("");
//     setSearchResults([]);
//     toast.success(`City set to ${city}`);
//     navigate("/patient-dashboard");
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter" && searchResults.length > 0) {
//       handleSelectCity(searchResults[0]);
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-[#F0F4F8] px-4">
//       <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-xl transition-all duration-300">
//         <h2 className="text-2xl font-bold text-[#0A4D68] mb-6 text-center">
//           Select Your Location
//         </h2>

//         <div className="flex items-center text-[#0A4D68] text-lg mb-5 justify-center">
//           <FaMapMarkerAlt className="mr-2 text-xl" />
//           <span className="font-medium">
//             {loading ? "Detecting location..." : location}
//           </span>
//         </div>

//         <input
//           type="text"
//           placeholder="Search for a city..."
//           value={search}
//           onChange={(e) => handleCitySearch(e.target.value)}
//           onKeyDown={handleKeyDown}
//           className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A4D68] mb-5 text-base"
//         />

//         <div
//           onClick={handleCurrentLocation}
//           className={`flex items-center justify-center text-[#0A4D68] font-semibold cursor-pointer mb-6 hover:text-[#08374f] transition ${loading ? "opacity-50 pointer-events-none" : ""
//             }`}
//         >
//           <FaCrosshairs className="mr-2 text-lg" />
//           Use my current location
//         </div>

//         <div className="space-y-3">
//           {searchResults.map((city, idx) => (
//             <div
//               key={idx}
//               onClick={() => handleSelectCity(city)}
//               className="flex items-center gap-3 py-3 px-4 rounded-xl border cursor-pointer hover:bg-gray-100 text-[#1F2A37] transition"
//             >
//               <FaMapMarkerAlt className="text-[#0A4D68]" />
//               <span className="text-base font-medium">{city}</span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Location;








import React, { useState } from "react";
import { FaMapMarkerAlt, FaCrosshairs } from "react-icons/fa";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Location = () => {
  const [location, setLocation] = useState("Vijayawada");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const GOOGLE_API_KEY = "YOUR_GOOGLE_API_KEY";

  const getCityFromGoogle = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`
      );
      const data = await res.json();

      if (data.status === "OK" && data.results.length > 0) {
        const components = data.results[0].address_components;
        const city =
          components.find((c) => c.types.includes("locality"))?.long_name ||
          components.find((c) => c.types.includes("administrative_area_level_2"))?.long_name ||
          components.find((c) => c.types.includes("administrative_area_level_1"))?.long_name ||
          components.find((c) => c.types.includes("country"))?.long_name;

        return city;
      }
    } catch (err) {
      console.error("Google Geocoding failed:", err);
    }
    return null;
  };

  const getCityFromBigDataCloud = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      const data = await res.json();

      return (
        data.locality ||
        data.city ||
        data.principalSubdivision ||
        data.countryName ||
        null
      );
    } catch (err) {
      console.error("BigDataCloud reverse geocode failed:", err);
      return null;
    }
  };

  const getCityFromIP = async () => {
    try {
      const res = await fetch("https://ipapi.co/json/");
      const data = await res.json();
      return data.city || data.region || data.country_name;
    } catch (err) {
      console.error("IP-based location failed:", err);
      return null;
    }
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Detecting your location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let city = null;

        // Try Google first
        city = await getCityFromGoogle(latitude, longitude);

        // Fallback to BigDataCloud
        if (!city) {
          city = await getCityFromBigDataCloud(latitude, longitude);
        }

        // Final fallback: IP lookup
        if (!city) {
          city = await getCityFromIP();
        }

        if (city) {
          setLocation(city);
          localStorage.setItem("selectedCity", city);
          toast.success(`Location set to ${city}`);
          navigate("/patient-dashboard");
        } else {
          toast.error("City not detected.");
        }

        setLoading(false);
        toast.dismiss(loadingToast);
      },
      async (error) => {
        console.error("Geolocation error:", error);
        let errorMessage = "Failed to retrieve your location.";

        if (error.code === 1) {
          errorMessage = "Location permission denied.";
          // fallback to IP-based lookup
          const city = await getCityFromIP();
          if (city) {
            setLocation(city);
            localStorage.setItem("selectedCity", city);
            toast.success(`Location set to ${city}`);
            navigate("/patient-dashboard");
            toast.dismiss(loadingToast);
            setLoading(false);
            return;
          }
        } else if (error.code === 2) {
          errorMessage = "Location unavailable.";
        } else if (error.code === 3) {
          errorMessage = "Location request timed out.";
        }

        toast.error(errorMessage);
        setLoading(false);
        toast.dismiss(loadingToast);
      },
      {
        timeout: 15000,
        maximumAge: 0,
        enableHighAccuracy: true,
      }
    );
  };

  const handleCitySearch = async (query) => {
    setSearch(query);
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=5`
      );
      const data = await res.json();

      if (data?.results) {
        setSearchResults(data.results.map((city) => city.name));
      }
    } catch (err) {
      console.error("City search failed", err);
    }
  };

  const handleSelectCity = (city) => {
    setLocation(city);
    localStorage.setItem("selectedCity", city);
    setSearch("");
    setSearchResults([]);
    toast.success(`City set to ${city}`);
    navigate("/patient-dashboard");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && searchResults.length > 0) {
      handleSelectCity(searchResults[0]);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F0F4F8] px-4">
      <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-xl transition-all duration-300">
        <h2 className="text-2xl font-bold text-[#0A4D68] mb-6 text-center">
          Select Your Location
        </h2>

        <div className="flex items-center text-[#0A4D68] text-lg mb-5 justify-center">
          <FaMapMarkerAlt className="mr-2 text-xl" />
          <span className="font-medium">
            {loading ? "Detecting location..." : location}
          </span>
        </div>

        <input
          type="text"
          placeholder="Search for a city..."
          value={search}
          onChange={(e) => handleCitySearch(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A4D68] mb-5 text-base"
        />

        <div
          onClick={handleCurrentLocation}
          className={`flex items-center justify-center text-[#0A4D68] font-semibold cursor-pointer mb-6 hover:text-[#08374f] transition ${
            loading ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <FaCrosshairs className="mr-2 text-lg" />
          Use my current location
        </div>

        <div className="space-y-3">
          {searchResults.map((city, idx) => (
            <div
              key={idx}
              onClick={() => handleSelectCity(city)}
              className="flex items-center gap-3 py-3 px-4 rounded-xl border cursor-pointer hover:bg-gray-100 text-[#1F2A37] transition"
            >
              <FaMapMarkerAlt className="text-[#0A4D68]" />
              <span className="text-base font-medium">{city}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Location;

