/**
 * Haversine formula: distance in km between two points (lat/lng)
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in km
 */
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Get latitude from user/facility (supports latitude/longitude or GeoJSON geo/location)
 */
function getLat(obj) {
  if (obj && typeof obj.latitude === 'number') return obj.latitude;
  const coords = obj?.geo?.coordinates || obj?.location?.coordinates;
  if (Array.isArray(coords) && coords.length >= 2) return coords[1];
  return null;
}

/**
 * Get longitude from user/facility
 */
function getLng(obj) {
  if (obj && typeof obj.longitude === 'number') return obj.longitude;
  const coords = obj?.geo?.coordinates || obj?.location?.coordinates;
  if (Array.isArray(coords) && coords.length >= 2) return coords[0];
  return null;
}

module.exports = { haversineKm, getLat, getLng };
