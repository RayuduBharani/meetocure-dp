export const loadGoogleMaps = () => {
  return new Promise((resolve, reject) => {
    // If Google Maps is already loaded, resolve immediately
    if (window.google && window.google.maps) {
      resolve(window.google.maps);
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;

    // Handle script load success
    script.addEventListener('load', () => {
      if (window.google && window.google.maps) {
        resolve(window.google.maps);
      } else {
        reject(new Error('Google Maps failed to load'));
      }
    });

    // Handle script load error
    script.addEventListener('error', () => {
      reject(new Error('Failed to load Google Maps script'));
    });

    // Add script to document
    document.head.appendChild(script);
  });
};
