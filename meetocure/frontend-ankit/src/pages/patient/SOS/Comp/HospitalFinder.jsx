import React, { useEffect, useState } from "react";
import { loadGoogleMaps } from './loadGoogleMaps';

const HospitalFinder = () => {
  const [hospitals, setHospitals] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeMap = async () => {
      try {
        await loadGoogleMaps();
        navigator.geolocation.getCurrentPosition((pos) => {
          const { latitude, longitude } = pos.coords;
          findNearbyHospitals(latitude, longitude);
        });
      } catch (error) {
        setError("Failed to load Google Maps API");
      }
    };

    initializeMap();
  }, []);

  function findNearbyHospitals(lat, lng, radius = 2000) {
    const service = new window.google.maps.places.PlacesService(document.createElement("div"));

    service.nearbySearch(
      {
        location: { lat, lng },
        radius,
        type: ["hospital"],
      },
      (results,status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
          setHospitals(
            results.map((r) => ({
              name: r.name,
              address: r.vicinity,
            }))
          );
          setError(null);
        } else {
          if (radius < 10000) {
            console.log(`No hospitals in ${radius}m. Retrying...`);
            findNearbyHospitals(lat, lng, radius + 3000);
          } else {
            setError("🚨 No hospitals found within 10 km. Please call 108 for emergency services.");
          }
        }
      }
    );
  }

  return (
    <div>
      <h2>Nearby Hospitals</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {hospitals.map((h, i) => (
          <li key={i}>
            <b>{h.name}</b> - {h.address}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HospitalFinder;
