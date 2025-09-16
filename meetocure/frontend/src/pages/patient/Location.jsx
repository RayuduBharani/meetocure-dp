import React, { useCallback, useState } from "react";
import { FaMapMarkerAlt, FaCrosshairs } from "react-icons/fa";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Location = () => {
  const [location, setLocation] = useState("Vijayawada");
  const [coords, setCoords] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [source, setSource] = useState(null);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const GOOGLE_API_KEY = import.meta?.env?.VITE_GOOGLE_MAPS_API_KEY || null;

  const getCityFromGoogle = async (lat, lng) => {
    if (!GOOGLE_API_KEY) return null;
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`
      );
      const data = await res.json();
      if (data.status === "OK" && data.results && data.results.length > 0) {
        const comp = data.results[0].address_components || [];
        const city =
          comp.find((c) => c.types.includes("locality"))?.long_name ||
          comp.find((c) => c.types.includes("administrative_area_level_2"))?.long_name ||
          comp.find((c) => c.types.includes("administrative_area_level_1"))?.long_name ||
          data.results[0].formatted_address;
        return { place: city, formatted: data.results[0].formatted_address };
      }
    } catch (err) {
      console.warn("Google Geocoding failed:", err);
    }
    return null;
  };

  const getCityFromNominatim = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      if (data) {
        const addr = data.address || {};
        const city = addr.city || addr.town || addr.village || addr.county || data.display_name;
        return { place: city, formatted: data.display_name };
      }
    } catch (err) {
      console.warn("Nominatim reverse geocode failed:", err);
    }
    return null;
  };

  const getCityFromBigDataCloud = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      const data = await res.json();
      const city =
        data.locality || data.city || data.principalSubdivision || data.countryName || null;
      return { place: city, formatted: city };
    } catch (err) {
      console.warn("BigDataCloud reverse geocode failed:", err);
      return null;
    }
  };

  // Try multiple reverse geocoders in preferred order and return first useful result
  const reverseGeocode = async (lat, lng) => {
    // 1) Google (if key)
    const tryOrder = [];
    if (GOOGLE_API_KEY) tryOrder.push(getCityFromGoogle);
    tryOrder.push(getCityFromNominatim, getCityFromBigDataCloud);

    for (const fn of tryOrder) {
      try {
        const r = await fn(lat, lng);
        if (r && r.place) return { place: r.place, formatted: r.formatted || r.place, provider: fn.name };
      } catch (e) {
        // continue

        console.warn("Reverse geocode error:", e);
      }
    }
    return null;
  };

  const handleCurrentLocation = async (opts = {}) => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported by your browser.");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Detecting your location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy: acc } = position.coords;
        console.log("Raw position:", position.coords);
        setCoords({ lat: latitude, lng: longitude });
        setAccuracy(acc);

        // reverse geocode tries
        const result = await reverseGeocode(latitude, longitude);
        if (result) {
          setLocation(result.place);
          setSource(result.provider);
          localStorage.setItem("selectedCity", result.place);
          toast.success(`Location set to ${result.place}`);
          navigate("/patient-dashboard");
        } else {
          setSource("none");
          toast.error("City not detected from coordinates.");
        }

        setLoading(false);
        toast.dismiss(loadingToast);
      },
      async (error) => {
        console.warn("Geolocation error:", error);
        let errorMessage = "Failed to retrieve your location.";
        if (error.code === 1) {
          errorMessage = "Location permission denied.";
          // fallback to IP-based lookup
          try {
            const ipRes = await fetch("https://ipapi.co/json/");
            const data = await ipRes.json();
            const city = data.city || data.region || data.country_name;
            if (city) {
              setLocation(city);
              setSource("ip");
              localStorage.setItem("selectedCity", city);
              toast.success(`Location set to ${city} (from IP)`);
              navigate("/patient-dashboard");
              setLoading(false);
              toast.dismiss(loadingToast);
              return;
            }
          } catch (e) {
            console.warn("IP fallback failed", e);
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
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0,
        ...opts,
      }
    );
  };

 
function debounce(func, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
}


const handleCitySearch = useCallback(debounce(async (query) => {
  if (!query || query.length < 2) {
    setSearchResults([]);
    return;
  }
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5`
    );
    const data = await res.json();
    if (data?.results) {
      setSearchResults(data.results.map((city) => city.name));
    }
  } catch (err) {
    console.error("City search failed", err);
  }
}, 300), []);


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
      <div className="bg-white shadow-2xl rounded-3xl p-6 w-full max-w-xl transition-all duration-300">
        <h2 className="text-2xl font-bold text-[#0A4D68] mb-4 text-center">Select Your Location</h2>

        <div className="flex flex-col items-center text-[#0A4D68] text-base mb-4">
          <div className="flex items-center gap-2 mb-1">
            <FaMapMarkerAlt className="text-xl" />
            <span className="font-medium">{loading ? "Detecting location..." : location}</span>
          </div>

          <div className="text-xs text-gray-500">
            {coords ? `coords: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)} • accuracy: ${accuracy ? `${Math.round(accuracy)}m` : "n/a"}` : ""}
            {source ? ` • source: ${source}` : ""}
          </div>
        </div>

        <input
          type="text"
          placeholder="Search for a city..."
          value={search}
          onChange={(e) => handleCitySearch(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A4D68] mb-4 text-base"
        />

        <div
          onClick={() => handleCurrentLocation({ enableHighAccuracy: true })}
          className={`flex items-center justify-center text-[#0A4D68] font-semibold cursor-pointer mb-4 hover:text-[#08374f] transition ${loading ? "opacity-50 pointer-events-none" : ""}`}
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

