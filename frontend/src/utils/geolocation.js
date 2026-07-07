// utils/geolocation.js

/**
 * Get user's current location using browser geolocation API
 * @returns {Promise<{latitude: number, longitude: number}>}
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
};

/**
 * Geocode an address string to coordinates using a simple city lookup
 * For production, use a proper geocoding service like Google Maps API
 * @param {string} address - Address string
 * @returns {Promise<{latitude: number, longitude: number} | null>}
 */
export const geocodeAddress = async (address) => {
  if (!address) return null;

  // Simple city lookup for common Indian cities
  const cityCoordinates = {
    'mumbai': { latitude: 19.0760, longitude: 72.8777 },
    'delhi': { latitude: 28.6139, longitude: 77.2090 },
    'bangalore': { latitude: 12.9716, longitude: 77.5946 },
    'hyderabad': { latitude: 17.3850, longitude: 78.4867 },
    'chennai': { latitude: 13.0827, longitude: 80.2707 },
    'pune': { latitude: 18.5204, longitude: 73.8567 },
    'kolkata': { latitude: 22.5726, longitude: 88.3639 },
    'ahmedabad': { latitude: 23.0225, longitude: 72.5714 },
    'jaipur': { latitude: 26.9124, longitude: 75.7873 },
    'surat': { latitude: 21.1702, longitude: 72.8311 },
    'lucknow': { latitude: 26.8467, longitude: 80.9462 },
    'kanpur': { latitude: 26.4499, longitude: 80.3319 },
    'nagpur': { latitude: 21.1458, longitude: 79.0882 },
    'indore': { latitude: 22.7196, longitude: 75.8577 },
    'thane': { latitude: 19.2183, longitude: 72.9781 },
    'bhopal': { latitude: 23.2599, longitude: 77.4126 },
    'visakhapatnam': { latitude: 17.6868, longitude: 83.2185 },
    'patna': { latitude: 25.5941, longitude: 85.1376 },
    'vadodara': { latitude: 22.3072, longitude: 73.1812 },
    'ghaziabad': { latitude: 28.6692, longitude: 77.4538 }
  };

  const cityName = address.toLowerCase().split(',')[0].trim();
  return cityCoordinates[cityName] || null;
};

