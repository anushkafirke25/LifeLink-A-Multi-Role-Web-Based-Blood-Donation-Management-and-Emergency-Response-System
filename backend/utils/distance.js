// utils/distance.js
/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) {
    return null; // Return null if coordinates are missing
  }

  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Sort items by distance from a reference point
 * @param {Array} items - Array of items with latitude and longitude
 * @param {number} refLat - Reference latitude
 * @param {number} refLon - Reference longitude
 * @returns {Array} Sorted array with distance property added
 */
function sortByDistance(items, refLat, refLon) {
  if (!refLat || !refLon) {
    return items.map(item => ({ ...item, distance: null }));
  }

  return items
    .map(item => {
      const distance = (item.latitude && item.longitude)
        ? calculateDistance(refLat, refLon, item.latitude, item.longitude)
        : null;
      return { ...item, distance };
    })
    .sort((a, b) => {
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });
}

module.exports = {
  calculateDistance,
  sortByDistance
};

