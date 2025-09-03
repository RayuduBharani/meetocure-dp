import React, { createContext, useContext, useEffect, useState } from 'react';

const GoogleMapsContext = createContext();

export function GoogleMapsProvider({ children }) {
    const [isLoaded, setIsLoaded] = useState(false);
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    useEffect(() => {
        // Check if Google Maps is already loaded
        if (window.google?.maps) {
            setIsLoaded(true);
            return;
        }

        // Load Google Maps API only once
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.addEventListener('load', () => setIsLoaded(true));

        document.head.appendChild(script);

        return () => {
            // Cleanup if component unmounts before script loads
            script.removeEventListener('load', () => setIsLoaded(true));
        };
    }, [apiKey]);

    return (
        <GoogleMapsContext.Provider value={{ isLoaded }}>
            {children}
        </GoogleMapsContext.Provider>
    );
}

export const useGoogleMaps = () => {
    const context = useContext(GoogleMapsContext);
    if (!context) {
        throw new Error('useGoogleMaps must be used within a GoogleMapsProvider');
    }
    return context;
};
