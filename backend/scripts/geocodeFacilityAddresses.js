/**
 * Geocode blood banks and hospitals that have address but no latitude/longitude.
 * Uses Nominatim (OSM) - free, 1 request/sec. After running, "Use my location"
 * and Haversine will show real distances in km.
 *
 * Run: node scripts/geocodeFacilityAddresses.js
 * Set DRY_RUN=1 to only print what would be updated.
 */

const https = require('https');
const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lifelink';
const DRY_RUN = process.env.DRY_RUN === '1';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function nominatimGeocode(query) {
  return new Promise((resolve, reject) => {
    const url = `/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    const req = https.request({
      hostname: 'nominatim.openstreetmap.org',
      path: url,
      method: 'GET',
      headers: { 'User-Agent': 'LifeLink-BloodDonation/1.0 (contact@example.com)' }
    }, (res) => {
      let data = '';
      res.on('data', (ch) => { data += ch; });
      res.on('end', () => {
        try {
          const arr = JSON.parse(data);
          if (arr && arr[0] && typeof arr[0].lat === 'string' && typeof arr[0].lon === 'string') {
            resolve({ lat: parseFloat(arr[0].lat), lon: parseFloat(arr[0].lon) });
          } else {
            resolve(null);
          }
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function buildAddressQuery(addr, name) {
  const parts = [];
  if (name) parts.push(name);
  if (addr && addr.street) parts.push(addr.street);
  if (addr && addr.area) parts.push(addr.area);
  if (addr && addr.city) parts.push(addr.city);
  if (addr && addr.state) parts.push(addr.state);
  if (addr && addr.pincode) parts.push(addr.pincode);
  return parts.filter(Boolean).join(', ');
}

async function main() {
  await mongoose.connect(MONGO_URI);
  const User = require('../models/User');

  const roles = ['bloodbank', 'hospital'];
  for (const role of roles) {
    const users = await User.find({
      role,
      $and: [
        { $or: [{ latitude: null }, { latitude: { $exists: false } }, { longitude: null }, { longitude: { $exists: false } }] },
        { $or: [{ 'address.pincode': { $exists: true, $ne: '' } }, { 'address.city': { $exists: true, $ne: '' } }, { 'address.state': { $exists: true, $ne: '' } }, { 'address.street': { $exists: true, $ne: '' } }] }
      ]
    }).lean();

    console.log(`${role}: ${users.length} with address but no coordinates`);
    for (const u of users) {
      const q = buildAddressQuery(u.address, u.name);
      if (!q) continue;
      if (DRY_RUN) {
        console.log(`  [DRY] would geocode: ${u.name} -> "${q}"`);
        continue;
      }
      await sleep(1100);
      try {
        const coords = await nominatimGeocode(q);
        if (coords) {
          await User.updateOne(
            { _id: u._id },
            { $set: { latitude: coords.lat, longitude: coords.lon } }
          );
          console.log(`  ✓ ${u.name}: ${coords.lat}, ${coords.lon}`);
        } else {
          console.log(`  ✗ no result: ${u.name}`);
        }
      } catch (e) {
        console.log(`  ✗ error ${u.name}:`, e.message);
      }
    }
  }

  console.log('Done.');
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
