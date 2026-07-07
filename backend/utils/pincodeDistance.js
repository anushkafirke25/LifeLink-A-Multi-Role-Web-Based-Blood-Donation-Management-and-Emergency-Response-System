// utils/pincodeDistance.js
/**
 * Calculate distance between two pincodes
 * Uses a simple numeric difference - closer pincodes = closer distance
 * @param {string} pincode1 - First pincode
 * @param {string} pincode2 - Second pincode
 * @returns {number} Distance in "units" (lower = closer)
 */
function calculatePincodeDistance(pincode1, pincode2) {
  if (!pincode1 || !pincode2) {
    return null;
  }

  // Remove any non-numeric characters
  const pin1 = pincode1.toString().replace(/\D/g, '');
  const pin2 = pincode2.toString().replace(/\D/g, '');

  if (pin1.length !== 6 || pin2.length !== 6) {
    return null; // Invalid pincode format
  }

  // Calculate absolute difference
  const diff = Math.abs(parseInt(pin1) - parseInt(pin2));
  
  // Convert to approximate distance in km
  // Rough estimate: 1 pincode unit difference ≈ 0.1-0.5 km depending on area
  // For Indian pincodes, we'll use a simple mapping
  const distanceKm = diff * 0.2; // Adjust this multiplier based on your region
  
  return Math.round(distanceKm * 10) / 10; // Round to 1 decimal place
}

/**
 * Calculate distance based on address matching
 * Checks pincode first, then street, area, city, state
 * @param {Object} address1 - First address object
 * @param {Object} address2 - Second address object
 * @returns {number|null} Distance in km or null if cannot calculate
 */
function calculateAddressDistance(address1, address2) {
  if (!address1 || !address2) {
    return null;
  }

  // Priority 1: Pincode matching (most accurate)
  if (address1.pincode && address2.pincode) {
    const pincodeDist = calculatePincodeDistance(address1.pincode, address2.pincode);
    if (pincodeDist !== null && pincodeDist > 0) {
      return pincodeDist;
    }
    // Same pincode = very close
    if (address1.pincode === address2.pincode) {
      return 0.5; // Same pincode - within 500m
    }
  }

  // Priority 2: Same street = very close (1 km)
  if (address1.street && address2.street) {
    const street1 = address1.street.toLowerCase().trim();
    const street2 = address2.street.toLowerCase().trim();
    
    if (street1 === street2 && street1.length > 0) {
      return 1; // Same street - 1 km away
    }
  }

  // Priority 3: Same area = close (2 km)
  if (address1.area && address2.area) {
    const area1 = address1.area.toLowerCase().trim();
    const area2 = address2.area.toLowerCase().trim();
    
    if (area1 === area2 && area1.length > 0) {
      return 2; // Same area - 2 km away
    }
  }

  // Priority 4: Same city = medium distance (5-10 km)
  if (address1.city && address2.city) {
    const city1 = address1.city.toLowerCase().trim();
    const city2 = address2.city.toLowerCase().trim();
    
    if (city1 === city2 && city1.length > 0) {
      // Same city, different area
      if (address1.area && address2.area) {
        return 5; // Same city, different area - 5 km
      }
      return 8; // Same city - 8 km
    }
  }

  // Priority 5: Same state = far (50 km)
  if (address1.state && address2.state) {
    const state1 = address1.state.toLowerCase().trim();
    const state2 = address2.state.toLowerCase().trim();
    
    if (state1 === state2 && state1.length > 0) {
      return 50; // Same state, different city - 50 km
    }
  }

  // Different states = very far (200 km)
  return 200; // Different states - 200 km away
}

/**
 * Sort items by address distance from reference address
 * @param {Array} items - Array of items with address property
 * @param {Object} referenceAddress - Reference address object
 * @returns {Array} Sorted array with distance property added
 */
function sortByAddressDistance(items, referenceAddress) {
  if (!referenceAddress) {
    return items.map(item => ({ ...item, distance: null }));
  }

  return items
    .map(item => {
      const itemAddress = item.address || item.bloodBank?.address || {};
      const distance = calculateAddressDistance(referenceAddress, itemAddress);
      return { ...item, distance };
    })
    .sort((a, b) => {
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });
}

module.exports = {
  calculatePincodeDistance,
  calculateAddressDistance,
  sortByAddressDistance
};

