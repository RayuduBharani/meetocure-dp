import { useCallback, useEffect, useRef, useState } from "react";
import { SOSState } from './Comp/types.js';
import { findNearbyHospitals } from './Comp/geminiService.js';
import SOSButton from './Comp/SOSButton.jsx';
import StatusDisplay from './Comp/StatusDisplay.jsx';
import HospitalCard from './Comp/HospitalCard.jsx';
import HospitalFinder from './Comp/HospitalFinder.jsx';
import Timer from './Comp/Timer.jsx';
// import { loadGoogleMaps } from './Comp/loadGoogleMaps.js';

const CONTACT_TIMER_SECONDS = 30;
const  PatientSos = () => {
  const [status, setStatus] = useState(SOSState.IDLE);
  const [userLocation, setUserLocation] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [contactedHospitals, setContactedHospitals] = useState([]);
  const [error, setError] = useState(null);
  const [currentContactIndex, setCurrentContactIndex] = useState(0);
  const [timer, setTimer] = useState(CONTACT_TIMER_SECONDS);
  const intervalRef = useRef(null);

  const clearTimerInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const resetState = () => {
    clearTimerInterval();
    setStatus(SOSState.IDLE);
    setUserLocation(null);
    setHospitals([]);
    setContactedHospitals([]);
    setError(null);
    setCurrentContactIndex(0);
    setTimer(CONTACT_TIMER_SECONDS);
  };

  const handleSOSClick = () => {
    setError(null);
    setStatus(SOSState.GETTING_LOCATION);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        setStatus(SOSState.FINDING_HOSPITALS);
      },
      (geoError) => {
        console.error(`Geolocation error: ${geoError.message}`);
        let errorMessage =
          'Could not get your location. Please enable location services in your browser and try again.';
        if (geoError.code === geoError.PERMISSION_DENIED) {
          errorMessage =
            'Location access was denied. Please enable location permissions in your browser settings to use this feature.';
        }
        setError(errorMessage);
        setStatus(SOSState.ERROR);
      }
    );
  };

  const fetchHospitals = useCallback(async () => {
    if (!userLocation) return;
    try {
      const foundHospitals = await findNearbyHospitals(
        userLocation.latitude,
        userLocation.longitude
      );
      if (foundHospitals.length === 0) {
        setError(
          'No hospitals found within a 2km radius. Please try again or contact emergency services directly.'
        );
        setStatus(SOSState.ERROR);
      } else {
        setHospitals(foundHospitals);
        setCurrentContactIndex(0);
        setStatus(SOSState.CONTACTING);
      }
    } catch (apiError) {
      console.error(apiError);
      if (apiError instanceof Error) {
        setError(apiError.message);
      } else {
        setError('An unknown error occurred while fetching hospitals.');
      }
      setStatus(SOSState.ERROR);
    }
  }, [userLocation]);

  const handleStopProcess = () => {
    clearTimerInterval();
    setStatus(SOSState.COMPLETED);
  };

  useEffect(() => {
    if (status === SOSState.FINDING_HOSPITALS) {
      fetchHospitals();
    }
  }, [status, fetchHospitals]);

  useEffect(() => {
    if (status === SOSState.CONTACTING && currentContactIndex < hospitals.length) {
      if (timer === CONTACT_TIMER_SECONDS) {
        const currentHospital = hospitals[currentContactIndex];
        setContactedHospitals((prev) => [...prev, currentHospital]);
      }

      intervalRef.current = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);

      if (timer === 0) {
        clearTimerInterval();
        if (currentContactIndex < hospitals.length - 1) {
          setCurrentContactIndex((prevIndex) => prevIndex + 1);
          setTimer(CONTACT_TIMER_SECONDS);
        } else {
          setStatus(SOSState.COMPLETED);
        }
      }
    }

    return () => clearTimerInterval();
  }, [status, timer, currentContactIndex, hospitals]);

  const renderContent = () => {
    switch (status) {
      case SOSState.IDLE:
        return <SOSButton onClick={handleSOSClick} disabled={false} />;
      case SOSState.GETTING_LOCATION:
      case SOSState.FINDING_HOSPITALS:
        return <StatusDisplay status={status} />;
      case SOSState.CONTACTING:
        return (
          <div className="text-center w-full max-w-md">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Contacting Hospitals...
            </h2>
            <p className="text-lg text-gray-200 mb-6">
              If there's no response, we'll contact the next hospital automatically.
            </p>
            <Timer
              seconds={timer}
              hospitalName={hospitals[currentContactIndex]?.name}
              maxTime={CONTACT_TIMER_SECONDS}
            />
            <button
              onClick={handleStopProcess}
              className="mt-8 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 w-full"
            >
              Stop - I've Received Help
            </button>
          </div>
        );
      case SOSState.COMPLETED:
        return (
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Process Complete
            </h2>
            <p className="text-lg text-gray-200 mb-6">
              Alerts have been sent. Please call the contacted hospitals directly if needed.
            </p>
            <button
              onClick={resetState}
              className="mb-8 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
            >
              Start Over
            </button>
          </div>
        );
      case SOSState.ERROR:
        return (
          <div className="w-full max-w-lg text-center bg-red-800/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl">
            <h2 className="text-3xl font-bold text-white mb-4">An Error Occurred</h2>
            <p className="text-red-100 mb-8 text-lg">{error}</p>
            <button
              onClick={resetState}
              className="bg-white text-red-700 font-bold py-3 px-8 rounded-lg hover:bg-gray-200 transition duration-300"
            >
              Try Again
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 bg-gray-900 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage:
            "url('https://source.unsplash.com/1920x1080/?modern,hospital,interior')",
        }}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
      </div>

      <main className="relative z-10 flex flex-col items-center justify-center w-full max-w-5xl text-white">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">Meetocure SOS</h1>
          <p className="text-lg md:text-xl text-gray-300 mt-2">
            Your Emergency Medical Assistant
          </p>
        </header>

        {userLocation && (
          <div className="bg-black/40 backdrop-blur-md p-3 rounded-lg mb-8 text-center">
            <p className="font-mono text-sm text-green-300">
              Your Location: Lat {userLocation.latitude.toFixed(5)}, Lon{' '}
              {userLocation.longitude.toFixed(5)}
            </p>
          </div>
        )}

        <div className="w-full flex justify-center mb-12 min-h-[250px] items-center">
          {renderContent()}
        </div>

        {contactedHospitals.length > 0 && (
          <section className="w-full">
            <h3 className="text-xl md:text-2xl font-bold text-center mb-6">
              {status === SOSState.COMPLETED
                ? 'Hospitals That Were Alerted'
                : 'Contacted Hospitals'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contactedHospitals.map((hospital, index) => (
                <HospitalCard
                  key={index}
                  hospital={hospital}
                  isCurrentlyContacting={
                    status === SOSState.CONTACTING && index === currentContactIndex
                  }
                />
              ))}
            </div>
          </section>
        )}

        {/* ✅ This is where you include HospitalFinder */}
        <HospitalFinder />
      </main>
    </div>
  );
}

export default PatientSos;