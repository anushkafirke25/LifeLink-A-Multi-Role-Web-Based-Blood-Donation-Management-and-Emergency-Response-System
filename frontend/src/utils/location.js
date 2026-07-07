// Utility functions for location-based features

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Parse location string to extract coordinates
 * Supports formats like "Mumbai, Maharashtra" or "19.0760,72.8777"
 * @param {string} location - Location string
 * @returns {Object|null} {lat, lon} or null if cannot parse
 */
export const parseLocation = (location) => {
  if (!location) return null;
  
  // Try to parse as coordinates
  const coordMatch = location.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
  if (coordMatch) {
    return {
      lat: parseFloat(coordMatch[1]),
      lon: parseFloat(coordMatch[2])
    };
  }
  
  // For city names, we'd need a geocoding service
  // For now, return a mock location based on common cities
  const cityCoordinates = {
    'mumbai': { lat: 19.0760, lon: 72.8777 },
    'delhi': { lat: 28.6139, lon: 77.2090 },
    'bangalore': { lat: 12.9716, lon: 77.5946 },
    'hyderabad': { lat: 17.3850, lon: 78.4867 },
    'chennai': { lat: 13.0827, lon: 80.2707 },
    'pune': { lat: 18.5204, lon: 73.8567 },
    'kolkata': { lat: 22.5726, lon: 88.3639 }
  };
  
  const cityName = location.toLowerCase().split(',')[0].trim();
  return cityCoordinates[cityName] || null;
};

/**
 * Sort items by distance from a reference location
 * @param {Array} items - Array of items with location property
 * @param {string} referenceLocation - Reference location string
 * @returns {Array} Sorted array with distance property added
 */
export const sortByDistance = (items, referenceLocation) => {
  const refCoords = parseLocation(referenceLocation);
  if (!refCoords) return items.map(item => ({ ...item, distance: null }));
  
  return items
    .map(item => {
      const itemCoords = parseLocation(item.location);
      const distance = itemCoords 
        ? calculateDistance(refCoords.lat, refCoords.lon, itemCoords.lat, itemCoords.lon)
        : null;
      return { ...item, distance };
    })
    .sort((a, b) => {
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });
};

/**
 * Find nearest items from a list
 * @param {Array} items - Array of items with location property
 * @param {string} referenceLocation - Reference location string
 * @param {number} limit - Maximum number of results
 * @returns {Array} Nearest items with distance
 */
export const findNearest = (items, referenceLocation, limit = 5) => {
  return sortByDistance(items, referenceLocation).slice(0, limit);
};

/**
 * Calculate distance based on address matching (fallback when coordinates not available)
 * @param {Object} address1 - First address object
 * @param {Object} address2 - Second address object
 * @returns {number|null} Distance in km
 */
export const calculateAddressDistance = (address1, address2) => {
  if (!address1 || !address2 || typeof address1 !== 'object' || typeof address2 !== 'object') {
    return null;
  }

  // Same pincode = very close
  if (address1.pincode && address2.pincode && address1.pincode === address2.pincode) {
    return 0.5; // Same pincode - within 500m
  }

  // Pincode difference calculation
  if (address1.pincode && address2.pincode) {
    const pin1 = address1.pincode.toString().replace(/\D/g, '');
    const pin2 = address2.pincode.toString().replace(/\D/g, '');
    if (pin1.length === 6 && pin2.length === 6) {
      const diff = Math.abs(parseInt(pin1) - parseInt(pin2));
      if (diff > 0) {
        return Math.round(diff * 0.2 * 10) / 10; // Convert to km
      }
    }
  }

  // Same street = 1 km
  if (address1.street && address2.street) {
    const street1 = address1.street.toLowerCase().trim();
    const street2 = address2.street.toLowerCase().trim();
    if (street1 === street2 && street1.length > 0) {
      return 1;
    }
  }

  // Same area = 2 km
  if (address1.area && address2.area) {
    const area1 = address1.area.toLowerCase().trim();
    const area2 = address2.area.toLowerCase().trim();
    if (area1 === area2 && area1.length > 0) {
      return 2;
    }
  }

  // Same city = 5-8 km
  if (address1.city && address2.city) {
    const city1 = address1.city.toLowerCase().trim();
    const city2 = address2.city.toLowerCase().trim();
    if (city1 === city2 && city1.length > 0) {
      return address1.area && address2.area ? 5 : 8;
    }
  }

  // Same state = 50 km
  if (address1.state && address2.state) {
    const state1 = address1.state.toLowerCase().trim();
    const state2 = address2.state.toLowerCase().trim();
    if (state1 === state2 && state1.length > 0) {
      return 50;
    }
  }

  // Different states = 200 km
  return 200;
};
